import React, {
	useState,
	useEffect,
	Dispatch,
	SetStateAction,
	useRef,
} from "react";
import { EditorContent, useEditor, Editor } from "@tiptap/react";
import Toolbar from "./Toolbar";
import {
	extensions,
	defaultToolbarOptions,
	CustomParagraph,
} from "../constants";

interface EditorEl {
	x: number;
	y: number;
	width: number;
	height: number;
	open: boolean;
	fontSize: number;
}

interface InternalEditorProps {
	initialText: string;
	setSvgImage: Dispatch<SetStateAction<string>>;
	editorEl: EditorEl;
	setEditorEl: Dispatch<SetStateAction<EditorEl>>;
	style?: React.CSSProperties;
	editorStyle?: React.CSSProperties;
	toolbarOptions?: string[];
}

export const InternalEditor: React.FC<InternalEditorProps> = (props) => {
	const {
		initialText,
		editorEl,
		setEditorEl,
		setSvgImage,
		style,
		toolbarOptions,
		editorStyle,
	} = props;

	const { fontSize, width, height } = editorEl;

	const [text, setText] = useState(initialText);
	const [loaded, setLoaded] = useState(false);

	const editorRef = useRef<HTMLDivElement>(null);
	const bubbleMenuRef = useRef<HTMLElement | null>(null);

	const options = toolbarOptions || defaultToolbarOptions;

	const setBubbleMenuElement = (element: HTMLElement) => {
		bubbleMenuRef.current = element;
	};

	const updateSvg = (html: string): string => {
		const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml" style="font-size: ${fontSize}px; position: absolute; top: 0; left: 0; margin: 0; padding: 0; color: black;">
              <style>
                p { margin: 0; }
              </style>  
              ${html}
            </div>
          </foreignObject>
        </svg>`;

		const svgBlob = new Blob([svgString], {
			type: "image/svg+xml;charset=utf-8",
		});
		return URL.createObjectURL(svgBlob);
	};

	const editor = useEditor({
		extensions: [...extensions, CustomParagraph],
		content: text,
		onUpdate: ({ editor }) => {
			const updatedText = editor.getHTML();
			setText(updatedText);
			const svgUrl = updateSvg(updatedText);
			setSvgImage(svgUrl);
		},
	});

	useEffect(() => {
		if (editor) {
			if (!loaded) {
				const svgUrl = updateSvg(editor.getHTML());
				setSvgImage(svgUrl);
				setLoaded(true);
			}

			const handleUpdate = ({ editor }: { editor: Editor }) => {
				const updatedText = editor.getHTML();
				setText(updatedText);
				const svgUrl = updateSvg(updatedText);
				setSvgImage(svgUrl);
			};

			editor.on("update", handleUpdate);
			return () => {
				editor.off("update", handleUpdate);
			};
		}
	}, [editor, setSvgImage, updateSvg, loaded]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				editor &&
				editorRef.current &&
				!editorRef.current.contains(event.target as Node) &&
				(!bubbleMenuRef.current ||
					!bubbleMenuRef.current.contains(event.target as Node))
			) {
				setEditorEl((prev) => ({ ...prev, open: false }));
				if (editor) {
					const updatedText = editor.getHTML();
					setText(updatedText);
					const svgUrl = updateSvg(updatedText);
					setSvgImage(svgUrl);
				}
			}
		};

		if (editorEl.open) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [editorEl, editor, setEditorEl, setSvgImage, updateSvg]);

	const [dragPosition, setDragPosition] = useState({ x: editorEl.x + 32, y: editorEl.y + 32 });

	const handleMouseDown = (event: React.MouseEvent) => {
		const { offsetLeft, offsetTop } = editorRef.current!;
		const startX = event.clientX - offsetLeft;
		const startY = event.clientY - offsetTop;

		const handleMouseMove = (moveEvent: MouseEvent) => {
			const newX = moveEvent.clientX - startX;
			const newY = moveEvent.clientY - startY;
			setDragPosition({ x: newX, y: newY });
		};

		const handleMouseUp = () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
	};



	if (!editorEl.open || !editor) {
		return null;
	}

	return (
		<div
			onMouseDown={handleMouseDown}
			ref={editorRef}
			style={{
				position: "absolute",
				top: dragPosition.y,
				left: dragPosition.x,
				border: "2px solid #ccc",
				borderRadius: "4px",
				padding: "8px",
				backgroundColor: "#f9f9f9",
				boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
				zIndex: 9999,
				cursor: "move",
				...style,
			}}
		>
			<Toolbar
				editor={editor}
				options={options}
				setBubbleMenuElement={setBubbleMenuElement}
			/>
			{!editor.isDestroyed && (
				<EditorContent
					editor={editor}
					style={{
						fontSize: `${fontSize}px`,
						width: "100%",
						height: "100%",
						margin: 0,
						padding: 0,
						boxSizing: "border-box",
						cursor: "text",
						...editorStyle,
					}}
				/>
			)}
		</div>
	);
};
