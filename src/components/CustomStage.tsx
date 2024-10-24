import React, { useState, useRef, useEffect, createContext } from "react";
import { Stage, StageProps } from "react-konva";
import Konva from "konva";
import { FiberProvider } from "its-fine";
interface CustomStageProps extends StageProps {
	children?: React.ReactNode;
}
export const HtmlContainerContext = createContext<HTMLElement | null>(null);

const CustomStage = React.forwardRef<Konva.Stage, CustomStageProps>(
	(props, ref) => {
		const stageRef = useRef<Konva.Stage | null>(null);
		const containerRef = useRef<HTMLDivElement | null>(null);

		useEffect(() => {
			if (stageRef.current) {
				const container = stageRef.current.container();
				container.style.position = "relative";
			}
		}, []);

		return (
			<FiberProvider>
				<div style={{ position: "relative" }}>
					<Stage
						ref={(node) => {
							stageRef.current = node;
							if (typeof ref === "function") {
								ref(node);
							} else if (ref) {
								ref.current = node;
							}
						}}
						{...props}
					>
						<HtmlContainerContext.Provider value={containerRef.current}>
							{props.children}
						</HtmlContainerContext.Provider>
					</Stage>
					<div
						ref={containerRef}
						style={{ position: "absolute", top: 0, left: 0 }}
					/>
				</div>
			</FiberProvider>
		);
	}
);

export default CustomStage;
