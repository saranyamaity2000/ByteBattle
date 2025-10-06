export const getFileExtension = (mimeType: string): string => {
	switch (mimeType) {
		case "application/json":
			return ".json";
		case "text/plain":
			return ".txt";
		case "application/xml":
		case "text/xml":
			return ".xml";
		default:
			return ".bin"; // fallback for unknown types
	}
};
