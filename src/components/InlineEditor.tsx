import React, {
	useState,
	useEffect,
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
import { generateSvgFromHtml } from "../utilts";

interface InlineEditorProps {
	text: string;
	setText: Dispatch<SetStateAction<string>>;
	editorEl: InlineEditorEl;
	setEditorEl: Dispatch<SetStateAction<InlineEditorEl>>;
	setSvgImage: Dispatch<SetStateAction<string>>;
	style?: CSSProperties;
	editorStyle?: React.CSSProperties;
	toolbarOptions?: string[];
}

export const InlineEditor: React.FC<InlineEditorProps> = (props) => {
	const {
		text,
		setText,
		setSvgImage,
		style,
		toolbarOptions,
		editorEl,
		setEditorEl,
		editorStyle,
	} = props;

	console.log('text', text);
	const options = (toolbarOptions && toolbarOptions.length > 0) ? toolbarOptions : defaultToolbarOptions;

	console.log("editor el", editorEl);

	const previousSvgUrlRef = useRef<string | null>(null);

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
			const svgUrl = generateSvgFromHtml(editor.getHTML(), editorEl);
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
				const svgUrl = generateSvgFromHtml(editor.getHTML(), editorEl);
				setSvgImage(svgUrl);
				setLoaded(true);
			}

			const handleUpdate = ({ editor }: { editor: Editor }) => {
				const updatedText = editor.getHTML();
				setText(updatedText);
				const svgUrl = generateSvgFromHtml(updatedText, editorEl);
				setSvgImage(svgUrl);
			};

			editor.on("update", handleUpdate);
			return () => {
				editor.off("update", handleUpdate);
			};
		}
	}, [editor, setSvgImage, generateSvgFromHtml, loaded]);

	const setBubbleMenuElement = (element: HTMLElement) => {
		bubbleMenuRef.current = element;
	};

	useEffect(() => {
		if (editorEl.open) {
			const handleClickOutside = (event: MouseEvent) => {
				const eventPath = event.composedPath ? event.composedPath() : [];
				console.log("eventPath", eventPath);
				console.log("editorRef.current", editorRef.current);
				// Check if the click was outside the editor or the bubble menu
				const clickedOutsideEditor =
					editorRef.current &&
					!editorRef.current.contains(event.target as Node) &&
					(!bubbleMenuRef.current ||
						!bubbleMenuRef.current.contains(event.target as Node));

				if (clickedOutsideEditor) {
					setEditorEl((prev) => ({ ...prev, open: false }));
					if (editor) {
						const updatedText = editor.getHTML();
						setText(updatedText);
						const svgUrl = generateSvgFromHtml(updatedText, editorEl);
						setSvgImage(svgUrl);
					}
				}
			};

			document.addEventListener("mousedown", handleClickOutside);

			return () => {
				document.removeEventListener("mousedown", handleClickOutside);
			};
		}
	}, [editorEl.open, editor, setEditorEl, setSvgImage, generateSvgFromHtml]);

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
