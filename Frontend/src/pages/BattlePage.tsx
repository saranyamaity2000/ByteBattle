import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CountdownTimer } from "@/components/CountdownTimer";
import { useBattleSocketContext } from "@/hooks/context-hooks/useBattleSocketContext";
import { usePageLoaderContext } from "@/hooks/context-hooks/usePageLoaderContext";
import { useEffect, useState } from "react";
import {
	Swords,
	Wifi,
	WifiOff,
	Mail,
	AlertCircle,
	Clock,
	Target,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import { useChallenges } from "@/hooks/useChallenges";
import { useAuthContext } from "@/hooks/context-hooks/useAuthContext";
import Utils from "@/utils/utils";

export const BattlePage: React.FC = () => {
	const [opponentEmail, setOpponentEmail] = useState("");
	const [timeLimitInMin, setTimeLimit] = useState<number>(30);
	const [difficulty, setDifficulty] = useState<string>("medium");
	const [error, setError] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [pastChallenges, isLoadingPastChallenges, errorPastChallenges] = useChallenges("past");
	const [ongoingChallenges, isLoadingOngoingChallenges, errorOngoingChallenges] =
		useChallenges("ongoing");
	const { user: loggedInUser } = useAuthContext();
	const { battleSocket, isSocketConnected } = useBattleSocketContext();
	const { setIsPageLoading } = usePageLoaderContext();

	useEffect(() => {
		if (isLoadingOngoingChallenges || isLoadingPastChallenges) {
			setIsPageLoading(true);
		} else {
			setIsPageLoading(false);
		}
	}, [isLoadingOngoingChallenges, isLoadingPastChallenges, setIsPageLoading]);

	useEffect(() => {
		if (errorOngoingChallenges || errorPastChallenges) {
			alert(
				"Failed to load challenges data. Please try again later." +
					(errorOngoingChallenges ?? "") +
					(errorPastChallenges ?? "") +
					"."
			);
		}
	}, [errorOngoingChallenges, errorPastChallenges]);

	const handleChallenge = () => {
		setError("");

		if (!opponentEmail.trim()) {
			setError("Please enter an email address");
			return;
		}

		if (!Utils.validateEmail(opponentEmail)) {
			setError("Please enter a valid email address");
			return;
		}

		battleSocket?.emit("challenge", {
			challengeToEmail: opponentEmail.toLowerCase().trim(),
			timeLimitInMin,
			difficulty,
		});
		setIsPageLoading(true);
	};

	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && opponentEmail.trim() && isSocketConnected) {
			handleChallenge();
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
					<>
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

								<div className="grid grid-cols-2 gap-4">
									{/* Time Limit */}
									<div className="space-y-2">
										<label
											htmlFor="timeLimitInMin"
											className="text-base font-semibold flex items-center gap-2"
										>
											<Clock className="w-4 h-4" />
											Time Limit (min)
										</label>
										<input
											id="timeLimitInMin"
											type="number"
											min="5"
											max="120"
											value={timeLimitInMin}
											onChange={(e) =>
												setTimeLimit(parseInt(e.target.value) || 30)
											}
											className="w-full text-lg h-12 px-4 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-colors"
										/>
									</div>

									{/* Difficulty */}
									<div className="space-y-2">
										<label
											htmlFor="difficulty"
											className="text-base font-semibold flex items-center gap-2"
										>
											<Target className="w-4 h-4" />
											Difficulty
										</label>
										<select
											id="difficulty"
											value={difficulty}
											onChange={(e) => setDifficulty(e.target.value)}
											className="w-full text-lg h-12 px-4 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-colors bg-white"
										>
											<option value="easy">Easy</option>
											<option value="medium">Medium</option>
											<option value="hard">Hard</option>
										</select>
									</div>
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
									onClick={handleChallenge}
									disabled={!opponentEmail.trim()}
									className="w-full text-lg h-12 font-bold flex items-center justify-center gap-2"
								>
									<Swords className="w-5 h-5" />
									Challenge Now
								</Button>
							</div>
						</div>
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
									<span>
										Once accepted, you'll both compete on the same problem
									</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="font-bold">4.</span>
									<span>First to solve correctly wins the battle!</span>
								</li>
							</ul>
						</div>
						{/* Past Challenges */}
						<div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
							<div className="bg-gradient-to-r from-slate-50 to-gray-50 p-6 border-b">
								<h2 className="text-2xl font-bold flex items-center gap-2">
									<Clock className="w-6 h-6" />
									Past Challenges
								</h2>
							</div>
							<div className="p-6">
								{isLoadingPastChallenges ? (
									<div className="text-center py-8">
										<div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
										<p className="text-gray-600">Loading past challenges...</p>
									</div>
								) : errorPastChallenges ? (
									<div className="text-center py-8">
										<AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
										<p className="text-red-600 text-lg">
											{errorPastChallenges}
										</p>
									</div>
								) : pastChallenges.length === 0 ? (
									<div className="text-center py-8">
										<Swords className="w-16 h-16 text-gray-300 mx-auto mb-4" />
										<p className="text-gray-500 text-lg">
											No past challenges found
										</p>
										<p className="text-gray-400">
											Start your first battle above!
										</p>
									</div>
								) : (
									<>
										<div className="space-y-4">
											{pastChallenges
												.slice((currentPage - 1) * 5, currentPage * 5)
												.map((challenge) => (
													<div
														key={challenge.challengeId}
														className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-300 transition-colors bg-gradient-to-r from-gray-50 to-slate-50"
													>
														<div className="flex items-center justify-between">
															<div className="flex items-center gap-3">
																<Swords className="w-5 h-5 text-indigo-600" />
																<span className="font-semibold text-gray-800">
																	{challenge.challengedFrom} vs{" "}
																	{challenge.challengedTo}
																</span>
															</div>
															<div className="flex items-center gap-2">
																<span className="px-3 py-1 rounded-full text-sm font-semibold ">
																	{challenge.winner ? (
																		<span className="bg-green-100 text-green-800">
																			🏆 {challenge.winner}{" "}
																			won
																		</span>
																	) : (
																		<span className="bg-gray-100 text-gray-800">
																			🤝 Draw
																		</span>
																	)}
																</span>
															</div>
														</div>
														<div className="mt-2 text-sm text-gray-600">
															<Clock className="w-4 h-4 inline mr-1" />
															{challenge.timeLimitInMin} min •{" "}
															{new Date(
																challenge.createdAt
															).toLocaleDateString()}
														</div>
													</div>
												))}
										</div>
										{/* Pagination */}
										{pastChallenges.length > 5 && (
											<div className="flex items-center justify-between mt-6 pt-4 border-t">
												<p className="text-sm text-gray-600">
													Showing {(currentPage - 1) * 5 + 1} to{" "}
													{Math.min(
														currentPage * 5,
														pastChallenges.length
													)}{" "}
													of {pastChallenges.length} challenges
												</p>
												<div className="flex gap-2">
													<Button
														variant="outline"
														size="sm"
														onClick={() =>
															setCurrentPage(currentPage - 1)
														}
														disabled={currentPage === 1}
													>
														<ChevronLeft className="w-4 h-4" />
														Previous
													</Button>
													<Button
														variant="outline"
														size="sm"
														onClick={() =>
															setCurrentPage(currentPage + 1)
														}
														disabled={
															currentPage * 5 >= pastChallenges.length
														}
													>
														Next
														<ChevronRight className="w-4 h-4" />
													</Button>
												</div>
											</div>
										)}
									</>
								)}
							</div>
						</div>
					</>
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
			</div>

			{/* Ongoing Challenges Dialog */}
			<Dialog open={ongoingChallenges.length > 0} onOpenChange={() => {}}>
				<DialogContent showCloseButton={false} className="max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-xl">
							<Swords className="w-6 h-6 text-orange-600" />
							Ongoing Challenge!
						</DialogTitle>
					</DialogHeader>
					<div className="py-4">
						{ongoingChallenges.length > 0 && (
							<div className="space-y-4">
								<div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
									<p className="text-orange-800 font-semibold mb-2">
										You have an active challenge:
									</p>
									<p className="text-orange-700">
										{"You"} vs{" "}
										{ongoingChallenges[0].challengedTo !== loggedInUser?.email
											? ongoingChallenges[0].challengedTo
											: ongoingChallenges[0].challengedFrom}
									</p>
									<div className="text-sm text-orange-600 mt-2">
										<CountdownTimer
											startTime={ongoingChallenges[0].createdAt}
											durationInMinutes={ongoingChallenges[0].timeLimitInMin}
											onComplete={() => {
												console.log("Challenge time expired!");
												// You can add logic here to handle expired challenge
											}}
											className="text-orange-600"
										/>
									</div>
								</div>
								<Button
									size="lg"
									className="w-full bg-orange-600 hover:bg-orange-700 text-white"
									onClick={() => {
										// Navigate to problem page - you'll need to implement this
										console.log(
											"Navigate to problem:",
											ongoingChallenges[0].problemId
										);
									}}
								>
									<Target className="w-5 h-5 mr-2" />
									Continue Challenge
								</Button>
							</div>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};
