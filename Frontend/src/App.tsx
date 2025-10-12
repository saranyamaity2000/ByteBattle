import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./providers/AuthProvider";
import { useAuthContext } from "./hooks/context-hooks/useAuth";
import Navbar from "./components/Navbar";
import PageLoader from "./components/PageLoader";
import Home from "./pages/Home";
import Problems from "./pages/Problems";
import Problem from "./pages/Problem";
import CraftProblem from "./pages/CraftProblem";
import ModifyProblem from "./pages/ModifyProblem";

function AppContent() {
	const { loading } = useAuthContext();

	return (
		<Router>
			<div className="min-h-screen">
				<PageLoader isLoading={loading} />
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
		<AuthProvider>
			<AppContent />
		</AuthProvider>
	);
}

export default App;
