import { INK_CONFIG } from "./ink-config";

interface InkDropIndicatorProps {
  dropsLeft: number;
}

export function InkDropIndicator({ dropsLeft }: InkDropIndicatorProps) {
  return (
    <>
      <div className="text-center text-[0.4rem] tracking-[0.2em] text-muted/30 uppercase mb-2">
        Gouttes restantes
      </div>
      <div className="flex justify-center gap-3 mb-5">
        {Array.from({ length: INK_CONFIG.maxDrops }, (_, i) => (
          <div
            key={i}
            className={`relative overflow-hidden transition-all duration-500 ${
              i < dropsLeft
                ? dropsLeft === 1
                  ? "ink-drop-last"
                  : "ink-drop-active"
                : ""
            }`}
            style={{
              width: 16,
              height: 23,
              borderRadius: "50% 50% 50% 50% / 30% 30% 70% 70%",
              background:
                i < dropsLeft
                  ? "linear-gradient(160deg, #caaeff 0%, #9b6dff 45%, #6e38cc 100%)"
                  : "linear-gradient(160deg, #1a1230, #0e0b1c)",
            }}
          >
            {i < dropsLeft && (
              <span
                className="absolute rounded-full"
                style={{
                  width: "32%",
                  height: "18%",
                  top: "16%",
                  left: "22%",
                  background: "rgba(255,255,255,0.3)",
                  transform: "rotate(-30deg)",
                  borderRadius: "50%",
                }}
              />
            )}
          </div>
        ))}
      </div>
    </>
  );
}
