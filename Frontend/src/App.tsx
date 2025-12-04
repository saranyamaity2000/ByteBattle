import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./providers/AuthProvider";
import { useAuthContext } from "./hooks/context-hooks/useAuthContext";
import Navbar from "./components/Navbar";
import { useEffect } from "react";
import Home from "./pages/Home";
import Problems from "./pages/Problems";
import Problem from "./pages/Problem";
import CraftProblem from "./pages/CraftProblem";
import ModifyProblem from "./pages/ModifyProblem";
import { PageLoaderProvider } from "./providers/PageLoaderProvider";
import { usePageLoaderContext } from "./hooks/context-hooks/usePageLoaderContext";
import { FocusModeProvider } from "./providers/FocusModeProvider";
import { BattleSocketProvider } from "./providers/BattleSocketProvider";
import { BattlePage } from "./pages/BattlePage";

function AppContent() {
	const { loading } = useAuthContext();
	const { setIsPageLoading } = usePageLoaderContext();

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
					<Route path="/problem/:problemSlug" element={<Problem />} />
					<Route path="/craft-problem" element={<CraftProblem />} />
					<Route path="/problem/modify/:problemSlug" element={<ModifyProblem />} />
					<Route path="/battle" element={<BattlePage />} />
				</Routes>
			</div>
		</Router>
	);
}

function App() {
	return (
		<PageLoaderProvider>
			<FocusModeProvider>
				<AuthProvider>
					{/* Battle Socket Provier depends on Auth and FocusMode */}
					<BattleSocketProvider>
						<AppContent />
					</BattleSocketProvider>
				</AuthProvider>
			</FocusModeProvider>
		</PageLoaderProvider>
	);
}

export default App;
