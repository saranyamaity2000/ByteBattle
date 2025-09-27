export default function Loader() {
	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center space-y-4">
				<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
				<p className="text-lg font-medium text-gray-700">Evaluating your code...</p>
				<p className="text-sm text-gray-500">This may take a few seconds</p>
			</div>
		</div>
	);
}
