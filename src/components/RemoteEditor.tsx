import React, { useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import { EditorContent } from "@tiptap/react";
import Toolbar from "./toolbar";
import {
	extensions,
	defaultToolbarOptions,
	CustomParagraph,
} from "../constants";
import { EditorProps } from "../types";
import { useCustomEditor } from "../hooks/useCustomEditor";
import { UseEditorOptions } from '@tiptap/react'

interface RemoteEditorProps extends EditorProps {
	setSvgImage: Dispatch<SetStateAction<string>>;
	debounceMs?: number;
}

const RemoteEditor: React.FC<RemoteEditorProps> = (props) => {
	const {
		editorEl,
		style,
		editorStyle,
		toolbarStyle,
		toolbarOptions,
		editorProps = {},
		setSvgImage,
		readOnly,
		debounceMs,
	} = props;

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
		editorOptions,
		debounceMs,
	});

	const options = (toolbarOptions && toolbarOptions.length > 0) ? toolbarOptions : defaultToolbarOptions;

	const setBubbleMenuElement = (element: HTMLElement) => {
		bubbleMenuRef.current = element;
	};

	if (!editor) return null;
	return (
		<div style={style}>
			<Toolbar
				editor={editor}
				options={options}
				setBubbleMenuElement={setBubbleMenuElement}
				toolbarStyle={toolbarStyle}
			/>
			{!editor.isDestroyed && (
				<EditorContent editor={editor} style={editorStyle} />
			)}
		</div>
	);
};

export { RemoteEditor };
