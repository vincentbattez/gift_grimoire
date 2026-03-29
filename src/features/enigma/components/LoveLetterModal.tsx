import { useEffect, useRef, useState } from "react";
import { sndHeartPop, sndLoveClose } from "@/audio";
import { randomVisual } from "@/utils/random";
import { CornerOrnaments } from "@components/ui/CornerOrnaments";
import { OrnamentDivider } from "@components/ui/OrnamentDivider";
import { ENIGMA_LIST } from "@features/enigma/config";
import { useEnigmaStore } from "@features/enigma/store";

const CLOSE_MS = 500;
const BURST_COUNT = 40;

function buildBurst(
  emojis: string[],
): { emoji: string; left: number; delay: number; size: number; rot: number; pitch: number }[] {
  const itemList: { emoji: string; left: number; delay: number; size: number; rot: number; pitch: number }[] = [];
  let cumDelay = 0.15;
  let gap = 0.2;
  for (let i = 0; i < BURST_COUNT; i++) {
    itemList.push({
      emoji: emojis[i % emojis.length],
      left: 10 + randomVisual() * 80,
      delay: cumDelay,
      size: 1.75 + randomVisual() * 0.55,
      rot: -20 + randomVisual() * 40,
      pitch: -300 + randomVisual() * 600,
    });
    cumDelay += gap;
    gap *= 0.97;
  }

  return itemList;
}

const GOLD_PARTICLE_LIST = Array.from({ length: 20 }, (_, i) => ({
  left: `${String(5 + (i % 5) * 22)}%`,
  top: `${String(Math.floor(i / 5) * 23 + 5)}%`,
  size: 2 + (i % 3) * 1.5,
  delay: i * 0.35,
}));

