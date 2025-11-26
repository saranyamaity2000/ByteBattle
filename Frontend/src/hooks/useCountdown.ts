import { useState, useEffect, useRef } from "react";

interface UseCountdownProps {
	startTime: string | number | Date;
	durationInMinutes: number;
	onComplete?: () => void;
}

interface CountdownResult {
	remainingTime: string;
	remainingMinutes: number;
	remainingSeconds: number;
	isExpired: boolean;
	totalRemainingMs: number;
}

export const useCountdown = ({
	startTime,
	durationInMinutes,
	onComplete,
}: UseCountdownProps): CountdownResult => {
	const [remainingMs, setRemainingMs] = useState<number>(0);
	const intervalRef = useRef<number | null>(null);
	const hasCompletedRef = useRef<boolean>(false);

	useEffect(() => {
		const calculateRemaining = () => {
			const start = new Date(startTime).getTime();
			const now = Date.now();
			const duration = durationInMinutes * 60 * 1000; // convert to milliseconds
			const elapsed = now - start;
			return Math.max(0, duration - elapsed);
		};

		// Initial calculation
		setRemainingMs(calculateRemaining());

		// Set up interval to update every second
		intervalRef.current = setInterval(() => {
			const remaining = calculateRemaining();
			setRemainingMs(remaining);

			// Call onComplete when timer reaches zero (only once)
			if (remaining === 0 && !hasCompletedRef.current) {
				hasCompletedRef.current = true;
				onComplete?.();
			}
		}, 1000);

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [startTime, durationInMinutes, onComplete]);

	const remainingMinutes = Math.floor(remainingMs / 60000);
	const remainingSeconds = Math.floor((remainingMs % 60000) / 1000);
	const remainingTime = `${remainingMinutes}:${remainingSeconds.toString().padStart(2, "0")}`;

	return {
		remainingTime,
		remainingMinutes,
		remainingSeconds,
		isExpired: remainingMs === 0,
		totalRemainingMs: remainingMs,
	};
};
