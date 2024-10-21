# React Konva Rich Text Editor

A rich-text editor for React Konva, providing seamless integration of text editing capabilities on a canvas. This library allows you to manipulate text on a canvas, similar to tools like Microsoft Word, but within the powerful canvas rendering context provided by React-Konva.

## Table of Contents

- [Installation](#installation)
- [Features](#features)
- [Components](#components)
  - [Editors](#editors)
    - [InlineEditor](#inlineeditor)
    - [InternalEditor](#internaleditor)
    - [ExternalEditor](#externaleditor)
  - [Images](#images)
    - [Image.Inline](#imageinline)
    - [Image.Internal](#imageinternal)
    - [Image.External](#imageexternal)
- [Usage](#usage)
  - [Inline Editor Example](#inline-editor-example)
  - [Internal Editor Example](#internal-editor-example)
  - [External Editor Example](#external-editor-example)
- [API Reference](#api-reference)

## Installation

```bash
npm install react-konva-rich-text-editor
```

or

```bash
yarn add react-konva-rich-text-editor
```

## Features

- **Rich Text Editing**: Leverage the power of [TipTap](https://tiptap.dev/) to provide rich-text editing capabilities.
- **Canvas Integration**: Seamlessly integrate text editing within a React Konva canvas.
- **Flexible Editors**: Choose between Inline, Internal, or External editors to suit your application's needs.
- **Customizable**: Easily customize editor styles, toolbar options, and more.

## Components

This library provides six main components:

### Editors

1. **InlineEditor**: Appears inline when you double-click the text image on the canvas, giving the illusion of editing the text directly.
2. **InternalEditor**: Pops up over the canvas when you double-click the text image.
3. **ExternalEditor**: Always visible and edits the text image from outside the canvas.

### Images

Corresponding to each editor, there is an image component:

1. **Image.Inline**: Renders the text as an image on the canvas and interacts with the `InlineEditor`.
2. **Image.Internal**: Works with the `InternalEditor`.
3. **Image.External**: Works with the `ExternalEditor`.

## Usage

### Inline Editor Example

[View the Inline Editor example on StackBlitz](https://stackblitz.com/edit/rkrte-inline-editor?file=src%2FApp.tsx&terminal=dev)

```jsx
import { useState } from 'react';
import Image, { InlineEditor } from 'react-konva-rich-text-editor';
import type { InlineEditorEl } from 'react-konva-rich-text-editor';
import { Stage, Layer } from 'react-konva';
import Konva from 'konva';

function App() {
  const [editorEl, setEditorEl] = useState<InlineEditorEl>({
    x: 110,
    y: 110,
    width: 720,
    height: 360,
    open: false, // Required for InlineEditor
    fontSize: 66,
  });
  const [svgImage, setSvgImage] = useState('');

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const { x, y } = e.target.position();
    setEditorEl((prev) => ({
      ...prev,
      x,
      y,
    }));
  };

  return (
    <>
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          <Image.Inline
            svgImage={svgImage}
            setEditorEl={setEditorEl}
            editorEl={editorEl}
            x={editorEl.x}
            y={editorEl.y}
            draggable
            onDragEnd={handleDragEnd}
          />
        </Layer>
      </Stage>
      <InlineEditor
        initialText="Hello, world!"
        setSvgImage={setSvgImage}
        setEditorEl={setEditorEl}
        editorEl={editorEl}
        editorStyle={{}}
      />
    </>
  );
}

export default App;
```

### Internal Editor Example

[View the Internal Editor example on StackBlitz](https://stackblitz.com/edit/rkrte-internal-editor?file=src%2FApp.tsx&terminal=dev)

```jsx
import { useState } from 'react';
import Image, { InternalEditor } from 'react-konva-rich-text-editor';
import type { InternalEditorEl } from 'react-konva-rich-text-editor';
import { Stage, Layer } from 'react-konva';
import Konva from 'konva';

function App() {
  const [editorEl, setEditorEl] = useState<InternalEditorEl>({
    x: 100,
    y: 100,
    width: 600,
    height: 300,
    open: false, // Required for InternalEditor
    fontSize: 48,
  });
  const [svgImage, setSvgImage] = useState('');

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const { x, y } = e.target.position();
    setEditorEl((prev) => ({
      ...prev,
      x,
      y,
    }));
  };

  return (
    <>
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          <Image.Internal
            svgImage={svgImage}
            setEditorEl={setEditorEl}
            editorEl={editorEl}
            x={editorEl.x}
            y={editorEl.y}
            draggable
            onDragEnd={handleDragEnd}
          />
        </Layer>
      </Stage>
      <InternalEditor
        initialText="Edit me!"
        setSvgImage={setSvgImage}
        setEditorEl={setEditorEl}
        editorEl={editorEl}
        editorStyle={{}}
      />
    </>
  );
}

export default App;
```

### External Editor Example

[View the External Editor example on StackBlitz](https://stackblitz.com/edit/rkrte-external-editor?file=src%2FApp.tsx&terminal=dev)

```jsx
import { useState } from 'react';
import Image, { ExternalEditor } from 'react-konva-rich-text-editor';
import type { ExternalEditorEl } from 'react-konva-rich-text-editor';
import { Stage, Layer } from 'react-konva';

function App() {
  const [editorEl, setEditorEl] = useState<ExternalEditorEl>({
    x: 50,
    y: 50,
    width: 500,
    height: 250,
    fontSize: 36,
  });
  const [svgImage, setSvgImage] = useState('');

  return (
    <>
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          <Image.External
            svgImage={svgImage}
            x={editorEl.x}
            y={editorEl.y}
            draggable
          />
        </Layer>
      </Stage>
      <ExternalEditor
        initialText="Always editable"
        setSvgImage={setSvgImage}
        editorEl={editorEl}
        editorStyle={{}}
      />
    </>
  );
}

export default App;
```

## API Reference

### Editors

#### InlineEditor

- **Description**: An editor that appears inline when you double-click the corresponding image on the canvas.
- **Props**:
  - `initialText` (string): The initial text content.
  - `editorEl` (InlineEditorEl): Editor state object.
  - `setEditorEl` (function): State updater for `editorEl`.
  - `setSvgImage` (function): Function to update the SVG image.
  - `editorStyle` (object): Custom styles for the editor.
  - `toolbarOptions` (array): Customize toolbar options.

#### InternalEditor

- **Description**: An editor that pops up over the canvas when you double-click the corresponding image.
- **Props**: Same as `InlineEditor`.

#### ExternalEditor

- **Description**: An editor that is always visible and edits the text image from outside the canvas.
- **Props**:
  - `initialText` (string): The initial text content.
  - `editorEl` (ExternalEditorEl): Editor state object.
  - `setSvgImage` (function): Function to update the SVG image.
  - `editorStyle` (object): Custom styles for the editor.
  - `toolbarOptions` (array): Customize toolbar options.

### Images

#### Image.Inline

- **Description**: Corresponds to `InlineEditor`. Renders the text as an image on the canvas.
- **Props**:
  - `svgImage` (string): The SVG image source.
  - `editorEl` (InlineEditorEl): Editor state object.
  - `setEditorEl` (function): State updater for `editorEl`.
  - `x`, `y` (number): Position on the canvas.
  - Additional Konva `Image` props.

#### Image.Internal

- **Description**: Corresponds to `InternalEditor`.
- **Props**: Same as `Image.Inline`.

#### Image.External

- **Description**: Corresponds to `ExternalEditor`.
- **Props**:
  - `svgImage` (string): The SVG image source.
  - `x`, `y` (number): Position on the canvas.
  - Additional Konva `Image` props.

### Types

#### InlineEditorEl & InternalEditorEl

- **Properties**:
  - `x`, `y` (number): Position on the canvas.
  - `width`, `height` (number): Dimensions of the editor.
  - `open` (boolean): Controls the visibility of the editor.
  - `fontSize` (number, optional): Font size for the text.

#### ExternalEditorEl

- **Properties**:
  - `x`, `y` (number): Position on the canvas.
  - `width`, `height` (number): Dimensions of the editor.
  - `fontSize` (number, optional): Font size for the text.

---

Feel free to contribute to this project by submitting issues or pull requests on [GitHub](https://github.com/Ebubekir-Tas/react-konva-rich-text-editor/pulls).

