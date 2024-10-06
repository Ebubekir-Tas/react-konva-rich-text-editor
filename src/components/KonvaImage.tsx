import { useRef, useEffect, forwardRef } from "react";
import { Image } from "react-konva";
import { Image as KonvaImageType } from "konva/lib/shapes/Image";
import { ImageConfig } from "konva/lib/shapes/Image";

interface KonvaImageProps extends Omit<ImageConfig, 'image'> {
  svgImage: string;
}

export const KonvaImage: React.FC<KonvaImageProps> = ({
  svgImage,
  onEditStart,
  ...restProps
}) => {
  const imageRef = useRef<KonvaImageType>(null);

  useEffect(() => {
    if (svgImage) {
      const img = new window.Image();
      img.src = svgImage;
      img.onload = () => {
        if (imageRef.current) {
          imageRef.current.image(img);
          imageRef.current.getLayer()?.batchDraw();
        }
      };
      img.onerror = () => {
        console.error('Failed to load image:', svgImage);
      };
    }
  }, [svgImage]);

  const handleDblClick = (event: any) => {
    const stage = event.target.getStage();
    const pointerPosition = stage.getPointerPosition();

    const containerRect = stage.container().getBoundingClientRect();
    const x = containerRect.left + pointerPosition.x;
    const y = containerRect.top + pointerPosition.y;

    onEditStart({ x, y });
  };

  return (
    <Image
      ref={imageRef}
			image={undefined}
      onDblClick={handleDblClick}
      {...restProps}
    />
  );
};