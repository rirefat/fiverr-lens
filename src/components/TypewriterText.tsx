import { useEffect, useState } from "react";

interface TypewriterTextProps {
  text: string;
  speedMs?: number;
  onComplete?: () => void;
}

/**
 * A reusable React component that displays text one character at a time,
 * simulating a typewriter. Users can click the text to instantly skip the animation.
 */
export function TypewriterText({
  text,
  speedMs = 12,
  onComplete,
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSkipped, setIsSkipped] = useState(false);

  useEffect(() => {
    setDisplayedText("");
    setCurrentIndex(0);
    setIsSkipped(false);
  }, [text]);

  useEffect(() => {
    if (isSkipped) {
      setDisplayedText(text);
      setCurrentIndex(text.length);
      onComplete?.();
      return;
    }

    if (currentIndex < text.length) {
      const calculatedSpeed = Math.max(
        3,
        Math.min(speedMs, Math.floor(1200 / text.length)),
      );
      const step = text.length > 300 ? Math.ceil(text.length / 150) : 1;

      const timeout = setTimeout(() => {
        const nextIndex = Math.min(currentIndex + step, text.length);
        setDisplayedText(text.slice(0, nextIndex));
        setCurrentIndex(nextIndex);
      }, calculatedSpeed);
      return () => clearTimeout(timeout);
    } else {
      onComplete?.();
    }
  }, [currentIndex, text, speedMs, isSkipped, onComplete]);

  return (
    <span
      onClick={() => setIsSkipped(true)}
      title="Click to instantly skip typing"
      className="cursor-pointer select-text relative"
    >
      {displayedText}
      {currentIndex < text.length && !isSkipped && (
        <span className="inline-block w-[3.5px] h-[13px] bg-indigo-500 ml-1 animate-pulse rounded-full align-middle" />
      )}
    </span>
  );
}
