import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useProblems } from "../hooks/useProblems";
import { type Problem } from "../types/problem";
import { Button } from "../components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../components/ui/select";
import { ArrowLeft, Filter, AlertCircle, RefreshCw } from "lucide-react";

export default function Problems() {
	const { problems, isLoading, error, refetch } = useProblems();
	const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
	const [categoryFilter, setCategoryFilter] = useState<string>("all");

	const categories = useMemo(() => {
		return Array.from(new Set(problems.map((p) => p.category)));
	}, [problems]);

	const filteredProblems = useMemo(() => {
		let filtered = problems;

		if (difficultyFilter !== "all") {
			filtered = filtered.filter((p) => p.difficulty === difficultyFilter);
		}

		if (categoryFilter !== "all") {
			filtered = filtered.filter((p) => p.category === categoryFilter);
		}

		return filtered;
	}, [problems, difficultyFilter, categoryFilter]);

	const handleDifficultyFilter = (value: string) => {
		setDifficultyFilter(value);
	};

	const handleCategoryFilter = (value: string) => {
		setCategoryFilter(value);
	};

	const getDifficultyColor = (difficulty: Problem["difficulty"]) => {
		switch (difficulty) {
			case "Easy":
				return "bg-green-100 text-green-800 border-green-200";
			case "Medium":
				return "bg-yellow-100 text-yellow-800 border-yellow-200";
			case "Hard":
				return "bg-red-100 text-red-800 border-red-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading problems...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
				<div className="text-center max-w-md">
					<AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
					<h2 className="text-2xl font-bold text-gray-900 mb-2">
						Error Loading Problems
					</h2>
					<p className="text-gray-600 mb-4">{error}</p>
					<Button onClick={refetch} className="flex items-center gap-2">
						<RefreshCw className="h-4 w-4" />
						Try Again
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<div className="flex items-center mb-8">
					<Link to="/">
						<Button variant="ghost" className="mr-4">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back to Home
						</Button>
					</Link>
					<div>
						<h1 className="text-4xl font-bold text-gray-900">Problems</h1>
						<p className="text-gray-600 mt-2">Choose a problem to start coding</p>
					</div>
				</div>

				{/* Filters */}
				<div className="bg-white rounded-lg shadow-md p-6 mb-8">
					<div className="flex items-center gap-4 flex-wrap">
						<div className="flex items-center gap-2">
							<Filter className="h-4 w-4 text-gray-500" />
							<span className="text-sm font-medium text-gray-700">Filter by:</span>
						</div>

						<div className="flex items-center gap-2">
							<label className="text-sm text-gray-600">Difficulty:</label>
							<Select value={difficultyFilter} onValueChange={handleDifficultyFilter}>
								<SelectTrigger className="w-32">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All</SelectItem>
									<SelectItem value="Easy">Easy</SelectItem>
									<SelectItem value="Medium">Medium</SelectItem>
									<SelectItem value="Hard">Hard</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="flex items-center gap-2">
							<label className="text-sm text-gray-600">Category:</label>
							<Select value={categoryFilter} onValueChange={handleCategoryFilter}>
								<SelectTrigger className="w-40">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Categories</SelectItem>
									{categories.map((category) => (
										<SelectItem key={category} value={category}>
											{category}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="text-sm text-gray-500">
							Showing {filteredProblems.length} of {problems.length} problems
						</div>
					</div>
				</div>

				{/* Problems List */}
				<div className="space-y-4">
					{filteredProblems.map((problem, index) => (
						<Link key={problem.id} to={`/problem/${problem.id}`} className="block">
							<div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200 hover:border-blue-300">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-4">
										<div className="text-2xl font-bold text-gray-400 min-w-[3rem]">
											#{index + 1}
										</div>
										<div className="flex-1">
											<h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
												{problem.title}
											</h3>
											<p className="text-gray-600 text-sm line-clamp-2">
												{problem.description.substring(0, 150)}...
											</p>
										</div>
									</div>

									<div className="flex items-center gap-3">
										<span
											className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(
												problem.difficulty
											)}`}
										>
											{problem.difficulty}
										</span>
										<span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
											{problem.category}
										</span>
									</div>
								</div>
							</div>
						</Link>
					))}
				</div>

				{filteredProblems.length === 0 && (
					<div className="text-center py-12">
						<div className="text-gray-400 mb-4">
							<Filter className="h-16 w-16 mx-auto" />
						</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-2">
							No problems found
						</h3>
						<p className="text-gray-600">
							Try adjusting your filters to see more problems.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
