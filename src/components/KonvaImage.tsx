import { useRef, useState, useEffect, Dispatch, SetStateAction } from "react";
import { Image as KonvaImage } from "react-konva";
import { Image as KonvaImageType } from "konva/lib/shapes/Image";
import { ImageConfig } from "konva/lib/shapes/Image";
import { InternalEditorEl, InlineEditorEl, ExternalEditorEl } from "../types";
import { InlineEditor } from "./InlineEditor";
import { InternalEditor } from "./InternalEditor";
import { Html } from "../html";
import { generateSvgFromHtml } from "../utils";

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
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (svgImage) {
      console.log('Loading image from svgImage:', svgImage);
      const img = new window.Image();
      img.src = svgImage;

      img.onload = () => {
        console.log('Image loaded successfully');
        setImageElement(img);
      };

      img.onerror = (e) => {
        console.error('Failed to load image:', svgImage, e);
      };

      // Cleanup old Blob URL
      return () => {
        if (previousUrlRef.current && previousUrlRef.current.startsWith("blob:")) {
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
	editorEl: InlineEditorEl;
	setEditorEl: React.Dispatch<React.SetStateAction<InlineEditorEl>>;
	editorStyle?: React.CSSProperties;
	toolbarStyle?: React.CSSProperties;
	initialText: string;
}

const InlineImage = (props: InlineImageProps) => {
	const {
		editorEl,
		setEditorEl,
		initialText,
		editorStyle,
		toolbarStyle,
		...rest
	} = props;

	const [konvaImageNode, setKonvaImageNode] = useState<KonvaImageType | null>(
		null
	);
	const [text, setText] = useState(initialText);
	const [svgImage, setSvgImage] = useState("");

	const [parentContainer, setParentContainer] = useState(null);
	useEffect(() => {
		if (konvaImageNode) {
			const stage = konvaImageNode.getStage();
			if (stage) {
				const stageContainer = stage.container(); // .konvajs-content
				if (stageContainer) {
					stageContainer.style.position = "relative";
					// @ts-ignore
					setParentContainer(stageContainer);
				}
			}
		}
	}, [konvaImageNode]);


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

	console.log('svg image', svgImage)

	return (
<>
  <BaseImage
    {...rest}
    svgImage={svgImage}
    setKonvaImageNode={setKonvaImageNode}
    handleDblClick={inlineDblClick}
    visible={!editorEl.open}
    listening={!editorEl.open}
  />
  {editorEl.open &&  (
    <Html container={parentContainer}>
      <div
        style={{
          zIndex: 1000,
        }}
      >
        <InlineEditor
          initialText={initialText} // Pass the initialText for editor initialization
          svgImage={svgImage} // Keep the SVG in sync with the editor
          text={text}
          setText={setText}
          setSvgImage={setSvgImage}
          setEditorEl={setEditorEl}
          editorEl={editorEl}
          editorStyle={editorStyle}
          toolbarStyle={toolbarStyle}


        />
      </div>
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
		</Html>
	);
};

interface ExternalImageProps {
	svgImage: string;
	setSvgImage: Dispatch<SetStateAction<string>>;
	initialText?: string;
	editorEl: ExternalEditorEl;
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
