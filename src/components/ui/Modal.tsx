import { type ReactNode, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
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
}

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
}: ModalProps) {
  const [visible, setVisible] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      const raf = requestAnimationFrame(() =>
        requestAnimationFrame(() => setEntered(true)),
      );
      return () => cancelAnimationFrame(raf);
    }
    setEntered(false);
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [isOpen, duration]);

  const handleBackdropClick = useCallback(() => {
    if (closeOnBackdrop && onClose) onClose();
  }, [closeOnBackdrop, onClose]);

  if (!visible) return null;

  return createPortal(
    <div
      className={`fixed inset-0 flex items-center justify-center transition-opacity ${backdropClassName} ${entered ? "opacity-100" : "opacity-0"}`}
      style={{ zIndex, transitionDuration: `${duration}ms` }}
      onClick={handleBackdropClick}
    >
      <div
        className={`w-full mx-4 rounded-[18px] border transition-all ${entered ? "scale-100 opacity-100" : "scale-95 opacity-0"} ${className}`}
        style={{ maxWidth, transitionDuration: `${duration}ms`, transitionTimingFunction: "cubic-bezier(.34,1.56,.64,1)", ...style }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
