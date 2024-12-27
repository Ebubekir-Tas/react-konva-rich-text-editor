import { useState, useEffect, useRef } from "react";
import { useEditor, Editor } from "@tiptap/react";
import { generateSvgFromHtml } from "../utils";
import { extensions, CustomParagraph } from "../constants";
import { UseEditorOptions } from '@tiptap/react'

interface UseCustomEditorProps {
	editorEl: any;
	setSvgImage: (url: string) => void;
	editorOptions: UseEditorOptions;
}

export function useCustomEditor({
	editorEl,
	setSvgImage,
	editorOptions,
}: UseCustomEditorProps) {
	const [loaded, setLoaded] = useState(false);
	const previousSvgUrlRef = useRef<string | null>(null);
	const debounceTimer = useRef<number | null>(null);

	const editor = useEditor(editorOptions);

	useEffect(() => {
		if (!editor) return;
	
		const updateSvgImage = (html: string) => {
		  const svgUrl = generateSvgFromHtml(html, editorEl);
	
		  if (previousSvgUrlRef.current) {
			URL.revokeObjectURL(previousSvgUrlRef.current);
		  }
	
		  setSvgImage(svgUrl);
		  previousSvgUrlRef.current = svgUrl;
		};
	
		if (!loaded) {
		  updateSvgImage(editor.getHTML());
		  setLoaded(true);
		}
	
		const handleUpdate = ({ editor }: { editor: Editor }) => {
		  const updatedHtml = editor.getHTML();
		  console.log("updated text", updatedHtml);
	
		  if (debounceTimer.current) clearTimeout(debounceTimer.current);
	
		  debounceTimer.current = setTimeout(() => {
			updateSvgImage(updatedHtml);
		  }, 500);
		};
	
		editor.on("update", handleUpdate);
	
		return () => {
		  editor.off("update", handleUpdate);
	
		  if (previousSvgUrlRef.current) {
			URL.revokeObjectURL(previousSvgUrlRef.current);
		  }
	
		  if (debounceTimer.current) clearTimeout(debounceTimer.current);
		};
	  }, [editor, loaded]);

	return editor;
}
