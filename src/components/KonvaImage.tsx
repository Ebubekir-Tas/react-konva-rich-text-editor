import { useRef, useState, useEffect, Dispatch, SetStateAction, } from "react";
import { Image as KonvaImage } from "react-konva";
import { Image as KonvaImageType } from "konva/lib/shapes/Image";
import { ImageConfig } from "konva/lib/shapes/Image";
import { InternalEditorEl, InlineEditorEl, ExternalEditorEl } from "../types";
import { InlineEditor } from "./InlineEditor";
import { InternalEditor } from "./InternalEditor";
import { Html } from "../html";
import { generateSvgFromHtml } from "../utilts";

interface BaseImageProps extends Omit<ImageConfig, "image"> {
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

	useEffect(() => {
		if (svgImage) {
			const img = new window.Image();
			img.src = svgImage;

			img.onload = () => {
				if (internalImageRef.current) {
					internalImageRef.current.image(img);
					internalImageRef.current.getLayer()?.batchDraw();
				}

				if (
					previousUrlRef.current &&
					previousUrlRef.current.startsWith("blob:")
				) {
					URL.revokeObjectURL(previousUrlRef.current);
				}
				previousUrlRef.current = svgImage;
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
			image={restProps?.image || null}
			{...restProps}
		/>
	);
};

interface InlineImageProps extends BaseImageProps {
	editorEl: InlineEditorEl;
	setEditorEl: React.Dispatch<React.SetStateAction<InlineEditorEl>>;
	editorStyle: React.CSSProperties;
	toolbarStyle: React.CSSProperties;
	initialText: string;
}

const InlineImage: React.FC<InlineImageProps> = (props) => {
	const { editorEl, setEditorEl, initialText, editorStyle, toolbarStyle, ...rest } = props;

	const [konvaImageNode, setKonvaImageNode] = useState<KonvaImageType | null>(
		null
	);

	const [text, setText] = useState(initialText);
	const [svgImage, setSvgImage] = useState("");

	useEffect(() => {
		if (!svgImage) {
			const initialSvgUrl = generateSvgFromHtml(text, editorEl);
			setSvgImage(initialSvgUrl);
		}
	}, [svgImage, editorEl, text, setSvgImage]);

	const inlineDblClick = () => {
		if (!konvaImageNode) {
			console.error("konvaImageNode is null");
			return;
		}

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

	return (
		<>
			{!editorEl.open ? (
				<BaseImage
					{...rest}
					svgImage={svgImage}
					setKonvaImageNode={setKonvaImageNode}
					handleDblClick={inlineDblClick}
				/>
			) : (
				<Html
					divProps={{
						style: {
							zIndex: 10,
						},
					}}
				>
					<InlineEditor
						text={text}
						setText={setText}
						setSvgImage={setSvgImage}
						setEditorEl={setEditorEl}
						editorEl={editorEl}
						editorStyle={editorStyle || {}}
						toolbarStyle={toolbarStyle ||{}}
					/>
				</Html>
			)}
		</>
	);
};

interface InternalImageProps extends BaseImageProps {
	editorEl: InternalEditorEl;
	setEditorEl: React.Dispatch<React.SetStateAction<InternalEditorEl>>;
	editorStyle?: React.CSSProperties;
	toolbarStyle?: React.CSSProperties;
	initialText: string;
}
const InternalImage: React.FC<InternalImageProps> = (props) => {
	const { editorEl, setEditorEl, initialText, editorStyle, toolbarStyle, ...rest } = props;

	const [text, setText] = useState(initialText);
	const [svgImage, setSvgImage] = useState("");

	useEffect(() => {
		if (!svgImage) {
			const initialSvgUrl = generateSvgFromHtml(text, editorEl);
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
		<Html
			divProps={{
				style: {
					zIndex: 10,
				},
			}}
		>
			<InternalEditor
				text={text}
				setText={setText}
				setSvgImage={setSvgImage}
				setEditorEl={setEditorEl}
				editorEl={editorEl}
				editorStyle={editorStyle||{}}
				toolbarStyle={toolbarStyle ||{}}
			/>
		</Html>
	);
};

interface ExternalImageProps {
	svgImage: string;
	setSvgImage: Dispatch<SetStateAction<string>>
	initialText?: string;
	editorEl: ExternalEditorEl,
}
const ExternalImage: React.FC<BaseImageProps & ExternalImageProps> = ({ svgImage, ...props }) => {
	return <BaseImage svgImage={svgImage} {...props} />;
};

const Image = {
	Inline: InlineImage,
	Internal: InternalImage,
	External: ExternalImage,
};

export default Image;
