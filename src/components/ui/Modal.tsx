import { useCallback, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  children: ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  zIndex?: number;
  maxWidth?: string;
  closeOnBackdrop?: boolean;
  className?: string;
  style?: React.CSSProperties;
  duration?: number;
  backdropClassName?: string;
};

export function Modal({
  children,
  isOpen,
  onClose,
  zIndex = 200,
  maxWidth = "360px",
  closeOnBackdrop = true,
  className = "",
  style,
  duration = 300,
  backdropClassName = "bg-black/85 backdrop-blur-md",
}: ModalProps): React.ReactPortal | null {
  const [isVisible, setIsVisible] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true); // eslint-disable-line react-hooks/set-state-in-effect -- intentional two-phase animation patternList
      const raf = requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          setHasEntered(true);
        }),
      );

      return () => {
        cancelAnimationFrame(raf);
      };
    }
    setHasEntered(false);
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen, duration]);

  const handleBackdropClick = useCallback(() => {
    if (closeOnBackdrop && onClose) {
      onClose();
    }
  }, [closeOnBackdrop, onClose]);

  if (!isVisible) {
    return null;
  }

  return createPortal(
    <div
      className={`fixed inset-0 flex items-center justify-center transition-opacity ${backdropClassName} ${hasEntered ? "opacity-100" : "opacity-0"}`}
      style={{ zIndex, transitionDuration: `${String(duration)}ms` }}
      role="presentation"
      onClick={handleBackdropClick}
    >
      <div
        className={`mx-4 w-full rounded-[18px] border transition-all ${hasEntered ? "scale-100 opacity-100" : "scale-95 opacity-0"} ${className}`}
        style={{
          maxWidth,
          transitionDuration: `${String(duration)}ms`,
          transitionTimingFunction: "cubic-bezier(.34,1.56,.64,1)",
          ...style,
        }}
        role="presentation"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
