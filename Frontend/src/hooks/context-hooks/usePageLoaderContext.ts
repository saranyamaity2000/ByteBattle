import { PageLoaderContext, type PageLoaderContextType } from "@/contexts/PageLoaderContext";
import { useContext } from "react";

export const usePageLoaderContext = (): PageLoaderContextType => {
	const context = useContext(PageLoaderContext);
	if (context === undefined) {
		throw new Error("usePageLoaderContext must be used within a PageLoaderProvider");
	}
	return context;
};
