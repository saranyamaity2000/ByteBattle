import { google } from "@ai-sdk/google";
import { perplexity } from "@ai-sdk/perplexity";

export const aiModels = {
	googleFlash: google("gemini-2.5-flash"), // internally used env GOOGLE_GENERATIVE_API_KEY
	perplexitySonarPro: perplexity("sonar-pro"), // internally used env PERPLEXITY_API_KEY
};
