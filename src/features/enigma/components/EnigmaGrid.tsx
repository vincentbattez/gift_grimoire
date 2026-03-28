import { useEnigmaStore } from "../store";
import { useFinaleStore } from "../../finale/store";
import { ENIGMAS } from "../config";
import { FORGES } from "../../forges/forges.config";
import { EnigmaCard } from "./EnigmaCard";
import { ForgeSection } from "../../forges/components/ForgeSection";
import { VoiceHints } from "../../../components/voice-hints/VoiceHints";
import { AdminControls } from "../../admin/components/AdminControls";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-center text-[0.6rem] tracking-[0.35em] text-muted my-4 uppercase">
      {children}
    </div>
  );
}

function FinaleButton() {
  const enigmas = useEnigmaStore((s) => s.enigmas);
  const startNarrative = useFinaleStore((s) => s.startNarrative);
  const finaleActive = useFinaleStore((s) => s.finaleActive);
  const finaleNarrative = useFinaleStore((s) => s.finaleNarrative);
  const finaleDone = useFinaleStore((s) => s.finaleDone);
  const allSolved = Object.values(enigmas).every((e) => e.solved);

  if (!allSolved || finaleActive || finaleDone) return null;

  return (
    <div
      className="mt-12 mb-6 flex justify-center transition-opacity duration-500"
      style={{
        animation: finaleNarrative ? undefined : "finale-btn-appear 0.8s ease-out both",
        opacity: finaleNarrative ? 0 : undefined,
        pointerEvents: finaleNarrative ? "none" : undefined,
      }}
    >
      <button
        onClick={startNarrative}
        className="relative px-8 py-4 rounded-[16px] cursor-pointer border-none"
        style={{
          background: "linear-gradient(135deg, #1a1430, #2a1840, #1a1430)",
          border: "1.5px solid #e8c96a50",
          animation: finaleNarrative ? undefined : "finale-btn-pulse 3s ease-in-out infinite",
          fontFamily: "var(--font-cinzel-decorative)",
        }}
      >
        <span className="text-[0.75rem] tracking-[0.2em] uppercase" style={{ color: "var(--color-gold)", textShadow: "0 0 20px #e8c96a40" }}>
          ✦ Refermer le Grimoire ✦
        </span>
      </button>
    </div>
  );
}

function EnigmaSection({ isAdmin }: { isAdmin: boolean }) {
  const enigmas = useEnigmaStore((s) => s.enigmas);
  const solvedCount = Object.values(enigmas).filter((e) => e.solved).length;

  return (
    <>
      <SectionLabel>— Les Six Mystères Scellés —</SectionLabel>
      <FinaleButton />
      {isAdmin && <AdminControls />}
      <div className="grid grid-cols-2 gap-3">
        {ENIGMAS.map((e) => (
          <div key={e.id} data-card-id={e.id}>
            <EnigmaCard enigma={e} isAdmin={isAdmin} />
          </div>
        ))}
      </div>
      {solvedCount > 0 && (
        <div className="text-center text-[0.55rem] tracking-[0.2em] text-gold/60 mt-3">
          ✨ {solvedCount}/6 mystères percés
        </div>
      )}
    </>
  );
}

function ForgeList({ isAdmin }: { isAdmin: boolean }) {
  return (
    <>
      <SectionLabel>— La Forge des Clés —</SectionLabel>
      <p className="text-center text-[0.5rem] text-muted/40 -mt-2 mb-5 tracking-wide">
        Résolvez les épreuves pour forger de nouvelles clés
      </p>
      <div className="flex flex-col gap-10">
        {FORGES.map((forge) => (
          <ForgeSection key={forge.key} forge={forge} isAdmin={isAdmin} />
        ))}
      </div>
    </>
  );
}

export function EnigmaGrid({ isAdmin }: { isAdmin: boolean }) {
  const enigmas = useEnigmaStore((s) => s.enigmas);
  const prologueCompleted = Object.values(enigmas).some((e) => e.unlocked || e.solved);

  return (
    <>
      <SectionLabel>— Prologue —</SectionLabel>
      <VoiceHints />
      <div className="mt-12">
        <EnigmaSection isAdmin={isAdmin} />
      </div>
      {prologueCompleted && (
        <div className="mt-16">
          <ForgeList isAdmin={isAdmin} />
        </div>
      )}
    </>
  );
}
