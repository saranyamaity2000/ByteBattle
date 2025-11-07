import { PageLoaderContext, type PageLoaderContextType } from "@/contexts/PageLoaderContext";
import { useContext } from "react";

export const usePageLoadingSetter = (): PageLoaderContextType => {
	const context = useContext(PageLoaderContext);
	if (context === undefined) {
		throw new Error("usePageLoadingSetter must be used within a PageLoaderProvider");
	}
	return context;
};
