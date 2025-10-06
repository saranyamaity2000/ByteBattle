import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";

export default function Navbar() {
	const location = useLocation();

	return (
		<nav className="w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 items-center justify-between">
					{/* Logo */}
					<div className="flex items-center">
						<Link
							to="/"
							className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
						>
							ByteBattle
						</Link>
					</div>

					{/* Navigation items */}
					<div className="hidden md:block">
						<div className="ml-10 flex items-baseline space-x-4">
							<Link to="/problems">
								<Button
									variant="ghost"
									className={`text-gray-600 hover:text-gray-900 ${
										location.pathname === "/problems"
											? "bg-gray-100 text-gray-900"
											: ""
									}`}
								>
									Problems
								</Button>
							</Link>
							<Button variant="ghost" className="text-gray-600 hover:text-gray-900">
								Leaderboard
							</Button>
							<Button variant="ghost" className="text-gray-600 hover:text-gray-900">
								About
							</Button>
							<Link to="/craft-problem">
								<Button
									variant="ghost"
									className="text-gray-600 hover:text-gray-900"
								>
									Craft a Problem
								</Button>
							</Link>
						</div>
					</div>

					{/* Right side buttons */}
					<div className="flex items-center space-x-4">
						<Button variant="outline">Sign In</Button>
						<Button>Get Started</Button>
					</div>
				</div>
			</div>
		</nav>
	);
}
