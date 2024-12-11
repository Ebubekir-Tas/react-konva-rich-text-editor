import React, {
	useState,
	useEffect,
	Dispatch,
	SetStateAction,
	useRef,
} from "react";
import { EditorContent } from "@tiptap/react";
import Toolbar from "./Toolbar";
import { defaultToolbarOptions } from "../constants";
import { generateSvgFromHtml } from "../utils";
import { InternalEditorEl } from "../types";
import { useClickOutside } from "../hooks/useClickOutside";
import { useCustomEditor } from "../hooks/useCustomEditor";
import { useHandleDrag } from "../hooks/useHandleDrag";

interface InternalEditorProps {
	text: string;
	setText: Dispatch<SetStateAction<string>>;
	editorEl: InternalEditorEl;
	setEditorEl: Dispatch<SetStateAction<InternalEditorEl>>;
	setSvgImage: Dispatch<SetStateAction<string>>;
	style?: React.CSSProperties;
	editorStyle?: React.CSSProperties;
	toolbarStyle?: React.CSSProperties;
	toolbarOptions?: string[];
}

export const InternalEditor: React.FC<InternalEditorProps> = (props) => {
	const {
		text,
		setText,
		editorEl,
		setEditorEl,
		setSvgImage,
		style,
		toolbarOptions,
		editorStyle,
		toolbarStyle,
	} = props;

	const { fontSize = 12 } = editorEl;

	const editorRef = useRef<HTMLDivElement>(null);
	const bubbleMenuRef = useRef<HTMLElement | null>(null);

	const options =
		toolbarOptions && toolbarOptions.length > 0
			? toolbarOptions
			: defaultToolbarOptions;

	const setBubbleMenuElement = (element: HTMLElement) => {
		bubbleMenuRef.current = element;
	};

	const editor = useCustomEditor({
		initialText: text,
		setText,
		editorEl,
		setSvgImage,
	});

	useClickOutside({
		isOpen: editorEl.open,
		editorRef,
		bubbleMenuRef,
		onClose: () => {
			setEditorEl((prev) => ({ ...prev, open: false }));
			if (editor) {
				const updatedText = editor.getHTML();
				setText(updatedText);
				const svgUrl = generateSvgFromHtml(editor.getHTML(), editorEl);
				setSvgImage(svgUrl);
			}
		},
	});

  const { handleMouseDown } = useHandleDrag({
    editorEl,
    setEditorEl,
    containerSelector: '.konvajs-content',
  });

	if (!editorEl.open || !editor) {
		return null;
	}

	return (
		<div
			ref={editorRef}
			onMouseDown={handleMouseDown}
			style={{
        position: "absolute",
        top: editorEl.y,
        left: editorEl.x,
        width: editorEl.width,
        height: editorEl.height,
        border: "1px solid rgba(0, 0, 0, 0.1)",
        borderRadius: "8px",
        padding: "16px",
        background: "linear-gradient(135deg, #ffffff, #f4f4f4)",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
        zIndex: 9999,
        cursor: "move",
				...style,
			}}
		>
			<Toolbar
				editor={editor}
				options={options}
				setBubbleMenuElement={setBubbleMenuElement}
				toolbarStyle={toolbarStyle}
			/>
			{!editor.isDestroyed && (
				<EditorContent
					editor={editor}
					onMouseDown={(e) => e.stopPropagation()}
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
