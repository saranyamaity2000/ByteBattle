import { useState, useCallback, useRef, useEffect } from "react";

interface VerticalResizablePaneProps {
	topPane: React.ReactNode;
	bottomPane: React.ReactNode;
	defaultHeight?: number;
	minHeight?: number;
	maxHeight?: number;
}

export default function VerticalResizablePane({
	topPane,
	bottomPane,
	defaultHeight = 70,
	minHeight = 40,
	maxHeight = 85,
}: VerticalResizablePaneProps) {
	const [topHeight, setTopHeight] = useState(defaultHeight);
	const [isDragging, setIsDragging] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	const handleMouseDown = useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		setIsDragging(true);
	}, []);

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!isDragging || !containerRef.current) return;

			const container = containerRef.current;
			const containerRect = container.getBoundingClientRect();
			const newTopHeight = ((e.clientY - containerRect.top) / containerRect.height) * 100;

			const clampedHeight = Math.min(Math.max(newTopHeight, minHeight), maxHeight);
			setTopHeight(clampedHeight);
		},
		[isDragging, minHeight, maxHeight]
	);

	const handleMouseUp = useCallback(() => {
		setIsDragging(false);
	}, []);

	// Add global mouse event listeners
	useEffect(() => {
		if (isDragging) {
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
			document.body.style.cursor = "row-resize";
			document.body.style.userSelect = "none";
		} else {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
			document.body.style.cursor = "";
			document.body.style.userSelect = "";
		}

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
			document.body.style.cursor = "";
			document.body.style.userSelect = "";
		};
	}, [isDragging, handleMouseMove, handleMouseUp]);

	return (
		<div ref={containerRef} className="flex flex-col h-full w-full">
			{/* Top Pane */}
			<div style={{ height: `${topHeight}%` }} className="overflow-hidden">
				{topPane}
			</div>

			{/* Resizer */}
			<div
				className={`h-1 bg-gray-300 cursor-row-resize hover:bg-blue-400 transition-colors relative group ${
					isDragging ? "bg-blue-500" : ""
				}`}
				onMouseDown={handleMouseDown}
			>
				<div className="absolute inset-x-0 -top-1 -bottom-1 group-hover:bg-blue-400 group-hover:opacity-20 transition-colors" />
				{/* Visual indicator dots */}
				<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
					<div className="flex space-x-1">
						<div className="w-1 h-1 bg-gray-500 rounded-full"></div>
						<div className="w-1 h-1 bg-gray-500 rounded-full"></div>
						<div className="w-1 h-1 bg-gray-500 rounded-full"></div>
					</div>
				</div>
			</div>

			{/* Bottom Pane */}
			<div style={{ height: `${100 - topHeight}%` }} className="overflow-hidden">
				{bottomPane}
			</div>
		</div>
	);
}
