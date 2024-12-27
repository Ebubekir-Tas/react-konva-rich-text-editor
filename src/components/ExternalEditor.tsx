import React, {
	useEffect,
	useRef,
	useState,
	Dispatch,
	SetStateAction,
} from "react";
import { EditorContent, useEditor, Editor } from "@tiptap/react";
import Toolbar from "./toolbar";
import {
	extensions,
	defaultToolbarOptions,
	CustomParagraph,
} from "../constants";
import { EditorEl } from "../types";

export interface ExternalEditorProps {
	editorEl: EditorEl;
	setEditorEl: Dispatch<SetStateAction<EditorEl>>;
	setSvgImage: Dispatch<SetStateAction<string>>;
	style?: React.CSSProperties;
	editorStyle?: React.CSSProperties;
	toolbarStyle?: React.CSSProperties;
	toolbarOptions?: string[];
}

export const ExternalEditor: React.FC<ExternalEditorProps> = (props) => {
	const {
		editorEl,
		setEditorEl,
		setSvgImage,
		style,
		toolbarOptions,
		toolbarStyle,
		editorStyle,
	} = props;

	const { width, height, fontSize } = editorEl;

	const updateSvg = (html: string): string => {
		const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 100 100" preserveAspectRatio="none">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml" style="font-size: ${fontSize || 12}px; position: absolute; top: 0; left: 0; margin: 0; padding: 0; color: black;">
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
		content: editorEl.content,
	});

	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		if (!editor) return;

		if (!loaded) {
			const svgUrl = updateSvg(editor.getHTML());
      setSvgImage(svgUrl);
      setLoaded(true);
		}

		const handleUpdate = ({ editor }: { editor: Editor }) => {
			const svgUrl = updateSvg(editor.getHTML());
			setEditorEl((prev) => ({
				...prev,
				content: editor.getHTML(),
			}))
			setSvgImage(svgUrl);
		};

		editor.on("update", handleUpdate);

		return () => {
			if (editor) {
				editor.off("update", handleUpdate);
			}
		};
	}, [editor, setSvgImage, updateSvg, loaded]);

	const options = (toolbarOptions && toolbarOptions.length > 0) ? toolbarOptions : defaultToolbarOptions;

	const bubbleMenuRef = useRef<HTMLElement | null>(null);
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
