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
	fontSize?: number;
}

interface BaseImageProps extends ImageConfig {
	svgImage: string;
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

interface InlineImageProps extends BaseImageProps {
	editorEl: EditorEl;
	setEditorEl: React.Dispatch<React.SetStateAction<EditorEl>>;
}

const InlineImage: React.FC<InlineImageProps> = (props) => {
	const { editorEl, setEditorEl } = props;
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

		const imagePosition = konvaImageNode.absolutePosition();
		const imageSize = {
			width: konvaImageNode.width(),
			height: konvaImageNode.height(),
		};

		const containerRect = stage.container().getBoundingClientRect();
		const x = containerRect.left + imagePosition.x;
		const y = containerRect.top + imagePosition.y;

		setEditorEl((prev) => ({
			...prev,
			x,
			y,
			open: true,
			...imageSize,
		}));
	};

	return editorEl.open ? (
		<BaseImage
			{...props}
			setKonvaImageNode={setKonvaImageNode}
			handleDblClick={inlineDblClick}
		/>
	) : (
		<></>
	);
};

interface InternalImageProps extends BaseImageProps {
	editorEl: EditorEl;
	setEditorEl: React.Dispatch<React.SetStateAction<EditorEl>>;
}
const InternalImage: React.FC<InternalImageProps> = (props) => {
	const { setEditorEl } = props;

	const imageRef = useRef(null);
	const internalDblClick = () => {
		setEditorEl((prev) => ({
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

const ExternalImage: React.FC<BaseImageProps> = ({ svgImage, ...props }) => {
	return <BaseImage svgImage={svgImage} {...props} />;
};

const Image = {
	Inline: InlineImage,
	Internal: InternalImage,
	External: ExternalImage,
};

export default Image;
