import { useRef, useState, useEffect, Dispatch, SetStateAction } from "react";
import { Image as KonvaImage, Rect } from "react-konva";
import { Image as KonvaImageType } from "konva/lib/shapes/Image";
import { ImageConfig } from "konva/lib/shapes/Image";
import { EditorEl } from "../types";
import { InlineEditor } from "./InlineEditor";
import { InternalEditor } from "./InternalEditor";
import { Html } from "../html";
import { generateSvgFromHtml } from "../utils";
import { EditorOptions } from '@tiptap/core';

interface BaseImageProps extends Omit<ImageConfig, "image"> {
	svgImage?: string;
	handleDblClick?: (event?: any) => void;
	setKonvaImageNode?: (node: KonvaImageType) => void;
}

const BaseImage: React.FC<BaseImageProps> = ({
	svgImage,
	handleDblClick,
	setKonvaImageNode,
	...restProps
}) => {
	const internalImageRef = useRef<KonvaImageType | null>(null);
	const previousUrlRef = useRef<string | null>(null);
	const [imageElement, setImageElement] = useState<HTMLImageElement | null>(
		null
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
			setImageElement(null);
		}
	}, [svgImage]);

	useEffect(() => {
		if (internalImageRef.current && imageElement) {
			internalImageRef.current.image(imageElement);
			internalImageRef.current.getLayer()?.batchDraw();
		}
	}, [imageElement]);

	return (
		//@ts-ignore
		<KonvaImage
			ref={(node) => {
				internalImageRef.current = node;
				if (node) {
					setKonvaImageNode?.(node);
				}
			}}
			onDblClick={handleDblClick}
			{...restProps}
		/>
	);
};

interface InlineImageProps extends BaseImageProps {
	editorEl: EditorEl;
	setEditorEl: Dispatch<SetStateAction<EditorEl>>;
	editorProps?: Partial<EditorOptions>;


	editorStyle?: React.CSSProperties;
	toolbarStyle?: React.CSSProperties;
	readOnly?: boolean
}

const InlineImage = (props: InlineImageProps) => {
	const {
		editorEl,
		setEditorEl,
		editorStyle,
		toolbarStyle,
		readOnly,
		editorProps = {},
		...rest
	} = props;

	const [konvaImageNode, setKonvaImageNode] = useState<KonvaImageType | null>(
		null
	);

	const [svgImage, setSvgImage] = useState("");
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

	const handleImageClick = () => {
		if (!editorEl.open) {
			setIsSelected((prev) => !prev);
		}
	};

	// Handle dragging corner handles
	const handleSize = 10;
	const halfHandle = handleSize / 2;

	const corners = [
		{ name: "topLeft", x: editorEl.x, y: editorEl.y },
		{ name: "topRight", x: editorEl.x + editorEl.width, y: editorEl.y },
		{ name: "bottomLeft", x: editorEl.x, y: editorEl.y + editorEl.height },
		{
			name: "bottomRight",
			x: editorEl.x + editorEl.width,
			y: editorEl.y + editorEl.height,
		},
	];

	const handleCornerDragMove = (e: any, cornerName: string) => {
		const node = e.target;
		const newX = node.x();
		const newY = node.y();

		let { x, y, width, height } = editorEl;

		switch (cornerName) {
			case "topLeft":
				width = width + (x - newX);
				height = height + (y - newY);
				x = newX;
				y = newY;
				break;
			case "topRight":
				width = newX - x;
				height = height + (y - newY);
				y = newY;
				break;
			case "bottomLeft":
				width = width + (x - newX);
				height = newY - y;
				x = newX;
				break;
			case "bottomRight":
				width = newX - x;
				height = newY - y;
				break;
		}

		const minSize = 20;
		if (width < minSize) width = minSize;
		if (height < minSize) height = minSize;

		setEditorEl((prev) => ({
			...prev,
			x,
			y,
			width,
			height,
		}));
	};

	const handleCornerDragEnd = () => {
		const newSvg = generateSvgFromHtml(editorEl.content, editorEl, editorStyle);
		setSvgImage(newSvg);

		if (konvaImageNode) {
			konvaImageNode.x(editorEl.x);
			konvaImageNode.y(editorEl.y);
			konvaImageNode.width(editorEl.width);
			konvaImageNode.height(editorEl.height);
			konvaImageNode.getLayer()?.batchDraw();
		}
	};
	return (
		<>
			<BaseImage
				{...rest}
				svgImage={svgImage}
				setKonvaImageNode={setKonvaImageNode}
				handleDblClick={inlineDblClick}
				visible={!editorEl.open}
				onClick={handleImageClick}
				listening={!editorEl.open}
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
					{corners.map((corner) => (
						<Rect
							key={corner.name}
							x={corner.x - halfHandle}
							y={corner.y - halfHandle}
							width={handleSize}
							height={handleSize}
							fill="white"
							stroke="blue"
							strokeWidth={1}
							draggable
							onDragMove={(e) => handleCornerDragMove(e, corner.name)}
							onDragEnd={handleCornerDragEnd}
							onMouseEnter={e => {
								// style stage container:
								//@ts-ignore
								parentContainer.style.cursor = "se-resize";
							}}
							onMouseLeave={e => {
								//@ts-ignore
								parentContainer.style.cursor = "default";
							}}
						/>
					))}
				</>
			)}

			{editorEl.open && parentContainer && (
				<Html container={parentContainer}>
					<div
						style={{
							zIndex: 1000,
						}}
					>
						<InlineEditor
							editorEl={editorEl}
							setEditorEl={setEditorEl}
							svgImage={svgImage}
							setSvgImage={setSvgImage}
							readOnly={readOnly}
							editorStyle={editorStyle}
							editorProps={editorProps}
						/>
					</div>
				</Html>
			)}
		</>
	);
};

