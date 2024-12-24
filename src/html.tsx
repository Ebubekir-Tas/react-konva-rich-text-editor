import { useEffect, useRef } from 'react';
import { createRoot, Root } from 'react-dom/client';

interface HtmlProps {
	children: React.ReactNode;
	container: Element | null;
};

export const Html: React.FC<HtmlProps> = ({ children, container }) => {
	const containerRef = useRef<HTMLDivElement>(document.createElement("div"));
	const rootRef = useRef<Root | null>(null);

	useEffect(() => {
		if (!container) return;

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