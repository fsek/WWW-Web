"use client";

import { CafeLeaderboardTable } from "@/components/CafeLeaderboard";
import CustomTitle from "@/components/CustomTitle";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function CafeLeaderboard() {
	const { t } = useTranslation("cafe");

	return (
		<div className="px-4 sm:px-8 py-10 max-w-3xl mx-auto w-full space-y-6">
			<CustomTitle text={t("leaderboard.title")} size={4} className="mt-4" />
			<p>{t("leaderboard.description")}</p>
			<CafeLeaderboardTable />
			<Button asChild variant="outline">
				<Link href="/cafe-shifts">
					<CalendarDays />
					{t("leaderboard.to_shifts")}
				</Link>
			</Button>
		</div>
	);
}
