import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuthContext } from "../hooks/context-hooks/useAuthContext";
import { LogOut, User, BellIcon, BellOffIcon } from "lucide-react";
import { useFocusModeContext } from "../hooks/context-hooks/useFocusModeContext";
import { Separator } from "./ui/separator";

export default function Navbar() {
	const location = useLocation();
	const { user, loading, signInWithGoogle, signOut } = useAuthContext();
	const { isFocusMode, toggleFocusMode } = useFocusModeContext();

	return (
		<nav className="w-full border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-40">
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
							<Link to="/battle">
								<Button
									variant="ghost"
									className="text-gray-600 hover:text-gray-900"
								>
									Battle
								</Button>
							</Link>
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
						<Button variant="outline" onClick={toggleFocusMode}>
							{isFocusMode ? <BellOffIcon size={20} /> : <BellIcon size={20} />}
						</Button>
						<Separator
							orientation="vertical"
							className="data-[orientation=vertical]:h-6"
						/>
						{loading ? (
							<Button variant="outline" disabled>
								Loading...
							</Button>
						) : user ? (
							<>
								<div className="flex items-center space-x-2 text-sm text-gray-700">
									<User size={16} />
									<span>{user.user_metadata?.name || user.email}</span>
								</div>
								<Button variant="outline" onClick={signOut}>
									<LogOut size={16} className="mr-2" />
									Sign Out
								</Button>
							</>
						) : (
							<>
								<Button variant="outline" onClick={signInWithGoogle}>
									Sign In with Google
								</Button>
								<Button onClick={signInWithGoogle}>Get Started</Button>
							</>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
}
