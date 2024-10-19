import Document from "@tiptap/extension-document";
import FontFamily from "@tiptap/extension-font-family";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Bold from "@tiptap/extension-bold";
import Underline from "@tiptap/extension-underline";
import Italic from "@tiptap/extension-italic";
import Strike from "@tiptap/extension-strike";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import History from '@tiptap/extension-history';

export const CustomParagraph = Paragraph.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: 'margin: 0;',
        parseHTML: element => element.getAttribute('style'),
        renderHTML: attributes => {
          return { style: attributes.style };
        },
      },
    };
  },
});

export const extensions = [
	Document,
	Text,
	Bold,
	Underline,
	Italic,
	Strike,
	TextStyle,
	Color,
	FontFamily,
  History,
];


export const defaultToolbarOptions = [
  'undo',
  'redo',
  'bold',
  'underline',
  'italic',
  'strike',
  'fontFamily',
  'color',
];
