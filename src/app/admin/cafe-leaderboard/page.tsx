"use client";

import { ActionEnum, TargetEnum } from "@/api";
import { setLeaderboardStartMutation } from "@/api/@tanstack/react-query.gen";
import {
	CafeLeaderboardTable,
	cafeLeaderboardStartQueryKey,
	useCafeLeaderboardStart,
} from "@/components/CafeLeaderboard";
import PermissionWall from "@/components/PermissionWall";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import getErrorMessage from "@/help_functions/getErrorMessage";
import { AdminChooseDates } from "@/widgets/AdminChooseDates";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RotateCcw } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

function startOfDay(date: Date) {
	const d = new Date(date);
	d.setHours(0, 0, 0, 0);
	return d;
}

export default function CafeLeaderboardAdmin() {
	const { t, i18n } = useTranslation("admin");
	const queryClient = useQueryClient();
	const { data: currentStart } = useCafeLeaderboardStart();
	const [startDate, setStartDate] = useState<Date>(() =>
		startOfDay(new Date()),
	);

	const resetLeaderboard = useMutation({
		...setLeaderboardStartMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: cafeLeaderboardStartQueryKey(),
			});
			toast.success(t("cafe_leaderboard.success_reset"));
		},
		onError: (err) => {
			toast.error(
				`${t("cafe_leaderboard.error_reset")}: ${getErrorMessage(err, t)}`,
			);
		},
	});

	const locale = i18n.language.startsWith("en") ? "en-GB" : "sv-SE";
	const formatDate = (d: Date) =>
		d.toLocaleDateString(locale, {
			year: "numeric",
			month: "long",
			day: "numeric",
		});

	return (
		<PermissionWall
			requiredPermissions={[[ActionEnum.MANAGE, TargetEnum.CAFE]]}
		>
			<div className="px-8 py-3 space-y-6 max-w-3xl">
				<div className="space-y-2">
					<h3 className="text-3xl font-bold text-primary">
						{t("cafe_leaderboard.title")}
					</h3>
					<p>{t("cafe_leaderboard.description")}</p>
				</div>

				<div className="space-y-3">
					<h4 className="text-xl font-semibold">
						{t("cafe_leaderboard.reset_title")}
					</h4>
					<p className="text-sm text-muted-foreground">
						{currentStart
							? t("cafe_leaderboard.current_start", {
									date: formatDate(currentStart),
								})
							: t("cafe_leaderboard.no_start")}
					</p>
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
						<div className="w-full sm:w-72">
							<AdminChooseDates
								value={startDate}
								onChange={(d) => setStartDate(startOfDay(d))}
								granularity="day"
							/>
						</div>
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button disabled={resetLeaderboard.isPending}>
									<RotateCcw />
									{t("cafe_leaderboard.reset")}
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>
										{t("cafe_leaderboard.confirm_title")}
									</AlertDialogTitle>
									<AlertDialogDescription>
										{t("cafe_leaderboard.confirm_text", {
											date: formatDate(startDate),
										})}
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>{t("admin:cancel")}</AlertDialogCancel>
									<AlertDialogAction
										onClick={() =>
											resetLeaderboard.mutate({
												body: { starts_at: startDate },
											})
										}
									>
										{t("cafe_leaderboard.reset")}
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				</div>

				<Separator />

				<div className="space-y-3">
					<h4 className="text-xl font-semibold">
						{t("cafe_leaderboard.current_title")}
					</h4>
					<CafeLeaderboardTable />
				</div>
			</div>
		</PermissionWall>
	);
}
