import { createContext } from "react";

export interface PageLoaderContextType {
	setIsPageLoading: (isLoading: boolean) => void;
}

export const PageLoaderContext = createContext<PageLoaderContextType | undefined>(undefined);
