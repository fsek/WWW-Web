// Page for members
"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	getVisibleElectionOptions,
	getAllPostsOptions,
	getAllCouncilsOptions,
	getMyCandidationsOptions,
} from "@/api/@tanstack/react-query.gen";
import { useTranslation } from "react-i18next";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { createColumnHelper, type Row } from "@tanstack/react-table";
import useCreateTable from "@/widgets/useCreateTable";
import AdminTable from "@/widgets/AdminTable";
import type { CouncilRead, PostRead, SubElectionMemberRead } from "@/api";
import CandidationForm from "./CandidationForm";
import NominationForm from "./NominationForm";
import ElectionPostDetails from "./ElectionPostDetails";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import formatTime from "@/help_functions/timeFormater";
import Countdown from "react-countdown";
import type { CountdownRenderProps } from "react-countdown";
import CustomTitle from "@/components/CustomTitle";

export interface JoinedElectionPost {
	election_post_id: number;
	post_id: number;
	name_sv: string;
	name_en: string;
	elected_user_recommended_limit: number;
	elected_user_max_limit: number;
	elected_by: string | null;
	council_id?: number;
	council_name_sv?: string;
	council_name_en?: string;
	end_time?: Date;
	candidation_count?: number;
	description_sv?: string;
	description_en?: string;
	elected_at_semester?: string | null;
	sub_election_id?: number;
}

