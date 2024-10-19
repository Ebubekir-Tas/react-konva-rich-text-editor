import { useRef, useState, useEffect } from "react";
import { Image as KonvaImage } from "react-konva";
import { Image as KonvaImageType } from "konva/lib/shapes/Image";
import { ImageConfig } from "konva/lib/shapes/Image";

interface EditorEl {
	x: number;
	y: number;
	width: number;
	height: number;
	open: boolean;
}

interface KonvaImageProps extends ImageConfig {
	svgImage: string;
	setEditorEl: React.Dispatch<React.SetStateAction<EditorEl>>;
	imageRef: React.RefObject<KonvaImageType>;
	setKonvaImageNode?: (node: KonvaImageType) => void;
	handleDblClick: (event?: any) => void;
}

export const BaseImage: React.FC<KonvaImageProps> = ({
	svgImage,
	handleDblClick,
	setKonvaImageNode,
	...restProps
}) => {
	const internalImageRef = useRef<KonvaImageType | null>(null);

	useEffect(() => {
		if (svgImage) {
			const img = new window.Image();
			img.src = svgImage;
			img.onload = () => {
				if (internalImageRef.current) {
					internalImageRef.current.image(img);
					internalImageRef.current.getLayer()?.batchDraw();
				}
			};
			img.onerror = () => {
				console.error("Failed to load image:", svgImage);
			};
		} else if (internalImageRef.current) {
			internalImageRef.current.image(undefined);
			internalImageRef.current.getLayer()?.batchDraw();
		}
	}, [svgImage]);

	return (
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

const InlineImage: React.FC<KonvaImageProps> = (props) => {
	const [konvaImageNode, setKonvaImageNode] = useState<KonvaImageType | null>(
		null
	);

	const inlineDblClick = () => {
		if (!konvaImageNode) {
			console.error("konvaImageNode is null");
			return;
		}

		const stage = konvaImageNode.getStage();
		if (!stage) {
			console.error("Stage is null");
			return;
		}

		console.log("imgnode", konvaImageNode);
		console.log("stage", stage);

		const imagePosition = konvaImageNode.absolutePosition();
		const imageSize = {
			width: konvaImageNode.width(),
			height: konvaImageNode.height(),
		};

		const containerRect = stage.container().getBoundingClientRect();
		const x = containerRect.left + imagePosition.x;
		const y = containerRect.top + imagePosition.y;

		props.setEditorEl((prev) => ({
			...prev,
			x,
			y,
			open: true,
			...imageSize,
		}));
	};

	return !props.editorEl.open ? (
		<BaseImage
			{...props}
			setKonvaImageNode={setKonvaImageNode}
			handleDblClick={inlineDblClick}
		/>
	) : (
		<></>
	);
};

const InternalImage: React.FC<KonvaImageProps> = (props) => {
	const imageRef = useRef(null);
	const internalDblClick = () => {
		props.setEditorEl((prev) => ({
			...prev,
			open: true,
		}));
	};

	return (
		<BaseImage
			{...props}
			imageRef={imageRef}
			handleDblClick={internalDblClick}
		/>
	);
};

const Image = {
	Inline: InlineImage,
	Internal: InternalImage,
};

export default Image;
