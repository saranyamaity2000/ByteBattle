import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { ArrowRight, Code, Trophy, Users } from "lucide-react";

export default function Home() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
			<main className="container mx-auto px-4 py-8">
				{/* Hero Section with Glowing Title */}
				<div className="text-center mb-16">
					<h1 className="text-6xl md:text-8xl font-bold gradient-text glow-text mb-6">
						ByteBattle
					</h1>
					<p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
						Challenge yourself with coding problems and improve your programming skills.
						Practice algorithms, data structures, and problem-solving techniques.
					</p>

					{/* Main CTA */}
					<Link to="/problems">
						<Button
							size="lg"
							className="text-lg px-8 py-4 bg-blue-600 hover:bg-blue-700 group"
						>
							Explore Problems
							<ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
						</Button>
					</Link>
				</div>

				{/* Features Section */}
				<div className="grid md:grid-cols-3 gap-8 mb-16">
					<div className="text-center p-6 rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow">
						<div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
							<Code className="h-8 w-8 text-blue-600" />
						</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-2">
							Coding Practice
						</h3>
						<p className="text-gray-600">
							Practice with a variety of algorithmic problems from easy to hard
							difficulty levels.
						</p>
					</div>

					<div className="text-center p-6 rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow">
						<div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
							<Trophy className="h-8 w-8 text-green-600" />
						</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-2">Compete & Win</h3>
						<p className="text-gray-600">
							Participate in coding battles and climb the leaderboard to showcase your
							skills.
						</p>
					</div>

					<div className="text-center p-6 rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow">
						<div className="bg-purple-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
							<Users className="h-8 w-8 text-purple-600" />
						</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-2">Learn Together</h3>
						<p className="text-gray-600">
							Join a community of developers and learn from each other's solutions and
							approaches.
						</p>
					</div>
				</div>

				{/* Quick Stats */}
				<div className="bg-white rounded-lg shadow-lg p-8 mb-16">
					<h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
						Ready to Start?
					</h2>
					<div className="grid md:grid-cols-4 gap-6 text-center">
						<div>
							<div className="text-3xl font-bold text-blue-600 mb-2">8</div>
							<div className="text-gray-600">Problems Available</div>
						</div>
						<div>
							<div className="text-3xl font-bold text-green-600 mb-2">2</div>
							<div className="text-gray-600">Languages Supported</div>
						</div>
						<div>
							<div className="text-3xl font-bold text-purple-600 mb-2">3</div>
							<div className="text-gray-600">Difficulty Levels</div>
						</div>
						<div>
							<div className="text-3xl font-bold text-orange-600 mb-2">∞</div>
							<div className="text-gray-600">Learning Opportunities</div>
						</div>
					</div>
				</div>

				{/* Call to Action */}
				<div className="text-center">
					<h2 className="text-3xl font-bold text-gray-900 mb-4">
						Start Your Journey Today
					</h2>
					<p className="text-xl text-gray-600 mb-6">
						Choose from our curated collection of coding problems and begin practicing
						now.
					</p>
					<Link to="/problems">
						<Button size="lg" variant="outline" className="text-lg px-8 py-4">
							Browse All Problems
						</Button>
					</Link>
				</div>
			</main>
		</div>
	);
}
