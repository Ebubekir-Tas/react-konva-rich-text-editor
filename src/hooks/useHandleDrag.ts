import { useState, useEffect, useCallback } from 'react';
import { InternalEditorEl } from '../types';
interface UseHandleDragProps {
  editorEl: InternalEditorEl;
  setEditorEl: React.Dispatch<React.SetStateAction<InternalEditorEl>>;
  containerSelector?: string;
}

export function useHandleDrag({
  editorEl,
  setEditorEl,
  containerSelector = '.konvajs-content',
}: UseHandleDragProps) {
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (event: React.MouseEvent) => {
    const stageContainer = document.querySelector(containerSelector);
    if (!stageContainer) return;

    const stageRect = stageContainer.getBoundingClientRect();
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || 0;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
    const overlayX = stageRect.left + scrollLeft + editorEl.x;
    const overlayY = stageRect.top + scrollTop + editorEl.y;

    setDragging(true);
    const offsetX = event.clientX - overlayX;
    const offsetY = event.clientY - overlayY;
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (dragging) {
        const stageContainer = document.querySelector(containerSelector);
        if (!stageContainer) return;

        const stageRect = stageContainer.getBoundingClientRect();
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || 0;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;

        const newX = event.clientX - dragOffset.x - stageRect.left - scrollLeft;
        const newY = event.clientY - dragOffset.y - stageRect.top - scrollTop;

        setEditorEl((prev: any) => ({
          ...prev,
          x: newX,
          y: newY,
        }));
      }
    },
    [dragging, dragOffset, setEditorEl, containerSelector]
  );

  const handleMouseUp = useCallback(() => {
    if (dragging) {
      setDragging(false);
    }
  }, [dragging]);

  useEffect(() => {
    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, handleMouseMove, handleMouseUp]);

  return { handleMouseDown };
}