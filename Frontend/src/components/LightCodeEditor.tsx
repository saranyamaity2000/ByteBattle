import { useState, useCallback, useRef, useEffect } from "react";
import { Editor, type OnMount } from "@monaco-editor/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import VerticalResizablePane from "./VerticalResizablePane";
import TestCaseInput, { type TestCase } from "./TestCaseInput";

type EditorInstance = Parameters<OnMount>[0];

interface LightCodeEditorProps {
	initialCode?: Record<string, string>;
	onRunCode: (code: string, language: string, testCases: TestCase[]) => void;
	onSubmit: (code: string, language: string) => void;
	isRunning: boolean;
	isSubmitting: boolean;
	problemId?: string;
}

export default function LightCodeEditor({
	initialCode = {},
	onRunCode,
	onSubmit,
	isRunning,
	isSubmitting,
	problemId,
}: LightCodeEditorProps) {
	const [language, setLanguage] = useState<string>("cpp");
	
	// Load code from localStorage if available, otherwise use initial code
	const getStorageKey = useCallback((lang: string) => problemId ? `problem_${problemId}_${lang}` : null, [problemId]);
	
	// Store code for each language separately
	const [codeByLanguage, setCodeByLanguage] = useState<Record<string, string>>(() => {
		const savedCode: Record<string, string> = {};
		
		// Try to load saved code for each language
		["cpp", "python"].forEach((lang) => {
			const storageKey = problemId ? `problem_${problemId}_${lang}` : null;
			if (storageKey) {
				const saved = localStorage.getItem(storageKey);
				if (saved) {
					savedCode[lang] = saved;
				}
			}
		});
		
		return {
			cpp: savedCode.cpp || initialCode.cpp || "// Your code here",
			python: savedCode.python || initialCode.python || "# Your code here",
		};
	});
	const [testCases, setTestCases] = useState<TestCase[]>([]);
	const editorRef = useRef<EditorInstance | null>(null);

	const languages = [
		{ id: "cpp", name: "C++", monacoId: "cpp" },
		{ id: "python", name: "Python", monacoId: "python" },
	];

	// Get current code for the selected language
	const currentCode = codeByLanguage[language];

	const handleLanguageChange = useCallback((newLanguage: string) => {
		setLanguage(newLanguage);
	}, []);

	const handleCodeChange = useCallback(
		(value: string | undefined) => {
			const newValue = value || "";
			setCodeByLanguage((prev) => ({
				...prev,
				[language]: newValue,
			}));
		},
		[language]
	);
	
	// Save code to localStorage whenever it changes
	useEffect(() => {
		if (problemId) {
			Object.entries(codeByLanguage).forEach(([lang, code]) => {
				const storageKey = getStorageKey(lang);
				if (storageKey) {
					localStorage.setItem(storageKey, code);
				}
			});
		}
	}, [codeByLanguage, problemId, getStorageKey]);

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

	const handleRunCode = useCallback(() => {
		onRunCode(codeByLanguage[language], language, testCases);
	}, [codeByLanguage, language, testCases, onRunCode]);

	const handleSubmit = useCallback(() => {
		onSubmit(codeByLanguage[language], language);
	}, [codeByLanguage, language, onSubmit]);

	const handleTestCasesChange = useCallback((newTestCases: TestCase[]) => {
		setTestCases(newTestCases);
	}, []);

	// Editor component
	const editorPane = (
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

				<div className="flex items-center gap-3">
					<Button
						onClick={handleRunCode}
						disabled={isRunning || isSubmitting}
						variant="outline"
						className="px-4"
						title="Run code with custom test cases (Coming Soon)"
					>
						{isRunning ? "Running..." : "Run Code"}
						<span className="ml-2 text-xs text-gray-500">(TODO)</span>
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={isSubmitting || isRunning}
						className="px-6"
					>
						{isSubmitting ? "Submitting..." : "Submit"}
					</Button>
				</div>
			</div>

			{/* Editor */}
			<div className="flex-1 overflow-hidden">
				<Editor
					height="100%"
					language={languages.find((l) => l.id === language)?.monacoId || "cpp"}
					value={currentCode}
					onChange={handleCodeChange}
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

	// Test cases pane
	const testCasesPane = <TestCaseInput onTestCasesChange={handleTestCasesChange} />;

	return (
		<VerticalResizablePane
			topPane={editorPane}
			bottomPane={testCasesPane}
			defaultHeight={70}
			minHeight={40}
			maxHeight={85}
		/>
	);
}
