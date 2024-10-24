export interface EditorEl {
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
}

interface InteractiveEditorEl extends EditorEl {
  open: boolean;
}

export type InlineEditorEl = InteractiveEditorEl;
export type InternalEditorEl = InteractiveEditorEl;

export type ExternalEditorEl = EditorEl;
