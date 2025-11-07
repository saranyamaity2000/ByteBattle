import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./providers/AuthProvider";
import { useAuthContext } from "./hooks/context-hooks/useAuth";
import Navbar from "./components/Navbar";
import { useEffect } from "react";
import Home from "./pages/Home";
import Problems from "./pages/Problems";
import Problem from "./pages/Problem";
import CraftProblem from "./pages/CraftProblem";
import ModifyProblem from "./pages/ModifyProblem";
import { PageLoaderProvider } from "./providers/PageLoaderProvider";
import { usePageLoadingSetter } from "./hooks/context-hooks/usePageLoadingSetter";

function AppContent() {
	const { loading } = useAuthContext();
	const { setIsPageLoading } = usePageLoadingSetter();

	useEffect(() => {
		setIsPageLoading(loading);
	}, [loading, setIsPageLoading]);
	return (
		<Router>
			<div className="min-h-screen">
				<Navbar />
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/problems" element={<Problems />} />
					<Route path="/problem/:problemId" element={<Problem />} />
					<Route path="/craft-problem" element={<CraftProblem />} />
					<Route path="/problem/modify/:problemSlug" element={<ModifyProblem />} />
				</Routes>
			</div>
		</Router>
	);
}

function App() {
	return (
		<PageLoaderProvider>
			<AuthProvider>
				<AppContent />
			</AuthProvider>
		</PageLoaderProvider>
	);
}

export default App;
