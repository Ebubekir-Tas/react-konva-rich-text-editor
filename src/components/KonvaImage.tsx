import { useRef, useEffect } from "react";
import { Image } from "react-konva";

import { ImageConfig } from "konva/lib/shapes/Image";

interface KonvaImageProps extends ImageConfig {
	svgImage: string;
}

export const KonvaImage: React.FC<KonvaImageProps> = ({
	svgImage,
	...props
}) => {
	const imageRef = useRef<any>(null);

	const loadImage = (
		url: string,
		callback: (img: HTMLImageElement) => void
	) => {
		const img = new window.Image();
		img.src = url;
		img.onload = () => {
			callback(img);
		};
	};

	useEffect(() => {
		if (svgImage) {
			loadImage(svgImage, (img) => {
				if (imageRef.current) {
					imageRef.current.image(img);
					imageRef.current.getLayer()?.batchDraw();
				}
			});
		}
	}, [svgImage]);

	return <Image ref={imageRef} {...props} />;
};
