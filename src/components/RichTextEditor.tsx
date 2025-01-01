import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { InlineEditor } from "./InlineEditor";
import { Html } from "../html";
import { generateSvgFromHtml } from "../utils";
import { EditorProps, EditorEl } from "../types";

import { Image as KonvaImage } from "react-konva";
import type { Image as KonvaImageType } from "konva/lib/shapes/Image";

interface RichTextEditorProps extends EditorProps {
	imageRef?: React.RefObject<KonvaImageType>;
}

export type RichTextEditorRef = KonvaImageType & {
	redraw: () => void;
};

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>((props, ref) => {
	const {
		editorEl,
		setEditorEl,
		editorStyle,
		toolbarStyle,
		readOnly,
		editorProps = {},
		toolbarOptions,
		style,
		...rest
	} = props;

	const [svgImage, setSvgImage] = useState<string>("");

	const [konvaImageNode, setKonvaImageNode] = useState<KonvaImageType | null>(null);

	const [parentContainer, setParentContainer] = useState<HTMLElement | null>(null);

	useEffect(() => {
		if (!editorEl.open && !svgImage) {
			const url = generateSvgFromHtml(editorEl.content, editorEl, editorStyle);
			setSvgImage(url);
		}
	}, [editorEl.open, svgImage, editorEl, editorStyle]);

	useEffect(() => {
		if (konvaImageNode) {
			const stage = konvaImageNode.getStage();
			if (stage) {
				const stageContainer = stage.container() as HTMLElement;
				if (stageContainer) {
					stageContainer.style.position = "relative";
					setParentContainer(stageContainer);
				}
			}
		}
	}, [konvaImageNode]);

	const inlineDblClick = () => {
		if (!konvaImageNode) return;
		const imageSize = {
			width: konvaImageNode.width(),
			height: konvaImageNode.height(),
		};
		setEditorEl((prev: EditorEl) => ({
			...prev,
			open: true,
			...imageSize,
		}));
	};


	const [imageElement, setImageElement] = useState<CanvasImageSource | undefined>(undefined);

	useEffect(() => {
		if (svgImage) {
			console.log("Loading image from svgImage:", svgImage);
			const img = new window.Image();
			img.src = svgImage;

			img.onload = () => {
				console.log("Image loaded successfully");
				setImageElement(img);
			};

			img.onerror = (e) => {
				console.error("Failed to load image:", svgImage, e);
			};

			return () => {
				// Cleanup if needed
			};
		} else {
			setImageElement(undefined);
		}
	}, [svgImage]);

	useEffect(() => {
		if (konvaImageNode && imageElement) {
			konvaImageNode.image(imageElement);
			konvaImageNode.getLayer()?.batchDraw();
		}
	}, [imageElement, konvaImageNode]);

	useImperativeHandle(
		ref,
		() => {
			if (!konvaImageNode) {
				return {
					redraw: () => {
						console.warn("Cannot call redraw; KonvaImageNode is not initialized.");
					},
				} as KonvaImageType & { redraw: () => void };
			}

			return Object.assign({}, konvaImageNode, {
				redraw: () => {
					// Your redraw logic
					const newSvg = generateSvgFromHtml(editorEl.content, editorEl, editorStyle);
					setSvgImage(newSvg);

					konvaImageNode.x(editorEl.x);
					konvaImageNode.y(editorEl.y);
					konvaImageNode.width(editorEl.width);
					konvaImageNode.height(editorEl.height);
					konvaImageNode.getLayer()?.batchDraw();
				},
			});
		},
		[konvaImageNode, editorEl, editorStyle]
	);

	return (
		<>
			<KonvaImage
				image={imageElement}
				visible={!editorEl.open}
				onDblClick={inlineDblClick}
				listening={!editorEl.open}
				ref={(node) => {
					if (ref && typeof ref === "object" && ref !== null) {
						// Forward the ref to the parent
						(ref as React.MutableRefObject<KonvaImageType | null>).current = node;
					}
					setKonvaImageNode(node);
				}}
				{...rest}
			/>

			{editorEl.open && parentContainer && (
				<Html container={parentContainer}>
					<div
						style={{
							zIndex: 1000,
							...style,
						}}
					>
						<InlineEditor
							svgImage={svgImage}
							editorEl={editorEl}
							setEditorEl={setEditorEl}
							setSvgImage={setSvgImage}
							readOnly={readOnly}
							editorStyle={editorStyle}
							editorProps={editorProps}
							toolbarOptions={toolbarOptions}
						/>
					</div>
				</Html>
			)}
		</>
	);
});

RichTextEditor.displayName = "RichTextEditor";

export { RichTextEditor };
