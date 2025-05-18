import { useRef, useState, useEffect } from "react";
import { Image as KonvaImage } from "react-konva";
import { Image as KonvaImageType } from "konva/lib/shapes/Image";


import { RichTextProps } from "../types";

const RichText: React.FC<RichTextProps> = ({
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

export { RichText }