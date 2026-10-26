'use client';

import { useEffect, useState } from 'react';

interface TextTypeProps {
  text: string[];
  typingSpeed?: number;
  pauseDuration?: number;
  deletingSpeed?: number;
  showCursor?: boolean;
  cursorCharacter?: React.ReactNode;
  cursorBlinkDuration?: number;
}

// Types each string, pauses, deletes it, then moves on to the next (looping).
const TextType = ({
  text,
  typingSpeed = 50,
  pauseDuration = 2000,
  deletingSpeed = 30,
  showCursor = true,
  cursorCharacter = '|',
  cursorBlinkDuration = 0.5,
}: TextTypeProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const currentText = text[textIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (isDeleting) {
      if (displayedText === '') {
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % text.length);
        return;
      }

      timeout = setTimeout(() => {
        setDisplayedText((prev) => prev.slice(0, -1));
      }, deletingSpeed);
    } else if (displayedText.length < currentText.length) {
      timeout = setTimeout(() => {
        setDisplayedText(currentText.slice(0, displayedText.length + 1));
      }, typingSpeed);
    } else {
      timeout = setTimeout(() => setIsDeleting(true), pauseDuration);
    }

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, textIndex, text, typingSpeed, deletingSpeed, pauseDuration]);

  return (
    <div className="inline-block whitespace-pre-wrap tracking-tight">
      <span className="inline">{displayedText}</span>
      {showCursor && (
        <span
          className="ml-1 inline-block"
          style={{
            animation: `cursor-blink ${cursorBlinkDuration}s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite alternate`,
          }}
        >
          {cursorCharacter}
        </span>
      )}
    </div>
  );
};

export default TextType;
