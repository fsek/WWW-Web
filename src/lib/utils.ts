import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getDateFromMinutes(minutes: number) {
	const now = new Date();
	now.setHours(0, 0, 0, 0); // Set time to midnight
	now.setMinutes(minutes);
	return now;
}
