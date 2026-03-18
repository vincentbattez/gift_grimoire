import { useEffect, useState } from "react";
import { useStore } from "../store";
import { ENIGMAS } from "../config";
import { sndClick } from "../audio";

const LOVE_LETTERS: Record<string, { signature: string; message: string }> = {
  bruno: {
    signature: "Celle qui voit l'invisible",
    message:
      "Comme Bruno, tu possèdes ce don rare de voir au-delà des apparences. Là où les autres regardent, toi tu observes. Là où les autres entendent, toi tu écoutes vraiment.\n\nOn ne comprend pas toujours ta profondeur, et parfois ça te pèse — mais c'est exactement cette sensibilité qui fait de toi quelqu'un d'irremplaçable.\n\nTu es mon cadre doré, celle qui voit l'invisible et qui rend visible l'essentiel.",
  },
  raiponce: {
    signature: "Mon plus beau rêve éveillé",
    message:
      "Tu es ma Raiponce. Il y a en toi cette lumière que rien ne peut éteindre, cette curiosité qui transforme chaque jour en aventure.\n\nTu rêves les yeux ouverts, et le plus beau, c'est que tes rêves donnent envie aux autres de rêver aussi.\n\nChaque moment avec toi ressemble à ces lanternes qui s'élèvent dans le ciel — un émerveillement qui ne vieillit jamais. Tu es mon plus beau rêve, celui que je vis éveillé.",
  },
  luisa: {
    signature: "Ta force la plus belle",
    message:
      "Comme Luisa, tu portes le monde avec grâce. Tu es toujours là pour les autres, la première à tendre la main, la dernière à montrer que parfois, toi aussi, tu fatigues.\n\nMais je veux que tu saches quelque chose : avec moi, tu n'as pas besoin d'être forte. Tu peux tout poser.\n\nTa vulnérabilité n'est pas une faiblesse — c'est ta plus grande beauté. Et je serai toujours là pour porter avec toi.",
  },
  eve: {
    signature: "Chaque matin, je te choisis",
    message:
      "Comme EVE, tu as cette grâce qui me désarme à chaque fois. Tu es brillante, déterminée, capable de tout — et pourtant, c'est dans tes gestes les plus doux que je te reconnais le mieux.\n\nUn regard, un sourire, une main posée sur la mienne.\n\nTu m'as appris que l'amour n'est pas écrit dans un programme — c'est un choix qu'on fait chaque matin. Et chaque matin, mon cœur te choisit.",
  },
  mirabel: {
    signature: "Le plus beau don qui existe",
    message:
      "Tu es Mirabel. Tu n'as besoin d'aucun pouvoir magique pour être extraordinaire — tu l'es dans chaque regard attentif, chaque mot juste, chaque moment où tu vois ce que personne d'autre ne voit.\n\nTu es celle qui répare les fissures invisibles, qui tient tout ensemble par la seule force de son cœur.\n\nEt ça, mon amour, c'est le plus beau don qui existe.",
  },
  "wall-e": {
    signature: "Ma plus belle petite chose",
    message:
      "Comme Wall-E, tu me rappelles que l'amour, c'est simple. C'est être là, juste là, à côté de l'autre. Pas besoin d'être parfait, pas besoin de tout comprendre.\n\nJuste être présent, avec cette maladresse magnifique qui me fait fondre à chaque fois.\n\nTu m'as appris à voir la beauté dans les petites choses. Et la plus belle de toutes ces petites choses, c'est toi.",
  },
};

const GOLD_PARTICLES = Array.from({ length: 10 }, (_, i) => ({
  left: `${8 + i * 9}%`,
  top: `${6 + (i % 4) * 24}%`,
  size: 2 + (i % 3) * 1.5,
  delay: i * 0.35,
}));

