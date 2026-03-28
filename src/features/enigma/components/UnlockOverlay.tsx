import { useEffect, useCallback, useRef, useState } from "react";
import { useEnigmaStore } from "../store";
import { ENIGMAS } from "../config";
import { sndKeyInsert, sndLockOpen, sndUnlock, sndAmbientTension, sndClick } from "../../../audio";
import { spawnParticles } from "../../../particles";
import { triggerUnlockReveal } from "../unlock";
import { LockIcon } from "../../../components/LockIcon";

/** Distance (px) at which the key snaps into the keyhole */
const SNAP_THRESHOLD = 60;
const FRAG_DISTANCES = Array.from({ length: 8 }, () => 80 + Math.random() * 40);

type Phase = "drag" | "unlocking" | "done";

export function UnlockOverlay() {
  const unlockingId = useEnigmaStore((s) => s.unlockingCardId);
  const unlockingTitle = useEnigmaStore((s) => s.unlockingTitle);
  const clearUnlocking = useEnigmaStore((s) => s.clearUnlocking);

  const [phase, setPhase] = useState<Phase>("drag");
  const [keyPos, setKeyPos] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [proximity, setProximity] = useState(0); // 0-1, how close to keyhole
  const [sceneVisible, setSceneVisible] = useState(true);

  const stopAmbientRef = useRef<(() => void) | null>(null);
  const keyholeRef = useRef<SVGCircleElement>(null);
  const lockSvgRef = useRef<SVGSVGElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const prevIdRef = useRef<string | null>(null);

  // Refs to avoid stale closures in setTimeout callbacks
  const unlockingIdRef = useRef(unlockingId);
  const unlockingTitleRef = useRef(unlockingTitle);

  // Reset state when a new unlock starts and sync refs
  useEffect(() => {
    unlockingIdRef.current = unlockingId;
    unlockingTitleRef.current = unlockingTitle;
    if (unlockingId && unlockingId !== prevIdRef.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase("drag");
      setKeyPos(null);
      setDragging(false);
      setProximity(0);
      setSceneVisible(true);
    }
    prevIdRef.current = unlockingId;
  }, [unlockingId, unlockingTitle]);

  // Ambient drone while overlay is visible
  useEffect(() => {
    if (!unlockingId) return;
    stopAmbientRef.current = sndAmbientTension();
    return () => {
      stopAmbientRef.current?.();
      stopAmbientRef.current = null;
    };
  }, [unlockingId]);

  const getKeyholeCenter = useCallback((): { x: number; y: number } | null => {
    if (!keyholeRef.current || !lockSvgRef.current) return null;
    const svgRect = lockSvgRef.current.getBoundingClientRect();
    // Keyhole glow is at SVG coords (20, 32) in viewBox 40x48
    const scaleX = svgRect.width / 40;
    const scaleY = svgRect.height / 48;
    return {
      x: svgRect.left + 20 * scaleX,
      y: svgRect.top + 32 * scaleY,
    };
  }, []);

  const getDistToKeyhole = useCallback((px: number, py: number) => {
    const kh = getKeyholeCenter();
    if (!kh) return Infinity;
    return Math.hypot(px - kh.x, py - kh.y);
  }, [getKeyholeCenter]);

  // ── Drag handlers (touch + mouse) ──

  const onDragStart = useCallback((clientX: number, clientY: number, elRect: DOMRect) => {
    if (phase !== "drag") return;
    dragOffset.current = {
      x: clientX - elRect.left - elRect.width / 2,
      y: clientY - elRect.top - elRect.height / 2,
    };
    setDragging(true);
    sndClick();
  }, [phase]);

  const onDragMove = useCallback((clientX: number, clientY: number) => {
    if (phase !== "drag") return;
    const x = clientX - dragOffset.current.x;
    const y = clientY - dragOffset.current.y;
    setKeyPos({ x, y });

    const dist = getDistToKeyhole(x, y);
    setProximity(Math.max(0, Math.min(1, 1 - dist / 200)));
  }, [phase, getDistToKeyhole]);

  // ── Unlock sequence after snap ──

  const triggerUnlockSequence = useCallback((keyholeCenter: { x: number; y: number }) => {
    // 0ms — key insert click
    sndKeyInsert();
    navigator.vibrate?.(30);

    // 600ms — key rotate (handled by CSS class)
    // 1100ms — lock open sound
    const t1 = setTimeout(() => {
      sndLockOpen();
      navigator.vibrate?.(50);
    }, 1100);

    // 1600ms — burst + unlock
    const t2 = setTimeout(() => {
      sndUnlock();
      stopAmbientRef.current?.();
      stopAmbientRef.current = null;
      navigator.vibrate?.(200);

      // Particles
      spawnParticles(keyholeCenter.x, keyholeCenter.y, 50, "#9b6dff");
      setTimeout(() => spawnParticles(keyholeCenter.x, keyholeCenter.y, 40, "#e8c96a"), 150);

      // Read from refs to avoid stale closure
      const id = unlockingIdRef.current;
      if (id) {
        triggerUnlockReveal(id);
      }

      setPhase("done");
      // Hide lock/keyhole scene after a short dissolve, well before overlay fades
      setTimeout(() => setSceneVisible(false), 500);
      setTimeout(() => clearUnlocking(), 3000);
    }, 1600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [clearUnlocking]);

  const onDragEnd = useCallback((clientX: number, clientY: number) => {
    if (phase !== "drag") return;
    setDragging(false);

    const dist = getDistToKeyhole(clientX - dragOffset.current.x, clientY - dragOffset.current.y);

    if (dist < SNAP_THRESHOLD) {
      // Snap to keyhole — offset so the teeth (bottom of key) align with the keyhole.
      // Key SVG is 150px tall, teeth are at ~83%. With translate(-50%,-50%) the center
      // is at 75px. Teeth offset from center = 150*0.83 - 75 = 50px.
      // So we position the key 50px above the keyhole.
      const kh = getKeyholeCenter();
      if (kh) {
        setKeyPos({ x: kh.x, y: kh.y - 50 });
        setPhase("unlocking");
        triggerUnlockSequence(kh);
      }
    } else {
      // Spring back
      setKeyPos(null);
      setProximity(0);
    }
  }, [phase, getDistToKeyhole, getKeyholeCenter, triggerUnlockSequence]);

  // Mouse handlers
  const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    onDragStart(e.clientX, e.clientY, rect);

    const onMove = (ev: MouseEvent) => onDragMove(ev.clientX, ev.clientY);
    const onUp = (ev: MouseEvent) => {
      onDragEnd(ev.clientX, ev.clientY);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [onDragStart, onDragMove, onDragEnd]);

  // Touch handlers
  const onTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const t = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    onDragStart(t.clientX, t.clientY, rect);
  }, [onDragStart]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    onDragMove(t.clientX, t.clientY);
  }, [onDragMove]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const t = e.changedTouches[0];
    onDragEnd(t.clientX, t.clientY);
  }, [onDragEnd]);

  if (!unlockingId) return null;

  // Key resting position (bottom center)
  const restX = typeof window !== "undefined" ? window.innerWidth / 2 : 200;
  const restY = typeof window !== "undefined" ? window.innerHeight - 120 : 600;
  const currentX = keyPos?.x ?? restX;
  const currentY = keyPos?.y ?? restY;

  const isUnlocking = phase === "unlocking";
  const isDone = phase === "done";

  return (
    <div
      ref={overlayRef}
      className="unlock-overlay"
      style={{
        animation: isDone
          ? "unlock-ov-in 0.5s ease-out forwards, unlock-ov-out 0.8s ease-in 2.2s forwards"
          : "unlock-ov-in 0.5s ease-out forwards",
      }}
    >
      {/* Lock */}
      <div
        className="unlock-scene"
        style={{
          opacity: sceneVisible ? 1 : 0,
          transform: sceneVisible ? "scale(1)" : "scale(1.2)",
          filter: sceneVisible ? "none" : "blur(6px)",
          transition: "opacity 0.4s ease-out, transform 0.4s ease-out, filter 0.4s ease-out",
        }}
      >
        <LockIcon
          id="ul"
          width={120}
          height={144}
          orbit={false}
          overflow
          svgRef={lockSvgRef}
          keyholeRef={keyholeRef}
          unlock={{ phase, proximity }}
        />

        {/* Shatter fragments */}
        {isDone && [...Array(8)].map((_, i) => (
          <div
            key={i}
            className="unlock-fragment is-flying"
            style={{
              "--frag-angle": `${(360 / 8) * i}deg`,
              "--frag-dist": `${FRAG_DISTANCES[i]}px`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Hint text */}
      {phase === "drag" && (
        <div className="unlock-hint">
          Glisse la clé dans la serrure
        </div>
      )}

      {/* Enigma reveal after unlock */}
      {isDone && (() => {
        const enigma = ENIGMAS.find((e) => e.id === unlockingId);
        return (
          <div className="unlock-reveal is-visible">
            <div className="unlock-reveal-label">
              Énigme {enigma?.id}
            </div>
            <div className="unlock-reveal-icon">
              {enigma?.icon}
            </div>
            <div className="unlock-reveal-title">
              {unlockingTitle}
            </div>
          </div>
        );
      })()}

      {/* Draggable key */}
      {!isDone && (
        <div
          className={`unlock-key-draggable ${dragging ? "is-dragging" : ""} ${isUnlocking ? "is-inserted" : ""}`}
          style={{
            left: currentX,
            top: currentY,
            // Glow increases with proximity
            filter: `drop-shadow(0 0 ${8 + proximity * 20}px rgba(232, 201, 106, ${0.4 + proximity * 0.6}))`,
          }}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <svg viewBox="0 0 40 120" width="50" height="150" fill="none" overflow="visible">
            <defs>
              <filter id="keyGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <g filter="url(#keyGlow)">
              <circle cx="20" cy="16" r="12" stroke="#e8c96a" strokeWidth="3" fill="none" />
              <circle cx="20" cy="16" r="5" stroke="#e8c96a" strokeWidth="2" fill="none" />
              <line x1="20" y1="28" x2="20" y2="100" stroke="#e8c96a" strokeWidth="3" strokeLinecap="round" />
              <line x1="20" y1="80" x2="30" y2="80" stroke="#e8c96a" strokeWidth="3" strokeLinecap="round" />
              <line x1="20" y1="90" x2="28" y2="90" stroke="#e8c96a" strokeWidth="3" strokeLinecap="round" />
              <line x1="20" y1="100" x2="26" y2="100" stroke="#e8c96a" strokeWidth="3" strokeLinecap="round" />
            </g>
          </svg>
        </div>
      )}
    </div>
  );
}
