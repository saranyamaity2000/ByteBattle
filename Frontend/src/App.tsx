import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Problems from "./pages/Problems";
import Problem from "./pages/Problem";
import CraftProblem from "./pages/CraftProblem";
import ModifyProblem from "./pages/ModifyProblem";

function App() {
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

export default App;
