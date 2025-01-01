import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { InlineEditor } from "./InlineEditor";
import { Html } from "../html";
import { generateSvgFromHtml } from "../utils";
import { EditorProps, EditorEl } from "../types";

import { Image as KonvaImage } from "react-konva";
import type { Image as KonvaImageType } from "konva/lib/shapes/Image";

export type RichTextEditorRef = KonvaImageType & {
	redraw: () => void;
};

const RichTextEditor = forwardRef<RichTextEditorRef, EditorProps>((props, ref) => {
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

	const konvaRef = useRef<KonvaImageType | null>(null);

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
				// Cleanup
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


  useImperativeHandle(ref, () => {
    if (!konvaRef.current) {
      return {
        redraw: () => {
          console.warn("Cannot call redraw; KonvaImageNode is not initialized.");
        },
        getStage: () => null,
      } as unknown as KonvaImageType & { redraw: () => void };
    }

    return Object.assign({}, konvaRef.current, {
      redraw: () => {
				if (!konvaRef.current) return;
				const newSvg = generateSvgFromHtml(editorEl.content, editorEl, editorStyle);
				setSvgImage(newSvg);

				konvaRef.current.x(editorEl.x);
				konvaRef.current.y(editorEl.y);
				konvaRef.current.width(editorEl.width);
				konvaRef.current.height(editorEl.height);
				konvaRef.current.getLayer()?.batchDraw();
			},
    });
  }, [konvaImageNode, editorEl, editorStyle]);

	return (
		<>
			<KonvaImage
				image={imageElement}
				visible={!editorEl.open}
				onDblClick={inlineDblClick}
				listening={!editorEl.open}
				ref={konvaRef}
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
