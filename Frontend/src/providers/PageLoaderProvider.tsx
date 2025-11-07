import PageLoader from "@/components/PageLoader";
import { PageLoaderContext } from "@/contexts/PageLoaderContext";
import type { ReactNode } from "react";
import { useState } from "react";

export function PageLoaderProvider({ children }: { children: ReactNode }) {
	const [isPageLoading, setIsPageLoading] = useState(false);
	return (
		<PageLoaderContext.Provider value={{ setIsPageLoading }}>
			<PageLoader isLoading={isPageLoading} />
			{children}
		</PageLoaderContext.Provider>
	);
}
