import { Button } from "@/components/ui/button";
import { useBattleSocketContext } from "@/hooks/context-hooks/useBattleSocketContext";
import { usePageLoaderContext } from "@/hooks/context-hooks/usePageLoaderContext";
import { useState } from "react";
import { Swords, Wifi, WifiOff, Mail, AlertCircle } from "lucide-react";

export const BattlePage: React.FC = () => {
	const [opponentEmail, setOpponentEmail] = useState("");
	const [error, setError] = useState("");

	const { battleSocket, isSocketConnected } = useBattleSocketContext();
	const { setIsPageLoading } = usePageLoaderContext();

	const validateEmail = (email: string): boolean => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const handleChallange = () => {
		setError("");

		if (!opponentEmail.trim()) {
			setError("Please enter an email address");
			return;
		}

		if (!validateEmail(opponentEmail)) {
			setError("Please enter a valid email address");
			return;
		}

		battleSocket?.emit("challenge", { chanllangeToEmail: opponentEmail.trim() });
		setIsPageLoading(true);
	};

	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && opponentEmail.trim() && isSocketConnected) {
			handleChallange();
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
			<div className="max-w-4xl mx-auto space-y-6">
				{/* Header */}
				<div className="text-center space-y-2 pt-8">
					<div className="flex items-center justify-center gap-3">
						<Swords className="w-10 h-10 text-indigo-600" />
						<h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
							Battle Arena
						</h1>
						<Swords className="w-10 h-10 text-indigo-600" />
					</div>
					<p className="text-gray-600 text-lg">
						Challenge your friends to epic coding battles
					</p>
				</div>

				{/* Connection Status */}
				<div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							{isSocketConnected ? (
								<div className="flex items-center gap-2">
									<div className="relative">
										<Wifi className="w-5 h-5 text-green-600" />
										<span className="absolute -top-1 -right-1 flex h-3 w-3">
											<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
											<span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
										</span>
									</div>
									<span className="font-semibold text-green-700">Connected</span>
								</div>
							) : (
								<div className="flex items-center gap-2">
									<WifiOff className="w-5 h-5 text-red-600" />
									<span className="font-semibold text-red-700">Disconnected</span>
								</div>
							)}
						</div>
						{battleSocket?.id && (
							<div className="text-sm text-gray-500 font-mono bg-gray-100 px-3 py-1 rounded">
								ID: {battleSocket.id.substring(0, 8)}...
							</div>
						)}
					</div>
				</div>

				{/* Challenge Form */}
				{isSocketConnected ? (
					<div className="bg-white rounded-xl shadow-xl border-2 border-gray-200 overflow-hidden">
						<div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 border-b">
							<h2 className="text-2xl font-bold flex items-center gap-2">
								<Swords className="w-6 h-6" />
								Issue a Challenge
							</h2>
							<p className="text-gray-600 mt-2">
								Enter your opponent's email to start an epic coding duel
							</p>
						</div>
						<div className="p-6 space-y-6">
							<div className="space-y-2">
								<label
									htmlFor="email"
									className="text-base font-semibold flex items-center gap-2"
								>
									<Mail className="w-4 h-4" />
									Opponent Email
								</label>
								<input
									id="email"
									type="email"
									placeholder="opponent@example.com"
									value={opponentEmail}
									onChange={(e) => {
										setOpponentEmail(e.target.value);
										setError("");
									}}
									onKeyPress={handleKeyPress}
									className="w-full text-lg h-12 px-4 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-colors"
								/>
							</div>

							{error && (
								<div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
									<AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
									<span className="text-red-700">{error}</span>
								</div>
							)}

							<Button
								variant="glowingBorder"
								size="lg"
								onClick={handleChallange}
								disabled={!opponentEmail.trim()}
								className="w-full text-lg h-12 font-bold flex items-center justify-center gap-2"
							>
								<Swords className="w-5 h-5" />
								Challenge Now
							</Button>
						</div>
					</div>
				) : (
					<div className="bg-red-50 border-2 border-red-200 rounded-xl shadow-xl p-6">
						<div className="flex flex-col items-center gap-4 py-8 text-center">
							<WifiOff className="w-16 h-16 text-red-600" />
							<div>
								<h3 className="text-xl font-bold text-red-800 mb-2">
									Connection Required
								</h3>
								<p className="text-red-700">
									Please wait while we connect you to the battle server...
								</p>
							</div>
							<div className="flex gap-2">
								<div
									className="w-3 h-3 bg-red-500 rounded-full animate-bounce"
									style={{ animationDelay: "0ms" }}
								></div>
								<div
									className="w-3 h-3 bg-red-500 rounded-full animate-bounce"
									style={{ animationDelay: "150ms" }}
								></div>
								<div
									className="w-3 h-3 bg-red-500 rounded-full animate-bounce"
									style={{ animationDelay: "300ms" }}
								></div>
							</div>
						</div>
					</div>
				)}

				{/* Info Card */}
				<div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
					<h3 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
						<AlertCircle className="w-5 h-5" />
						How it Works
					</h3>
					<ul className="space-y-2 text-indigo-800">
						<li className="flex items-start gap-2">
							<span className="font-bold">1.</span>
							<span>Enter your opponent's email address</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="font-bold">2.</span>
							<span>They'll receive a challenge notification</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="font-bold">3.</span>
							<span>Once accepted, you'll both compete on the same problem</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="font-bold">4.</span>
							<span>First to solve correctly wins the battle!</span>
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
};
