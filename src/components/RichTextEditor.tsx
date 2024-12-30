import { useState, useEffect, useRef } from "react";
import type { CSSProperties, Dispatch, SetStateAction } from "react";
import { InlineEditor } from "./InlineEditor";
import { Html } from "../html";
import { generateSvgFromHtml } from "../utils";
import { EditorProps } from "../types";

import { Rect } from "react-konva";
import type { Image as KonvaImageType } from "konva/lib/shapes/Image";
import { Image } from "react-konva";
import { RichText } from "./RichText";

const RichTextEditor = (props: EditorProps) => {
	const {
		editorEl,
		setEditorEl,
		editorStyle,
		toolbarStyle,
		readOnly,
		editorProps = {},
		svgImage: propsSvgImage,
		setSvgImage: propsSetSvgImage,
		toolbarOptions,
		style,
		...rest
	} = props;

	const [svgImage, setSvgImage] = useState("");

	const [konvaImageNode, setKonvaImageNode] = useState<KonvaImageType | null>(
		null
	);

	const [parentContainer, setParentContainer] = useState(null);
	const [isSelected, setIsSelected] = useState(false);

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
					// @ts-ignore
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
		setEditorEl((prev) => ({
			...prev,
			open: true,
			...imageSize,
		}));
	};


	const internalImageRef = useRef<KonvaImageType | null>(null);
	const previousUrlRef = useRef<string | null>(null);
	const [imageElement, setImageElement] = useState<CanvasImageSource | undefined>(
		undefined
	);

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
				if (
					previousUrlRef.current &&
					previousUrlRef.current.startsWith("blob:")
				) {
					URL.revokeObjectURL(previousUrlRef.current);
					previousUrlRef.current = null;
				}
			};
		} else {
			setImageElement(undefined);
		}
	}, [svgImage]);

	useEffect(() => {
		if (internalImageRef.current && imageElement) { 
			internalImageRef.current.image(imageElement);
			internalImageRef.current.getLayer()?.batchDraw();
		}
	}, [imageElement]);

	return (
		<>

			<Image
				visible={!editorEl.open}
				onDblClick={inlineDblClick}
				listening={!editorEl.open}
				ref={(node) => {
					internalImageRef.current = node;
					if (node) {
						setKonvaImageNode?.(node);
					}
				}}
				{...rest}
			/>

			{isSelected && !editorEl.open && (
				<>
					<Rect
						x={editorEl.x}
						y={editorEl.y}
						width={editorEl.width}
						height={editorEl.height}
						stroke="blue"
						strokeWidth={1}
						listening={false}
					/>
				</>
			)}

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
};

export { RichTextEditor };