import { useEffect, useRef } from "react";
import { createRoot, Root } from "react-dom/client";

export const Html = ({ children, container }: any) => {
  const containerRef = useRef<HTMLDivElement>(document.createElement("div"));
  const rootRef = useRef<Root | null>(null);

  useEffect(() => {
    if (!container) return;

    // Append the container to the Stage's parent container if not already present
    if (!container.contains(containerRef.current)) {
      container.appendChild(containerRef.current);
    }

    if (!rootRef.current) {
      rootRef.current = createRoot(containerRef.current);
    }

    rootRef.current.render(<>{children}</>);

    return () => {
      if (rootRef.current) {
        rootRef.current.unmount();
        rootRef.current = null;
      }

      if (containerRef.current && container.contains(containerRef.current)) {
        container.removeChild(containerRef.current);
      }
    }
  }, [container]);

  return null;
};
