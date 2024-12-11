import { useEffect } from 'react';

interface UseClickOutsideProps {
  isOpen: boolean;
  editorRef: React.RefObject<HTMLDivElement>;
  bubbleMenuRef: React.RefObject<HTMLElement | null>;
  onClose: () => void;
}

export function useClickOutside({
  isOpen,
  editorRef,
  bubbleMenuRef,
  onClose,
}: UseClickOutsideProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        editorRef.current &&
        !editorRef.current.contains(event.target as Node) &&
        (!bubbleMenuRef.current || !bubbleMenuRef.current.contains(event.target as Node))
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, editorRef, bubbleMenuRef, onClose]);
}
