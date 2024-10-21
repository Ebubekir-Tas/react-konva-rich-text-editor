import React, {
	useState,
	useEffect,
	useCallback,
	useRef,
	CSSProperties,
	Dispatch,
	SetStateAction,
} from "react";
import { EditorContent, useEditor, Editor } from "@tiptap/react";
import Toolbar from "./Toolbar";
import {
	extensions,
	defaultToolbarOptions,
	CustomParagraph,
} from "../constants";
import { InlineEditorEl } from "../types";

interface InlineEditorProps {
	initialText: string;
	editorEl: InlineEditorEl;
	setEditorEl: Dispatch<SetStateAction<InlineEditorEl>>;
	setSvgImage: Dispatch<SetStateAction<string>>;
	style?: CSSProperties;
	editorStyle?: React.CSSProperties;
	toolbarOptions?: string[];
}

export const InlineEditor: React.FC<InlineEditorProps> = (props) => {
	const {
		initialText,
		setSvgImage,
		style,
		toolbarOptions,
		editorEl,
		setEditorEl,
		editorStyle,
	} = props;

	const [text, setText] = useState(initialText);
	const options = toolbarOptions || defaultToolbarOptions;

	console.log("editor el", editorEl);

	const previousSvgUrlRef = useRef<string | null>(null);

	const updateSvg = useCallback(
		(html: string): string => {
			if (previousSvgUrlRef.current) {
				URL.revokeObjectURL(previousSvgUrlRef.current);
			}
			const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${editorEl.width}" height="${editorEl.height}" viewBox="0 0 ${editorEl.width} ${editorEl.height}" preserveAspectRatio="none">
          <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml" style="
            font-size: ${editorEl?.fontSize || 12}px;
            color: black;
            width: ${editorEl.width}px;
            height: ${editorEl.height}px;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          ">
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
			const newSvgUrl = URL.createObjectURL(svgBlob);

			previousSvgUrlRef.current = newSvgUrl;

			return newSvgUrl;
		},
		[editorEl]
	);

	useEffect(() => {
		return () => {
			if (previousSvgUrlRef.current) {
				URL.revokeObjectURL(previousSvgUrlRef.current);
			}
		};
	}, []);

	const isFirstUpdate = useRef(true);

	const editor = useEditor({
		extensions: [...extensions, CustomParagraph],
		content: text,
		onUpdate: ({ editor }) => {
			if (isFirstUpdate.current) {
				isFirstUpdate.current = false;
				return;
			}
			const svgUrl = updateSvg(editor.getHTML());
			setText(editor.getHTML());
			setSvgImage(svgUrl);
		},
	});

	const editorRef = useRef<HTMLDivElement | null>(null);
	const bubbleMenuRef = useRef<HTMLElement | null>(null);
	const [loaded, setLoaded] = useState(false);

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

	const setBubbleMenuElement = (element: HTMLElement) => {
		bubbleMenuRef.current = element;
	};

	const [editorRefReady, setEditorRefReady] = useState(false);

	useEffect(() => {
		if (editorEl.open && editorRefReady) {
			const handleClickOutside = (event: MouseEvent) => {
				if (
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

			document.addEventListener("mousedown", handleClickOutside);

			return () => {
				document.removeEventListener("mousedown", handleClickOutside);
			};
		}
	}, [
		editorEl.open,
		editorRefReady,
		editor,
		setEditorEl,
		setSvgImage,
		updateSvg,
	]);

	if (!editorEl.open || !editor) {
		return null;
	}

	return (
		<div
			ref={(node) => {
				editorRef.current = node;
				if (node) {
					setEditorRefReady(true);
				} else {
					setEditorRefReady(false);
				}
			}}
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
						...editorStyle,
					}}
				/>
			)}
		</div>
	);
};
