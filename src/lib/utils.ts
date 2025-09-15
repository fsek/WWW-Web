import { rankItem } from "@tanstack/match-sorter-utils";
import {
	FilterFnOption,
	type FilterMeta,
	type Row,
} from "@tanstack/react-table";
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

export function fuzzyFilter<TData>(
	row: Row<TData>,
	columnId: string,
	filterValue: any,
	addMeta: (meta: FilterMeta) => void,
) {
	// Rank the item
	const itemRank = rankItem(row.getValue(columnId), filterValue);

	// Store the itemRank info
	addMeta({
		itemRank,
	});

	// Return if the item should be filtered in/out
	return itemRank.passed;
}
