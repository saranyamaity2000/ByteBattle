import { useState, useCallback, useRef, useEffect } from "react";

interface ResizablePaneProps {
	leftPane: React.ReactNode;
	rightPane: React.ReactNode;
	defaultWidth?: number;
	minWidth?: number;
	maxWidth?: number;
}

export default function ResizablePane({
	leftPane,
	rightPane,
	defaultWidth = 50,
	minWidth = 20,
	maxWidth = 80,
}: ResizablePaneProps) {
	const [leftWidth, setLeftWidth] = useState(defaultWidth);
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
			const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

			const clampedWidth = Math.min(Math.max(newLeftWidth, minWidth), maxWidth);
			setLeftWidth(clampedWidth);
		},
		[isDragging, minWidth, maxWidth]
	);

	const handleMouseUp = useCallback(() => {
		setIsDragging(false);
	}, []);

	// Add global mouse event listeners
	useEffect(() => {
		if (isDragging) {
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
			document.body.style.cursor = "col-resize";
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
		<div ref={containerRef} className="flex h-full w-full">
			{/* Left Pane */}
			<div style={{ width: `${leftWidth}%` }} className="overflow-hidden">
				{leftPane}
			</div>

			{/* Resizer */}
			<div
				className={`w-1 bg-gray-300 cursor-col-resize hover:bg-blue-400 transition-colors relative group ${
					isDragging ? "bg-blue-500" : ""
				}`}
				onMouseDown={handleMouseDown}
			>
				<div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-blue-400 group-hover:opacity-20 transition-colors" />
				{/* Visual indicator dots */}
				<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
					<div className="flex flex-col space-y-1">
						<div className="w-1 h-1 bg-gray-500 rounded-full"></div>
						<div className="w-1 h-1 bg-gray-500 rounded-full"></div>
						<div className="w-1 h-1 bg-gray-500 rounded-full"></div>
					</div>
				</div>
			</div>

			{/* Right Pane */}
			<div style={{ width: `${100 - leftWidth}%` }} className="overflow-hidden">
				{rightPane}
			</div>
		</div>
	);
}
