"use client";

import { useTranslation } from "react-i18next";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Users, Info, Eye } from "lucide-react";
import Countdown from "react-countdown";
import type { CountdownRenderProps } from "react-countdown";
import { cn } from "@/lib/utils";
import type { JoinedElectionPost } from "./page";
import formatTime from "@/help_functions/timeFormater";
import { Button } from "@/components/ui/button";
import type { CandidatePostRead } from "@/api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	deleteCandidationMutation,
	getMyCandidationsQueryKey,
	getVisibleElectionQueryKey,
} from "@/api/@tanstack/react-query.gen";
import getErrorMessage from "@/help_functions/getErrorMessage";
import { useQueryClient } from "@tanstack/react-query";
import CandidationForm from "./CandidationForm";
import NominationForm from "./NominationForm";
import { useState } from "react";

interface ElectionPostDetailsProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	joinedPost?: JoinedElectionPost;
	className?: string;
	myCandidations?: CandidatePostRead[];
	electionId: number;
}

export default function ElectionPostDetails({
	open,
	onOpenChange,
	joinedPost,
	className,
	myCandidations,
	electionId,
}: ElectionPostDetailsProps) {
	const { t, i18n } = useTranslation();
	const queryClient = useQueryClient();
	const [candidationOpen, setCandidationOpen] = useState(false);
	const [nominationOpen, setNominationOpen] = useState(false);

	const name =
		i18n.language === "en" ? joinedPost?.name_en : joinedPost?.name_sv;
	const councilName =
		i18n.language === "en"
			? joinedPost?.council_name_en
			: joinedPost?.council_name_sv;

	// Check if user has candidated for this post
	const candidation = myCandidations?.find(
		(c) => c.election_post_id === joinedPost?.election_post_id,
	);

	const deleteCandidation = useMutation({
		...deleteCandidationMutation(),
		throwOnError: false,
		onSuccess: () => {
			toast.success(t("elections.delete_candidation_success"));
			if (candidation) {
				queryClient.invalidateQueries({
					queryKey: getMyCandidationsQueryKey({
						path: { election_id: electionId },
					}),
				});
				queryClient.invalidateQueries({
					queryKey: getVisibleElectionQueryKey(),
				});
			}
		},
		onError: (error) => {
			toast.error(
				`${t("elections.error_delete_candidation")} ${getErrorMessage(error, t)}`,
			);
		},
	});

	const handleDeleteCandidation = () => {
		if (candidation) {
			deleteCandidation.mutate({
				query: {
					candidate_id: candidation.candidate_id,
					election_post_id: candidation.election_post_id,
				},
			});
		}
	};

	const renderCountdown = (props: CountdownRenderProps) => {
		const { days, hours, minutes, seconds, completed } = props;
		if (completed) return <span>{t("elections.ended")}</span>;
		const parts: string[] = [];
		if (days && days > 0) parts.push(`${days}d`);
		const hh = String(hours).padStart(2, "0");
		const mm = String(minutes).padStart(2, "0");
		const ss = String(seconds).padStart(2, "0");
		parts.push(`${hh}:${mm}:${ss}`);
		return (
			<span className="font-mono text-lg md:text-2xl font-semibold">
				{parts.join(" ")}
			</span>
		);
	};

	function formatLocaleDateTime(date?: Date | string) {
		if (!date) return "-";
		return formatTime(date);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className={cn(
					"w-full max-w-[90vw] sm:max-w-6xl p-0 h-auto max-h-[85vh] overflow-auto",
					className,
				)}
				aria-describedby={undefined}
			>
				<HeaderArea
					title={name || t("elections.post_name")}
					council={councilName}
					loading={false}
				/>
				<div className="px-6 pb-6 pt-4 space-y-6">
					{!joinedPost && (
						<p className="text-sm text-red-500">{t("not_found")}</p>
					)}
					{joinedPost && (
						<>
							<QuickFacts joinedPost={joinedPost} />
							{(joinedPost.description_sv || joinedPost.description_en) && (
								<Section
									icon={<Info className="h-4 w-4" />}
									title={t("admin:description") || t("description")}
								>
									<p className="text-sm leading-relaxed whitespace-pre-line">
										{(i18n.language === "en"
											? joinedPost.description_en
											: joinedPost.description_sv) || t("no_description")}
									</p>
								</Section>
							)}
							<div className="grid gap-4 md:grid-cols-2">
								<Section
									icon={<Users className="h-4 w-4" />}
									title={t("elections.election_limits")}
								>
									<ul className="text-xs space-y-1">
										<li>
											<span className="font-medium">
												{t("elections.recommended_limit")}:
											</span>{" "}
											{joinedPost.elected_user_recommended_limit === 0
												? "∞"
												: joinedPost.elected_user_recommended_limit}
										</li>
										<li>
											<span className="font-medium">
												{t("elections.max_limit")}:
											</span>{" "}
											{joinedPost.elected_user_max_limit === 0
												? "∞"
												: joinedPost.elected_user_max_limit}
										</li>
									</ul>
								</Section>

								{joinedPost.end_time && (
									<Section
										icon={<Info className="h-4 w-4" />}
										title={t("elections.ends_in")}
									>
										<div className="flex flex-col gap-1">
											<div className="flex items-center gap-2">
												<Countdown
													date={new Date(joinedPost.end_time)}
													renderer={renderCountdown}
												/>
												<span className="text-xs text-muted-foreground">
													{formatLocaleDateTime(joinedPost.end_time)}
												</span>
											</div>
										</div>
									</Section>
								)}

								<Section title={t("elections.actions")}>
									<div className="flex gap-2 flex-wrap">
										<CandidationForm
											open={candidationOpen}
											onOpenChange={setCandidationOpen}
											singleElectionPost={{
												election_post_id: joinedPost.election_post_id,
												post_id: joinedPost.post_id,
												sub_election_id: joinedPost?.sub_election_id ?? 0,
												name_sv: joinedPost.name_sv,
												name_en: joinedPost.name_en,
											}}
											electionId={electionId}
											disabled={!!candidation}
										/>
										<NominationForm
											open={nominationOpen}
											onOpenChange={setNominationOpen}
											singleElectionPost={{
												election_post_id: joinedPost.election_post_id,
												post_id: joinedPost.post_id,
												sub_election_id: joinedPost?.sub_election_id ?? 0,
												name_sv: joinedPost.name_sv,
												name_en: joinedPost.name_en,
											}}
											electionId={electionId}
											disabled={false}
										/>
									</div>
								</Section>

								{/* Candidation status */}
								{candidation && (
									<Section title={t("elections.candidated_status")}>
										<div className="flex flex-col gap-2">
											<span className="text-sm">
												{t("elections.you_have_candidated")}
											</span>
											<span className="text-xs text-muted-foreground">
												{t("elections.candidated_at")}:{" "}
												{formatTime(candidation.created_at)}
											</span>
											<Button
												variant="destructive"
												onClick={handleDeleteCandidation}
												disabled={deleteCandidation.isPending}
											>
												{t("elections.remove_candidation")}
											</Button>
										</div>
									</Section>
								)}
							</div>
						</>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

function HeaderArea({
	title,
	council,
	loading,
}: {
	title: string;
	council?: string;
	loading: boolean;
}) {
	return (
		<div className="bg-gradient-to-r from-primary/80 to-primary text-primary-foreground px-6 py-4 shadow-sm">
			<DialogHeader className="space-y-1">
				<DialogTitle className="text-xl font-semibold">
					{loading ? "…" : title}
				</DialogTitle>
				{council && (
					<DialogDescription className="text-primary-foreground/90 text-xs">
						{council}
					</DialogDescription>
				)}
			</DialogHeader>
		</div>
	);
}

function Section({
	icon,
	title,
	children,
}: {
	icon?: React.ReactNode;
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div className="rounded-md border bg-card">
			<div className="flex items-center gap-2 px-3 py-2 border-b">
				{icon}
				<h3 className="text-xs font-semibold uppercase tracking-wide">
					{title}
				</h3>
			</div>
			<div className="p-3">{children}</div>
		</div>
	);
}

function QuickFacts({ joinedPost }: { joinedPost: JoinedElectionPost }) {
	const { t, i18n } = useTranslation();
	const items: Array<{ label: string; value: string | number | null }> = [
		{
			label: t("elections.elected_at_semester"),
			value: t(
				`admin:enums.elected_at_semester.${joinedPost.elected_at_semester}`,
			),
		},
		{
			label: t("elections.elected_by"),
			value: t(`admin:enums.elected_by.${joinedPost.elected_by}`),
		},
	];

	return (
		<div className="flex flex-col gap-2">
			<div className="flex flex-wrap gap-2">
				{items.map((it) => {
					if (it.value === null) return null;
					return (
						<Badge
							key={it.label}
							variant="secondary"
							className="text-[10px] font-medium px-2 py-1"
						>
							<span className="opacity-70">{it.label}:</span>&nbsp;{it.value}
						</Badge>
					);
				})}
			</div>
		</div>
	);
}