interface InternalImageProps extends BaseImageProps {
	editorEl: EditorEl;
	setEditorEl: React.Dispatch<React.SetStateAction<EditorEl>>;
	editorStyle?: React.CSSProperties;
	toolbarStyle?: React.CSSProperties;
	initialText: string;
}
const InternalImage: React.FC<InternalImageProps> = (props) => {
	const {
		editorEl,
		setEditorEl,
		initialText,
		editorStyle,
		toolbarStyle,
		...rest
	} = props;

	const [text, setText] = useState(initialText);
	const [svgImage, setSvgImage] = useState("");

	useEffect(() => {
		if (!svgImage) {
			const initialSvgUrl = generateSvgFromHtml(text, editorEl, editorStyle);
			setSvgImage(initialSvgUrl);
		}
	}, [svgImage, editorEl, initialText, setSvgImage]);

	const imageRef = useRef(null);
	const internalDblClick = () => {
		setEditorEl((prev) => ({
			...prev,
			open: true,
		}));
	};

	return !editorEl.open ? (
		<BaseImage
			{...rest}
			svgImage={svgImage}
			imageRef={imageRef}
			handleDblClick={internalDblClick}
		/>
	) : (
		<
			// Html
			// divProps={{
			// 	style: {
			// 		zIndex: 10,
			// 	},
			// }}
			>
			<InternalEditor
				text={text}
				setText={setText}
				setSvgImage={setSvgImage}
				setEditorEl={setEditorEl}
				editorEl={editorEl}
				editorStyle={editorStyle || {}}
				toolbarStyle={toolbarStyle || {}}
			/>
		</
		// Html
		>
	);
};

interface ExternalImageProps {
	svgImage: string;
	setSvgImage: Dispatch<SetStateAction<string>>;
	initialText?: string;
	editorEl: EditorEl;
}
const ExternalImage: React.FC<BaseImageProps & ExternalImageProps> = ({
	svgImage,
	...props
}) => {
	return <BaseImage svgImage={svgImage} {...props} />;
};

const Image = {
	Inline: InlineImage,
	Internal: InternalImage,
	External: ExternalImage,
};

export default Image;