export function LoveLetterModal() {
  const enigmaId = useStore((s) => s.loveLetterEnigmaId);
  const closeLoveLetter = useStore((s) => s.closeLoveLetter);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!enigmaId) {
      setEntered(false);
      return;
    }
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [enigmaId]);

  const enigma = enigmaId ? ENIGMAS.find((e) => e.id === enigmaId) : null;
  const letter = enigma ? LOVE_LETTERS[enigma.answer] : null;

  function handleClose() {
    sndClick();
    closeLoveLetter();
  }

  return (
    <div
      className={`fixed inset-0 z-[120] flex items-center justify-center p-4 transition-opacity duration-500 ${
        enigmaId ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      style={{
        background: "radial-gradient(ellipse at 50% 40%, #e8c96a18, #00000090)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        ...(enigmaId && { animation: "love-letter-overlay-in 0.5s ease-out" }),
      }}
      onClick={handleClose}
    >
      {enigma && letter && (
        <div
          className={`relative max-w-[380px] w-full rounded-[22px] overflow-hidden transition-all duration-600 ${
            entered ? "opacity-100 scale-100" : "opacity-0 scale-[0.82]"
          }`}
          style={{
            background: "linear-gradient(165deg, #fdf8ec, #f5e6c8, #ede0c0)",
            border: "1.5px solid #d4a94280",
            boxShadow:
              "0 0 50px #e8c96a30, 0 0 100px #e8c96a15, inset 0 1px 0 #ffffff60",
            transitionTimingFunction: "cubic-bezier(.34,1.56,.64,1)",
            ...(entered && { animation: "love-letter-enter 0.7s ease-out" }),
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Gold particles background */}
          {GOLD_PARTICLES.map((p, i) => (
            <div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                background: "radial-gradient(circle, #e8c96a, #c9a032)",
                animation: `love-particle-float 3.2s ease-in-out ${p.delay}s infinite`,
              }}
            />
          ))}

          {/* Corner decorations */}
          <div className="absolute top-[10px] left-[10px] w-3 h-3 border-t border-l border-[#c9a03260] opacity-60" />
          <div className="absolute top-[10px] right-[10px] w-3 h-3 border-t border-r border-[#c9a03260] opacity-60" />
          <div className="absolute bottom-[10px] left-[10px] w-3 h-3 border-b border-l border-[#c9a03260] opacity-60" />
          <div className="absolute bottom-[10px] right-[10px] w-3 h-3 border-b border-r border-[#c9a03260] opacity-60" />

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 w-[28px] h-[28px] rounded-full flex items-center justify-center cursor-pointer text-[0.75rem] z-10 border border-[#c9a03230] bg-[#f5e6c8] text-[#8a7040] hover:bg-[#ede0c0] transition-colors"
          >
            ✕
          </button>

          <div className="relative px-7 pt-8 pb-9">
            {/* Character icon */}
            <div
              className="text-[2.8rem] text-center mb-2 leading-none"
              style={{
                filter: "drop-shadow(0 0 12px #c9a03240)",
              }}
            >
              {enigma.icon}
            </div>

            {/* Title */}
            <h2
              className="text-center text-[1rem] font-semibold mb-1 tracking-[0.06em]"
              style={{
                fontFamily: "var(--font-cinzel-decorative)",
                color: "#8a6a20",
                textShadow: "0 0 20px #e8c96a30",
              }}
            >
              Une lettre pour toi
            </h2>

            <p
              className="text-center text-[0.68rem] tracking-[0.15em] uppercase mb-5"
              style={{ color: "#a08a50" }}
            >
              {enigma.title}
            </p>

            {/* Gold separator */}
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#c9a03240]" />
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "radial-gradient(circle, #e8c96a, #c9a032)" }}
              />
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#c9a03240]" />
            </div>

            {/* Message */}
            <div
              className="text-[0.84rem] leading-[1.75] text-center whitespace-pre-line mb-6"
              style={{
                fontFamily: "var(--font-cinzel)",
                color: "#4a3a20",
              }}
            >
              {letter.message}
            </div>

            {/* Gold separator */}
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#c9a03240]" />
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "radial-gradient(circle, #e8c96a, #c9a032)" }}
              />
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#c9a03240]" />
            </div>

            {/* Signature */}
            <p
              className="text-center text-[0.76rem] italic tracking-wide"
              style={{
                fontFamily: "var(--font-cinzel)",
                color: "#8a6a20",
              }}
            >
              — {letter.signature} —
            </p>
            <p
              className="text-center text-[0.65rem] mt-2 tracking-[0.12em]"
              style={{ color: "#b09a60" }}
            >
              Avec tout mon amour ♡
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
