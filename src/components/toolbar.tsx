import React, { useCallback } from "react";
import { BubbleMenu, Editor } from "@tiptap/react";
import classNames from "classnames";
import * as Icons from "../icons";
import { defaultToolbarOptions } from "../constants";
import "./styles.css";

interface ToolbarProps {
	editor: Editor;
	options?: string[];
	setBubbleMenuElement: (element: HTMLElement) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
	editor,
	options = defaultToolbarOptions,
	setBubbleMenuElement,
}) => {
	const toggleBold = useCallback(() => {
		editor?.chain().focus().toggleBold().run();
	}, [editor]);

	const toggleUnderline = useCallback(() => {
		editor?.chain().focus().toggleUnderline().run();
	}, [editor]);

	const toggleItalic = useCallback(() => {
		editor?.chain().focus().toggleItalic().run();
	}, [editor]);

	const toggleStrike = useCallback(() => {
		editor?.chain().focus().toggleStrike().run();
	}, [editor]);

	const toggleColor = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			editor?.chain().focus().setColor(e.target.value).run();
		},
		[editor]
	);

	const toggleFont = useCallback(
		(fontFamily: string) => {
			editor?.chain().focus().setFontFamily(fontFamily).run();
		},
		[editor]
	);
	const buttonComponents: { [key: string]: React.ReactNode } = {
		undo: (
			<button
				key="undo"
				className="menu-button"
				onClick={() => editor.chain().focus().undo().run()}
				disabled={!editor.can().undo()}
			>
				<Icons.RotateLeft />
			</button>
		),
		redo: (
			<button
				key="redo"
				className="menu-button"
				onClick={() => editor.chain().focus().redo().run()}
				disabled={!editor.can().redo()}
			>
				<Icons.RotateRight />
			</button>
		),
		bold: (
			<button
				key="bold"
				className={classNames("menu-button", {
					"is-active": editor.isActive("bold"),
				})}
				onClick={toggleBold}
			>
				<Icons.Bold />
			</button>
		),
		underline: (
			<button
				key="underline"
				className={classNames("menu-button", {
					"is-active": editor.isActive("underline"),
				})}
				onClick={toggleUnderline}
			>
				<Icons.Underline />
			</button>
		),
		italic: (
			<button
				key="italic"
				className={classNames("menu-button", {
					"is-active": editor.isActive("italic"),
				})}
				onClick={toggleItalic}
			>
				<Icons.Italic />
			</button>
		),
		strike: (
			<button
				key="strike"
				className={classNames("menu-button", {
					"is-active": editor.isActive("strike"),
				})}
				onClick={toggleStrike}
			>
				<Icons.Strikethrough />
			</button>
		),
		fontFamily: (
			<select
				key="fontFamily"
				onChange={(e) => toggleFont(e.target.value)}
				className="menu-button"
			>
				<option style={{ color: "black" }} value="Arial">
					Arial
				</option>
				<option style={{ color: "black" }} value="Times New Roman">
					Times New Roman
				</option>
				<option style={{ color: "black" }} value="Courier New">
					Courier New
				</option>
				<option style={{ color: "black" }} value="Comic Sans MS">
					Comic Sans MS
				</option>
			</select>
		),
		color: (
			<input
				key="color"
				type="color"
				onChange={toggleColor}
				className="menu-button"
				style={{
					display: 'inline-flex'
				}}
			/>
		),
	};

	return (
		<BubbleMenu
			editor={editor}
			className="bubble-menu-dark"
			pluginKey="bubbleMenuText"
			tippyOptions={{
				duration: 150,
				onCreate: (instance) => {
					setBubbleMenuElement(instance.popper);
				},
			}}
		>
				{options.map((option) => {
					const button = buttonComponents[option];
					if (!button) {
						console.warn(`Invalid toolbar option: ${option}`);
						return null;
					}
					return button;
				})}
		</BubbleMenu>
	);
};

export default Toolbar;
