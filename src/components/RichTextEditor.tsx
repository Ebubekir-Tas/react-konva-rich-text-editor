import {
	useState,
	useEffect,
	forwardRef,
	useImperativeHandle,
} from "react";
import { Image as KonvaImage } from "react-konva";
import type { Image as KonvaImageType } from "konva/lib/shapes/Image";

import { generateSvgFromHtml } from "../utils";
import { Html } from "../html";
import { InlineEditor } from "./InlineEditor";
import { EditorProps, EditorEl } from "../types";

export type RichTextEditorRef = KonvaImageType & {
	redraw: () => void;
};

const RichTextEditor = forwardRef<RichTextEditorRef, EditorProps>(
	(props, parentRef) => {
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

		const [svgImage, setSvgImage] = useState("");
		const [konvaImageNode, setKonvaImageNode] = useState<KonvaImageType | null>(
			null
		);
		const [parentContainer, setParentContainer] = useState<HTMLElement | null>(
			null
		);
		const [imageElement, setImageElement] = useState<
			CanvasImageSource | undefined
		>(undefined);

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

		const [loaded, setLoaded] = useState(false); 
		useEffect(() => {
			if (!loaded) {
			if (svgImage) {
				const img = new window.Image();
				img.src = svgImage;

				img.onload = () => {
					setImageElement(img);
				};

				img.onerror = (e) => {
					console.error("Failed to load image:", svgImage, e);
				};
			} else {
				setImageElement(undefined);
			}
			} else {
				setLoaded(true)
			}
		}, [svgImage]);

		useEffect(() => {
			if (konvaImageNode && imageElement) {
				konvaImageNode.image(imageElement);
				konvaImageNode.getLayer()?.batchDraw();
			}
		}, [imageElement, konvaImageNode]);

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
		
		function doRedraw(forcedEl?: EditorEl) {
      if (!konvaImageNode) {
        console.warn("Cannot call redraw; Konva node not ready.");
        return;
      }

			const el = forcedEl ?? editorEl;
			const newSvg = generateSvgFromHtml(el.content, el, editorStyle);
		
			const offscreenImg = new window.Image();
			offscreenImg.src = newSvg;
		
			offscreenImg.onload = () => {
				setSvgImage(newSvg);
		
				konvaImageNode.x(el.x);
				konvaImageNode.y(el.y);
				konvaImageNode.width(el.width);
				konvaImageNode.height(el.height);
		
				konvaImageNode.getLayer()?.batchDraw();
			};
		
			offscreenImg.onerror = (err) => {
				console.error("Error loading new SVG", err);
		
				konvaImageNode.x(el.x);
				konvaImageNode.y(el.y);
				konvaImageNode.width(el.width);
				konvaImageNode.height(el.height);
				konvaImageNode.getLayer()?.batchDraw();
			};
    }

		useImperativeHandle(
			parentRef,
			() => {
				if (!konvaImageNode) {
					return {
						redraw: () => {
							console.warn("Cannot call redraw; KonvaImageNode is not initialized.");
						},
					} as unknown as RichTextEditorRef;
				}

				return Object.assign({}, konvaImageNode, {
					redraw: doRedraw
				});
			},
			[konvaImageNode, editorEl, editorStyle, svgImage]
		);


    function handleEditorClose(finalHtml: string) {
      const forcedEl = { ...editorEl, content: finalHtml, open: false };
      setEditorEl(forcedEl);
      doRedraw(forcedEl); 
    }

		return (
			<>
				<KonvaImage
					image={imageElement}
					visible={!editorEl.open}
					onDblClick={inlineDblClick}
					listening={!editorEl.open}
					ref={(node) => setKonvaImageNode(node)}
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
								handleEditorClose={handleEditorClose}
							/>
						</div>
					</Html>
				)}
			</>
		);
	}
);

RichTextEditor.displayName = "RichTextEditor";

export { RichTextEditor };
