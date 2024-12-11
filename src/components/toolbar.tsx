import React, { useCallback } from 'react';
import { BubbleMenu, Editor } from '@tiptap/react';
import { createGlobalStyle } from 'styled-components';
import * as Icons from '../icons';

interface ToolbarProps {
  editor: Editor;
  options?: string[];
  setBubbleMenuElement: (element: HTMLElement) => void;
  toolbarStyle?: React.CSSProperties;
}

const GlobalStyles = createGlobalStyle`
  .tippy-box[data-theme~='bubble-menu'] {
    background-color: #313639;
    border-radius: 4px;
    padding: 0;
    color: white;
  }

  .tippy-box[data-theme~='bubble-menu'] .tippy-arrow {
    color: #313639;
  }

  .tippy-box[data-theme~='bubble-menu'] .tippy-content {
    padding: 0;
  }

  .bubble-menu-container {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
  }

  .bubble-menu-button {
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    width: 32px;
    height: 32px;
    padding: 0;
    margin: 0;
    border: 0;
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
  }

  .bubble-menu-button:hover,
  .bubble-menu-button.is-active {
    background-color: #e0e0e0;
    color: #333;
    transform: scale(1.05);
  }

  .bubble-menu-button:disabled {
    color: #999;
    cursor: not-allowed;
  }

  .bubble-menu-select {
    display: inline-flex;
    height: 32px;
    padding: 0 8px;
    border: 0;
    border-radius: 4px;
    background: transparent;
    color: white;
    cursor: pointer;
  }

  .bubble-menu-select option {
    color: black;
  }

  .bubble-menu-color-input {
    display: inline-flex;
    width: 32px;
    height: 32px;
    padding: 0;
    margin: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
  }
`;

const Toolbar: React.FC<ToolbarProps> = ({
  editor,
  options = [],
  setBubbleMenuElement,
  toolbarStyle,
}) => {
  const toggleBold = useCallback(() => {
    editor.chain().focus().toggleBold().run();
  }, [editor]);

  const toggleUnderline = useCallback(() => {
    editor.chain().focus().toggleUnderline().run();
  }, [editor]);

  const toggleItalic = useCallback(() => {
    editor.chain().focus().toggleItalic().run();
  }, [editor]);

  const toggleStrike = useCallback(() => {
    editor.chain().focus().toggleStrike().run();
  }, [editor]);

  const toggleColor = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      editor.chain().focus().setColor(e.target.value).run();
    },
    [editor]
  );

  const toggleFont = useCallback(
    (fontFamily: string) => {
      editor.chain().focus().setFontFamily(fontFamily).run();
    },
    [editor]
  );

  const currentFontFamily = editor.getAttributes("textStyle").fontFamily || "Arial";

  const buttonComponents: { [key: string]: React.ReactNode } = {
    undo: (
      <button
        key="undo"
        className="bubble-menu-button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <Icons.RotateLeft />
      </button>
    ),
    redo: (
      <button
        key="redo"
        className="bubble-menu-button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <Icons.RotateRight />
      </button>
    ),
    bold: (
      <button
        key="bold"
        className={`bubble-menu-button ${editor.isActive('bold') ? 'is-active' : ''}`}
        onClick={toggleBold}
      >
        <Icons.Bold />
      </button>
    ),
    underline: (
      <button
        key="underline"
        className={`bubble-menu-button ${editor.isActive('underline') ? 'is-active' : ''}`}
        onClick={toggleUnderline}
      >
        <Icons.Underline />
      </button>
    ),
    italic: (
      <button
        key="italic"
        className={`bubble-menu-button ${editor.isActive('italic') ? 'is-active' : ''}`}
        onClick={toggleItalic}
      >
        <Icons.Italic />
      </button>
    ),
    strike: (
      <button
        key="strike"
        className={`bubble-menu-button ${editor.isActive('strike') ? 'is-active' : ''}`}
        onClick={toggleStrike}
      >
        <Icons.Strikethrough />
      </button>
    ),
    fontFamily: (
      <select
        key="fontFamily"
        className="bubble-menu-select"
        onChange={(e) => toggleFont(e.target.value)}
        value={currentFontFamily}
      >
        <option value="Arial">Arial</option>
        <option value="Helvetica">Helvetica</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Times">Times</option>
        <option value="Courier New">Courier New</option>
        <option value="Courier">Courier</option>
        <option value="Verdana">Verdana</option>
        <option value="Georgia">Georgia</option>
        <option value="Palatino">Palatino</option>
        <option value="Garamond">Garamond</option>
        <option value="Bookman">Bookman</option>
        <option value="Comic Sans MS">Comic Sans MS</option>
        <option value="Trebuchet MS">Trebuchet MS</option>
        <option value="Arial Black">Arial Black</option>
        <option value="Impact">Impact</option>
        <option value="Lucida Sans Unicode">Lucida Sans Unicode</option>
        <option value="Tahoma">Tahoma</option>
      </select>
    ),
    color: (
      <input
        key="color"
        type="color"
        className="bubble-menu-color-input"
        onChange={toggleColor}
      />
    ),
  };

  return (
    <>
      <GlobalStyles />
      <BubbleMenu
        editor={editor}
        pluginKey="bubbleMenuText"
        tippyOptions={{
          duration: 150,
          animation: 'fade',
          theme: 'bubble-menu',
          onCreate: (instance) => {
            setBubbleMenuElement(instance.popper);
          },
        }}
      >
        <div className="bubble-menu-container" style={toolbarStyle}>
          {options.map((option) => {
            const button = buttonComponents[option];
            if (!button) {
              console.warn(`Invalid toolbar option: ${option}`);
              return null;
            }
            return button;
          })}
        </div>
      </BubbleMenu>
    </>
  );
};

export default Toolbar;
