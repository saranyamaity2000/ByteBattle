import { useState, useCallback, useRef, useEffect } from "react";
import { Editor, type OnMount } from "@monaco-editor/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";

type EditorInstance = Parameters<OnMount>[0];

interface LightCodeEditorProps {
	initialCode?: Record<string, string>;
	onSubmit: (code: string, language: string) => void;
	isSubmitting: boolean;
}

export default function LightCodeEditor({
	initialCode = {},
	onSubmit,
	isSubmitting,
}: LightCodeEditorProps) {
	const [language, setLanguage] = useState<string>("cpp");
	const [code, setCode] = useState<string>(initialCode[language] || "");
	const editorRef = useRef<EditorInstance | null>(null);

	const languages = [
		{ id: "cpp", name: "C++", monacoId: "cpp" },
		{ id: "python", name: "Python", monacoId: "python" },
	];

	useEffect(() => {
		if (initialCode[language]) {
			setCode(initialCode[language]);
		}
	}, [language, initialCode]);

	const handleLanguageChange = useCallback(
		(newLanguage: string) => {
			setLanguage(newLanguage);
			setCode(initialCode[newLanguage] || "");
		},
		[initialCode]
	);

	const handleEditorDidMount: OnMount = useCallback((editor) => {
		editorRef.current = editor;

		// Optimize performance - minimal settings for better performance
		editor.updateOptions({
			renderWhitespace: "none",
			renderControlCharacters: false,
			disableLayerHinting: true,
			fontLigatures: false,
			folding: false,
			glyphMargin: false,
			lineDecorationsWidth: 5,
			lineNumbersMinChars: 3,
		});

		// Handle scroll behavior
		const editorElement = editor.getDomNode();
		if (editorElement) {
			editorElement.addEventListener(
				"wheel",
				(e: WheelEvent) => {
					const scrollTop = editor.getScrollTop();
					const scrollHeight = editor.getScrollHeight();
					const clientHeight = editor.getLayoutInfo().height;

					const atTop = scrollTop <= 0;
					const atBottom = scrollTop >= scrollHeight - clientHeight;

					if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) {
						e.stopPropagation();
					}
				},
				{ passive: false }
			);
		}
	}, []);

	const handleSubmit = useCallback(() => {
		onSubmit(code, language);
	}, [code, language, onSubmit]);

	return (
		<div className="h-full flex flex-col bg-white">
			{/* Header */}
			<div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
				<div className="flex items-center gap-4">
					<span className="font-medium text-gray-700">Language:</span>
					<Select value={language} onValueChange={handleLanguageChange}>
						<SelectTrigger className="w-32">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{languages.map((lang) => (
								<SelectItem key={lang.id} value={lang.id}>
									{lang.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<Button onClick={handleSubmit} disabled={isSubmitting} className="px-6">
					{isSubmitting ? "Running..." : "Run Code"}
				</Button>
			</div>

			{/* Editor */}
			<div className="flex-1 overflow-hidden">
				<Editor
					height="100%"
					language={languages.find((l) => l.id === language)?.monacoId || "cpp"}
					value={code}
					onChange={(value) => setCode(value || "")}
					onMount={handleEditorDidMount}
					theme="vs-light"
					loading={
						<div className="flex items-center justify-center h-full bg-gray-50 text-gray-600">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
							Loading editor...
						</div>
					}
					options={{
						// Performance optimized settings
						minimap: { enabled: false },
						fontSize: 14,
						fontFamily: "'JetBrains Mono', 'Fira Code', 'Monaco', 'Menlo', monospace",
						wordWrap: "on",
						automaticLayout: true,
						scrollBeyondLastLine: false,
						padding: { top: 16, bottom: 16 },

						// Minimal UI for better performance
						renderWhitespace: "none",
						renderControlCharacters: false,
						disableLayerHinting: true,
						fontLigatures: true,
						smoothScrolling: true,
						cursorSmoothCaretAnimation: "off",

						// Scrollbar settings
						scrollbar: {
							vertical: "auto",
							horizontal: "auto",
							verticalScrollbarSize: 8,
							horizontalScrollbarSize: 8,
						},

						// Minimal features for performance
						codeLens: false,
						folding: false,
						lineNumbers: "on",
						lineDecorationsWidth: 5,
						lineNumbersMinChars: 3,
						overviewRulerLanes: 0,
						hideCursorInOverviewRuler: true,
						overviewRulerBorder: false,
						glyphMargin: false,
					}}
				/>
			</div>
		</div>
	);
}
