import React, { useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import { EditorContent, UseEditorOptions } from "@tiptap/react";
import Toolbar from "./toolbar";
import { EditorProps } from "../types";
import { generateSvgFromHtml } from "../utils";
import { extensions, CustomParagraph, defaultToolbarOptions } from "../constants";
import { useCustomEditor } from "../hooks/useCustomEditor";
import { useClickOutside } from "../hooks/useClickOutside";

interface InlineEditorProps extends EditorProps {
	svgImage: string;
	setSvgImage: Dispatch<SetStateAction<string>>;
}

export const InlineEditor: React.FC<InlineEditorProps> = (props) => {
	const {
		editorEl,
		setEditorEl,
		setSvgImage,
		style,
		editorStyle,
		toolbarStyle,
		toolbarOptions,
		editorProps = {},
		readOnly,
	} = props;

	const options =
		toolbarOptions && toolbarOptions.length > 0
			? toolbarOptions
			: defaultToolbarOptions;

	const editorRef = useRef<HTMLDivElement | null>(null);
	const bubbleMenuRef = useRef<HTMLElement | null>(null);

	const editorOptions: UseEditorOptions = {
		extensions: [...extensions, CustomParagraph],
		content: editorEl.content,
		editable: !readOnly,
		immediatelyRender: true,
		...editorProps,
	}

	const editor = useCustomEditor({
		editorEl,
		setSvgImage,
		editorOptions
	});

	useClickOutside({
		isOpen: editorEl.open,
		editorRef,
		bubbleMenuRef,
		onClose: () => {
			if (!editor) return;
			const finalHtml = editor.getHTML()
			const svgString = generateSvgFromHtml(finalHtml, editorEl, editorStyle);

			setSvgImage(svgString);

			setEditorEl((prev) => ({ ...prev, open: false, content: finalHtml }));
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
						lineHeight: 1.2,
						verticalAlign: "top",
						fontFamily: 'Arial',
						...editorStyle,
					}}
				/>
			)}
		</div>
	);
};
