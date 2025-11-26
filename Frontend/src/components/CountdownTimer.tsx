import { Clock } from "lucide-react";
import { useCountdown } from "@/hooks/useCountdown";

interface CountdownTimerProps {
	startTime: string | number | Date;
	durationInMinutes: number;
	onComplete?: () => void;
	className?: string;
	showIcon?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
	startTime,
	durationInMinutes,
	onComplete,
	className = "",
	showIcon = true,
}) => {
	const { remainingTime, isExpired } = useCountdown({
		startTime,
		durationInMinutes,
		onComplete,
	});

	return (
		<span className={`${className} ${isExpired ? "text-red-600 font-bold" : ""}`}>
			{showIcon && <Clock className="w-4 h-4 inline mr-1" />}
			{isExpired ? "Time expired!" : `${remainingTime} remaining`}
		</span>
	);
};
