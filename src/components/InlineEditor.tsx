import React, { useRef, CSSProperties, Dispatch, SetStateAction } from "react";
import { EditorContent } from "@tiptap/react";
import Toolbar from "./Toolbar";
import { InlineEditorEl } from "../types";
import { generateSvgFromHtml } from "../utils";
import { useClickOutside } from "../hooks/useClickOutside";
import { defaultToolbarOptions } from "../constants";
import { useCustomEditor } from "../hooks/useCustomEditor";
import { useHandleDrag } from "../hooks/useHandleDrag";

interface InlineEditorProps {
	text: string;
	setText: Dispatch<SetStateAction<string>>;
	editorEl: InlineEditorEl;
	setEditorEl: Dispatch<SetStateAction<InlineEditorEl>>;
	setSvgImage: Dispatch<SetStateAction<string>>;
	style?: CSSProperties;
	editorStyle?: React.CSSProperties;
	toolbarStyle?: React.CSSProperties;
	toolbarOptions?: string[];
	initialText: string;
	svgImage: any;
}

export const InlineEditor: React.FC<InlineEditorProps> = (props) => {
	const {
		text,
		setText,
		svgImage,
		setSvgImage,
		style,
		toolbarOptions,
		editorEl,
		setEditorEl,
		toolbarStyle,
		editorStyle,
		initialText,
	} = props;

	const { handleMouseDown } = useHandleDrag({
    editorEl,
    setEditorEl,
    containerSelector: '.konvajs-content',
  });

	const options =
		toolbarOptions && toolbarOptions.length > 0
			? toolbarOptions
			: defaultToolbarOptions;

	const editorRef = useRef<HTMLDivElement | null>(null);
	const bubbleMenuRef = useRef<HTMLElement | null>(null);


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
			const svgString = generateSvgFromHtml(editor.getHTML(), editorEl);
			console.log('Generated SVG String:', svgString);
	
			// Create Blob and generate Blob URL
			const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
			const svgUrl = URL.createObjectURL(svgBlob);
	
			// Update state
			setText(editor.getHTML());
			setSvgImage(svgUrl);
			setEditorEl((prev) => ({ ...prev, open: false }));
		},
	});

	const setBubbleMenuElement = (element: HTMLElement) => {
		bubbleMenuRef.current = element;
	};

	if (!editorEl.open || !editor) {
		return null;
	}

	return (
		<div
			ref={editorRef}
			onMouseDown={handleMouseDown}
			style={{
				...style,
				top: editorEl.y,
				left: editorEl.x,
				width: editorEl.width,
				height: editorEl.height,
				zIndex: 1000,
				position: "absolute",
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
					style={{
						fontSize: `${editorEl?.fontSize || 12}px`,
						width: "100%",
						height: "100%",
						margin: 0,
						padding: 0,
						boxSizing: "border-box",
						cursor: "text",
						lineHeight: 1,
						verticalAlign: "top",
						...editorStyle,
					}}
				/>
			)}
		</div>
	);
};