export default function PublicElectionPage() {
	const { i18n, t } = useTranslation();
	const [search, setSearch] = useState("");
	const [candidationOpen, setCandidationOpen] = useState(false);
	const [nominationOpen, setNominationOpen] = useState(false);
	const [detailsOpen, setDetailsOpen] = useState(false);
	const [detailsPostId, setDetailsPostId] = useState<number | undefined>(
		undefined,
	);
	const router = useRouter();

	// Visible election
	const {
		data: election,
		error: electionError,
		isPending: electionPending,
	} = useQuery({
		...getVisibleElectionOptions(),
		refetchOnWindowFocus: false,
	});

	const {
		data: councilsData,
		error: councilsError,
		isPending: councilsPending,
	} = useQuery({
		...getAllCouncilsOptions(),
		enabled: true,
		refetchOnWindowFocus: false,
	});

	const {
		data: myCandidations,
		error: myCandidationsError,
		isPending: myCandidationsPending,
	} = useQuery({
		...getMyCandidationsOptions({
			path: { election_id: election?.election_id ?? 0 },
		}),
		enabled: election?.election_id !== undefined,
		refetchOnWindowFocus: false,
	});

	const allCouncils: CouncilRead[] = councilsData ?? [];

	// Aggregate all election_posts from all sub_elections
	const joined = useMemo<JoinedElectionPost[]>(() => {
		if (!election?.sub_elections || !Array.isArray(election.sub_elections))
			return [];
		const result: JoinedElectionPost[] = [];
		for (const sub of election.sub_elections) {
			if (!sub.election_posts) continue;
			for (const ep of sub.election_posts) {
				// Find council info if available
				const council = allCouncils.find(
					(c) => c.id === ep.council_id,
				) as CouncilRead;
				if (!council) continue;
				const post = council.posts.find((c) => c.id === ep.post_id) as PostRead;
				result.push({
					election_post_id: ep.election_post_id,
					post_id: ep.post_id,
					name_sv: ep.name_sv,
					name_en: ep.name_en,
					elected_user_recommended_limit: ep.elected_user_recommended_limit,
					elected_user_max_limit: ep.elected_user_max_limit,
					elected_by: ep.elected_by,
					council_id: ep.council_id,
					council_name_sv: (council as CouncilRead).name_sv,
					council_name_en: (council as CouncilRead).name_en,
					end_time: sub.end_time,
					candidation_count: ep.candidation_count,
					description_sv: post.description_sv,
					description_en: post.description_en,
					elected_at_semester: ep.elected_at_semester,
					sub_election_id: sub.sub_election_id,
				});
			}
		}
		return result;
	}, [election, allCouncils]);

	// Sort joined by date (soonest first), unless the date has passed, then at the end
	joined.sort((a, b) => {
		if (a.end_time !== undefined && b.end_time !== undefined) {
			const now = new Date().getTime();
			const aEnded = new Date(a.end_time).getTime() < now;
			const bEnded = new Date(b.end_time).getTime() < now;
			if (aEnded && bEnded) {
				// Both ended, sort by end_time descending
				return new Date(b.end_time).getTime() - new Date(a.end_time).getTime();
			}
			if (aEnded) return 1; // a ended, b not ended -> b first
			if (bEnded) return -1; // b ended, a not ended -> a first
			// Both not ended, sort by end_time ascending
			return new Date(a.end_time).getTime() - new Date(b.end_time).getTime();
		}
		if (a.end_time !== undefined) return -1; // a has end_time, b doesn't -> a first
		if (b.end_time !== undefined) return 1; // b has end_time, a doesn't -> b first
		return 0; // Neither has end_time, keep original order
	});

	// Filter
	const filtered = useMemo(() => {
		const q = search.toLowerCase();
		if (!q) return joined;
		return joined.filter(
			(r) =>
				r.name_sv.toLowerCase().includes(q) ||
				r.name_en.toLowerCase().includes(q) ||
				(r.council_name_sv ?? "").toLowerCase().includes(q) ||
				(r.council_name_en ?? "").toLowerCase().includes(q),
		);
	}, [joined, search]);

	const columnHelper = createColumnHelper<JoinedElectionPost>();
	const columns = [
		columnHelper.accessor(
			(row) => (i18n.language === "en" ? row.name_en : row.name_sv),
			{
				id: "name",
				header: t("elections.post_name"),
				cell: (info) => info.getValue() || "-",
			},
		),
		// Merged limits column
		columnHelper.display({
			id: "limits",
			header: t("elections.limits") || t("elections.max_limit"),
			cell: ({ row }) => {
				const rec = row.original.elected_user_recommended_limit;
				const max = row.original.elected_user_max_limit;
				if (rec === 0 && max === 0) return t("elections.no_limit");
				return `Rek: ${rec}, max: ${max}`;
			},
		}),
		columnHelper.accessor("candidation_count", {
			id: "candidation_count",
			header: t("elections.candidation_count"),
			cell: (info) => info.getValue() ?? 0,
		}),
		columnHelper.accessor("elected_by", {
			id: "elected_by",
			header: t("elections.elected_by"),
			cell: (info) =>
				info.getValue() ? t(`admin:enums.elected_by.${info.getValue()}`) : "-",
		}),
		columnHelper.accessor(
			(row) =>
				i18n.language === "en" ? row.council_name_en : row.council_name_sv,
			{
				id: "council",
				header: t("elections.council"),
				cell: (info) => info.getValue() || "-",
			},
		),
		columnHelper.accessor("end_time", {
			id: "end_time",
			header: t("elections.end_time"),
			cell: (info) => formatCountdown(info.getValue()),
		}),
	];

	const table = useCreateTable({
		data: filtered,
		columns,
	});

	function handleRowClick(row: Row<JoinedElectionPost>) {
		setDetailsPostId(row.original.post_id);
		setDetailsOpen(true);
	}
	const selectedJoinedPost = joined.find((j) => j.post_id === detailsPostId);

	function formatCountdown(endTime?: Date) {
		if (!endTime) return "-";
		const { t } = useTranslation();
		const now = new Date();
		const end = new Date(endTime);
		const diffMs = end.getTime() - now.getTime();
		if (diffMs <= 0) return t("elections.ended");
		const diffSec = Math.floor(diffMs / 1000);
		const days = Math.floor(diffSec / (3600 * 24));
		const hours = Math.floor((diffSec % (3600 * 24)) / 3600);
		const minutes = Math.floor((diffSec % 3600) / 60);

		const parts = [];
		if (days > 0) parts.push(`${t("elections.day", { count: days })}`);
		if (hours > 0) parts.push(`${t("elections.hour", { count: hours })}`);
		if (minutes > 0 && days === 0)
			parts.push(`${t("elections.min", { count: minutes })}`);
		return `${parts.join(" ")} ${t("elections.left")}`;
	}

	// Row style based on time left
	function getRowProps(row: Row<JoinedElectionPost>) {
		const endTime = row.original.end_time;
		if (!endTime) return {};
		const now = new Date();
		const end = new Date(endTime);
		const diffMs = end.getTime() - now.getTime();
		let bg = "";
		if (diffMs <= 0) {
			// Ended: faded red
			bg = "bg-red-600/60 dark:bg-red-600/40";
		} else if (diffMs < 3 * 24 * 3600 * 1000) {
			// <3 days: faded yellow
			bg = "bg-yellow-600/60 dark:bg-yellow-600/80";
		} else if (diffMs < 10 * 24 * 3600 * 1000) {
			// <10 days: faded green
			bg = "bg-green-600/40 dark:bg-green-600/60";
		}
		return { className: bg };
	}

	// Small presentational card for each sub-election showing end time and countdown
	function SubElectionCard({ sub }: { sub: SubElectionMemberRead }) {
		const { i18n, t } = useTranslation();
		const end = sub?.end_time ? new Date(sub.end_time) : undefined;
		const title = i18n.language === "en" ? sub?.title_en : sub?.title_sv;

		const renderer = (props: CountdownRenderProps) => {
			const { days, hours, minutes, seconds, completed } = props;
			if (completed)
				return (
					<span className="text-red-600 dark:text-red-400">
						{t("elections.ended")}
					</span>
				);
			const parts: string[] = [];
			if (days && days > 0) parts.push(`${days}d`);
			const hh = String(hours).padStart(2, "0");
			const mm = String(minutes).padStart(2, "0");
			const ss = String(seconds).padStart(2, "0");
			parts.push(`${hh}:${mm}:${ss}`);
			return (
				<span className="font-mono text-xl md:text-2xl font-semibold tracking-tight leading-none">
					{parts.join(" ")}
				</span>
			);
		};

		return (
			<div className="rounded-xl border bg-gradient-to-br from-card/70 to-card p-4 shadow-sm hover:shadow-md transition-shadow">
				<div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
					{t("elections.sub_election")}
				</div>
				<div
					className="text-sm font-semibold leading-snug line-clamp-2"
					title={title}
				>
					{title}
				</div>
				{end ? (
					<div className="mt-3 space-y-1">
						<div className="text-[10px] font-medium text-muted-foreground/80">
							{formatTime(end)}
						</div>
						<div>
							<Countdown date={end} renderer={renderer} />
						</div>
					</div>
				) : (
					<div className="text-sm text-muted-foreground mt-2">
						{t("elections.no_end_time")}
					</div>
				)}
			</div>
		);
	}

	if (electionPending || councilsPending) return <LoadingErrorCard />;
	if (electionError) return <LoadingErrorCard error={electionError} />;
	if (councilsError) return <LoadingErrorCard error={councilsError} />;

	if (!election) {
		return (
			<div className="px-8 py-12 flex flex-col items-center gap-4">
				<p>{t("elections.no_visible_election")}</p>
			</div>
		);
	}

	const title = i18n.language === "en" ? election.title_en : election.title_sv;
	const description =
		i18n.language === "en" ? election.description_en : election.description_sv;

	return (
		<div className="w-full">
			<div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12 py-8 space-y-8">
				<header className="space-y-4">
					<div className="grid md:grid-cols-[300px_1fr] gap-8 items-start">
						<div className="hidden md:block">
							<div className="space-y-4 sticky top-24">
								{election?.sub_elections?.map((sub) => (
									<SubElectionCard key={sub.sub_election_id} sub={sub} />
								))}
							</div>
						</div>
						<div className="relative bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/70 rounded-xl ring-1 ring-border p-6 md:p-8 lg:p-10 space-y-4 shadow-sm">
							<CustomTitle text={title} size={3} className="!mt-0" />
							<div className="prose dark:prose-invert max-w-none">
								<Markdown remarkPlugins={[remarkGfm]}>{description}</Markdown>
							</div>
						</div>
					</div>
				</header>

				<div className="flex flex-wrap gap-3">
					<Button
						onClick={() => {
							router.push("/election/candidations");
						}}
						variant="outline"
					>
						<Eye />
						{t("elections.view_my_candidations")}
					</Button>
					<CandidationForm
						electionPosts={joined.map((j) => ({
							election_post_id: j.election_post_id,
							post_id: j.post_id,
							sub_election_id: j.sub_election_id ?? 0,
							name_sv: j.name_sv,
							name_en: j.name_en,
						}))}
						open={candidationOpen}
						onOpenChange={setCandidationOpen}
						electionId={election.election_id}
					/>
					<NominationForm
						electionPosts={joined.map((j) => ({
							election_post_id: j.election_post_id,
							post_id: j.post_id,
							sub_election_id: j.sub_election_id ?? 0,
							name_sv: j.name_sv,
							name_en: j.name_en,
						}))}
						open={nominationOpen}
						onOpenChange={setNominationOpen}
						electionId={election.election_id}
					/>
				</div>

				<section className="space-y-4">
					<div className="flex flex-col gap-2 md:flex-row md:items-center">
						<Input
							placeholder={t("elections.search_posts_placeholder")}
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="max-w-xs"
						/>
					</div>
					<p className="text-sm text-muted-foreground">
						{t("elections.election_table_description")}
					</p>
					<Separator />
					<AdminTable
						table={table}
						onRowClick={handleRowClick}
						getRowProps={getRowProps}
					/>
					{filtered.length === 0 && (
						<p className="text-sm text-muted-foreground">
							{t("elections.no_posts_match")}
						</p>
					)}
				</section>
				<ElectionPostDetails
					open={detailsOpen}
					onOpenChange={setDetailsOpen}
					joinedPost={selectedJoinedPost}
					className={undefined}
					myCandidations={myCandidations}
					electionId={election.election_id}
				/>
			</div>
		</div>
	);
}
