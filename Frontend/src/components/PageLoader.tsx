import { Spinner } from "./ui/spinner";

interface PageLoaderProps {
	isLoading: boolean;
}

export default function PageLoader({ isLoading }: PageLoaderProps) {
	if (!isLoading) return null;

	return (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm">
			<Spinner className="size-20 text-blue-600" />
		</div>
	);
}
