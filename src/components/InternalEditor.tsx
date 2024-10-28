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
import { generateSvgFromHtml } from "../utilts";
import { InternalEditorEl } from "../types";

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
  const [loaded, setLoaded] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const bubbleMenuRef = useRef<HTMLElement | null>(null);

  const options = (toolbarOptions && toolbarOptions.length > 0) ? toolbarOptions : defaultToolbarOptions;

  const setBubbleMenuElement = (element: HTMLElement) => {
    bubbleMenuRef.current = element;
  };

  const updateSvg = (html: string): string => {
    return generateSvgFromHtml(html, editorEl);
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
  }, [editorEl.open, editor, setEditorEl, setSvgImage, updateSvg]);

  const stageContainer = document.querySelector(".konvajs-content");
  if (stageContainer === null) return null;
  const stageRect = stageContainer.getBoundingClientRect();

  const scrollLeft =
    window.pageXOffset || document.documentElement.scrollLeft || 0;
  const scrollTop =
    window.pageYOffset || document.documentElement.scrollTop || 0;

  const overlayX = stageRect.left + scrollLeft + editorEl.x;
  const overlayY = stageRect.top + scrollTop + editorEl.y;

  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (event: React.MouseEvent) => {
    setDragging(true);
    const offsetX = event.clientX - overlayX;
    const offsetY = event.clientY - overlayY;
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (dragging) {
      const newX = event.clientX - dragOffset.x - stageRect.left - scrollLeft;
      const newY = event.clientY - dragOffset.y - stageRect.top - scrollTop;
      setEditorEl((prev) => ({
        ...prev,
        x: newX,
        y: newY,
      }));
    }
  };

  const handleMouseUp = () => {
    if (dragging) {
      setDragging(false);
    }
  };

  useEffect(() => {
    if (dragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

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