export function LoveLetterModal(): React.JSX.Element {
  const enigmaId = useEnigmaStore((s) => s.loveLetterEnigmaId);
  const closeLoveLetter = useEnigmaStore((s) => s.closeLoveLetter);
  const [hasEntered, setHasEntered] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isShowingHearts, setIsShowingHearts] = useState(false);
  const closingEnigmaRef = useRef<string | null>(null);
  const popTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [burstDataList, setBurstData] = useState(() => buildBurst(["❤️"]));

  useEffect(() => {
    if (!enigmaId) {
      setHasEntered(false);
      setIsShowingHearts(false);

      return;
    }
    closingEnigmaRef.current = enigmaId;
    const currentEnigma = ENIGMA_LIST.find((e) => e.id === enigmaId);
    const newBurstList = buildBurst(currentEnigma?.loveLetter.emojis ?? ["❤️"]);
    setBurstData(newBurstList);
    setIsClosing(false);
    const raf = requestAnimationFrame(() => {
      setHasEntered(true);
    });

    // Launch heart burst with staggered pops
    const showTimer = setTimeout(() => {
      setIsShowingHearts(true);
    }, 400);

    popTimers.current = newBurstList.map((h) =>
      setTimeout(
        () => {
          sndHeartPop(h.pitch);
        },
        h.delay * 1000 + 400,
      ),
    );

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(showTimer);

      popTimers.current.forEach((t) => {
        clearTimeout(t);
      });
    };
  }, [enigmaId]);

  // eslint-disable-next-line react-hooks/refs
  const displayId = enigmaId ?? (isClosing ? closingEnigmaRef.current : null);
  // eslint-disable-next-line react-hooks/refs
  const enigma = displayId ? ENIGMA_LIST.find((e) => e.id === displayId) : null;
  const isOpen = !!enigmaId && !isClosing;

  function handleClose(): void {
    sndLoveClose();
    setIsClosing(true);
    setHasEntered(false);

    setTimeout(() => {
      setIsClosing(false);
      closeLoveLetter();
    }, CLOSE_MS);
  }

  return (
    <div
      className={`itemList-center fixed inset-0 z-[120] flex justify-center p-4 transition-opacity duration-500 ${
        isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      style={{
        background: "radial-gradient(ellipse at 50% 40%, #e8c96a18, #00000090)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
      role="presentation"
      onClick={handleClose}
    >
      {/* Heart burst */}
      {}
      {isShowingHearts &&
        burstDataList.map((h, i) => (
          <div
            key={i}
            className="pointer-events-none absolute z-10"
            style={{
              left: `${String(h.left)}%`,
              bottom: "20%",
              fontSize: `${String(h.size)}rem`,
              ["--heart-rot" as string]: `${String(h.rot)}deg`,
              animation: `heart-float-up 3.5s linear ${String(h.delay)}s both`,
            }}
          >
            {h.emoji}
          </div>
        ))}

      {enigma && (
        <div
          className={`relative w-full max-w-[380px] overflow-hidden rounded-[22px] transition-all duration-700 ${
            hasEntered ? "translate-y-0 scale-100 opacity-100" : "translate-y-5 scale-[0.82] opacity-0"
          }`}
          style={{
            background: "linear-gradient(165deg, #fdf8ec, #f5e6c8, #ede0c0)",
            border: "1.5px solid #d4a94280",
            boxShadow: "0 0 30px #e8c96a50, 0 0 80px #e8c96a30, 0 0 160px #e8c96a18, inset 0 1px 0 #ffffff60",
            animation: "love-glow-shine 4s ease-in-out infinite",
            transitionTimingFunction: "cubic-bezier(.22,1,.36,1)",
          }}
          role="presentation"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {/* Gold particleList background */}
          {GOLD_PARTICLE_LIST.map((p, i) => (
            <div
              key={i}
              className="pointer-events-none absolute rounded-full"
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                background: "radial-gradient(circle, #e8c96a, #c9a032)",
                animation: `love-particle-float 3.2s ease-in-out ${String(p.delay)}s infinite`,
              }}
            />
          ))}

          {/* Corner decorations */}
          <CornerOrnaments
            color="border-[#c9a03260]"
            size="w-3 h-3"
            offset="10px"
            opacity="opacity-60"
            cornerList={["tl", "bl", "br"]}
          />

          {/* Close button */}
          <button
            onClick={handleClose}
            className="itemList-center absolute top-3 right-3 z-20 flex h-[28px] w-[28px] cursor-pointer justify-center rounded-full border border-[#c9a03230] bg-[#f5e6c8] text-[0.75rem] text-[#8a7040] transition-colors hover:bg-[#ede0c0]"
          >
            ✕
          </button>

          <div className="relative z-10 px-7 pt-8 pb-9">
            {/* Character icon */}
            <div
              className="mb-2 text-center text-[2.8rem] leading-none"
              style={{
                filter: "drop-shadow(0 0 12px #c9a03240)",
              }}
            >
              {enigma.icon}
            </div>

            {/* Title */}
            <h2
              className="mb-1 text-center text-[1rem] font-semibold tracking-[0.06em]"
              style={{
                fontFamily: "var(--font-cinzel-decorative)",
                color: "#8a6a20",
                textShadow: "0 0 20px #e8c96a30",
              }}
            >
              Une lettre pour toi
            </h2>

            <p className="mb-5 text-center text-[0.68rem] tracking-[0.15em] uppercase" style={{ color: "#a08a50" }}>
              {enigma.title}
            </p>

            {/* Gold separator */}
            <OrnamentDivider className="mb-5" />

            {/* Message */}
            <div
              className="mb-6 text-center text-[0.84rem] leading-[1.75] whitespace-pre-line"
              style={{
                fontFamily: "var(--font-cinzel)",
                color: "#4a3a20",
              }}
            >
              {enigma.loveLetter.message}
            </div>

            {/* Gold separator */}
            <OrnamentDivider className="mb-5" />

            {/* Signature */}
            <p
              className="text-center text-[0.76rem] tracking-wide italic"
              style={{
                fontFamily: "var(--font-cinzel)",
                color: "#8a6a20",
              }}
            >
              — {enigma.loveLetter.signature} —
            </p>
            <p className="mt-2 text-center text-[0.65rem] tracking-[0.12em]" style={{ color: "#b09a60" }}>
              Avec tout mon amour ♡
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
