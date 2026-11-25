"use client";

import { Cafe, Keyvals } from "@/api";
import type { CafeShiftRead } from "@/api";
import {
	getKeyvalQueryKey,
	getMeOptions,
} from "@/api/@tanstack/react-query.gen";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CAFE_LEADERBOARD_START_KEY } from "@/constants";

export type CafeLeaderboardEntry = {
	rank: number;
	user_id: number;
	name: string;
	shifts: number;
};

export function cafeLeaderboardStartQueryKey() {
	return getKeyvalQueryKey({ path: { key: CAFE_LEADERBOARD_START_KEY } });
}

/**
 * The start of the current leaderboard period, or null if the cafe has never started one.
 */
export function useCafeLeaderboardStart() {
	return useQuery({
		queryKey: cafeLeaderboardStartQueryKey(),
		queryFn: async ({ signal }) => {
			const { data, error, response } = await Keyvals.getKeyval({
				path: { key: CAFE_LEADERBOARD_START_KEY },
				signal,
			});
			// The keyval doesn't exist until the leaderboard has been reset once
			if (response?.status === 404) return null;
			if (error || !data) throw error ?? new Error("No data");
			const start = new Date(data.value);
			return Number.isNaN(start.getTime()) ? null : start;
		},
	});
}

function buildLeaderboard(shifts: CafeShiftRead[]): CafeLeaderboardEntry[] {
	const counts = new Map<number, { name: string; shifts: number }>();
	for (const shift of shifts) {
		if (!shift.user) continue;
		const entry = counts.get(shift.user.id) ?? {
			name: `${shift.user.first_name} ${shift.user.last_name}`,
			shifts: 0,
		};
		entry.shifts += 1;
		counts.set(shift.user.id, entry);
	}

	const sorted = Array.from(counts.entries())
		.map(([user_id, { name, shifts }]) => ({ user_id, name, shifts }))
		.sort((a, b) => b.shifts - a.shifts || a.name.localeCompare(b.name));

	// Competition ranking: people with the same number of shifts share a place (1, 2, 2, 4)
	let rank = 0;
	return sorted.map((entry, i) => {
		if (i === 0 || entry.shifts !== sorted[i - 1].shifts) rank = i + 1;
		return { ...entry, rank };
	});
}

/**
 * Counts worked cafe shifts per user since the leaderboard start.
 * Only shifts that have ended count, so signing up for future shifts doesn't climb the board.
 */
export function useCafeLeaderboard() {
	const startQuery = useCafeLeaderboardStart();
	const start = startQuery.data;

	const shiftsQuery = useQuery({
		queryKey: ["cafeLeaderboardShifts", start?.toISOString()],
		enabled: !!start,
		queryFn: async ({ signal }) => {
			const { data } = await Cafe.viewShiftsBetweenDates({
				body: { start_date: start as Date, end_date: new Date() },
				signal,
				throwOnError: true,
			});
			return data;
		},
	});

	return {
		start,
		entries: shiftsQuery.data ? buildLeaderboard(shiftsQuery.data) : [],
		isLoading: startQuery.isLoading || (!!start && shiftsQuery.isLoading),
		error: startQuery.error ?? shiftsQuery.error,
	};
}

const medalColors: Record<number, string> = {
	1: "text-yellow-500",
	2: "text-gray-400",
	3: "text-amber-700",
};

export function CafeLeaderboardTable() {
	const { t, i18n } = useTranslation("cafe");
	const { start, entries, isLoading, error } = useCafeLeaderboard();
	const { data: me } = useQuery({
		...getMeOptions(),
		staleTime: 30 * 60 * 1000,
	});

	if (isLoading) return <LoadingErrorCard />;
	if (error) return <LoadingErrorCard error={error} isLoading={false} />;

	if (!start) {
		return (
			<p className="text-muted-foreground">{t("leaderboard.not_started")}</p>
		);
	}

	const since = start.toLocaleDateString(
		i18n.language.startsWith("en") ? "en-GB" : "sv-SE",
		{ year: "numeric", month: "long", day: "numeric" },
	);

	return (
		<div className="space-y-3">
			<p className="text-sm text-muted-foreground">
				{t("leaderboard.since", { date: since })}
			</p>
			{entries.length === 0 ? (
				<p className="text-muted-foreground">{t("leaderboard.empty")}</p>
			) : (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-20">{t("leaderboard.rank")}</TableHead>
							<TableHead>{t("leaderboard.name")}</TableHead>
							<TableHead className="text-right">
								{t("leaderboard.shifts")}
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{entries.map((entry) => (
							<TableRow
								key={entry.user_id}
								className={
									me?.id === entry.user_id ? "bg-primary/10 font-semibold" : ""
								}
							>
								<TableCell>
									<span className="inline-flex items-center gap-2">
										{entry.rank}
										{medalColors[entry.rank] && (
											<Trophy
												className={`h-4 w-4 ${medalColors[entry.rank]}`}
												aria-hidden
											/>
										)}
									</span>
								</TableCell>
								<TableCell>{entry.name}</TableCell>
								<TableCell className="text-right tabular-nums">
									{entry.shifts}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
		</div>
	);
}
