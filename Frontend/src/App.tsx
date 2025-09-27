import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Problems from "./pages/Problems";
import Problem from "./pages/Problem";

function App() {
	return (
		<Router>
			<div className="min-h-screen">
				<Navbar />
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/problems" element={<Problems />} />
					<Route path="/problem/:problemId" element={<Problem />} />
				</Routes>
			</div>
		</Router>
	);
}

export default App;
