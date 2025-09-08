"use client";

import {
	electionsGetSubElectionOptions,
	deleteCandidateMutation,
	electionsGetSubElectionQueryKey,
	deleteCandidationMutation,
} from "@/api/@tanstack/react-query.gen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import AdminTable from "@/widgets/AdminTable";
import { CandidationTable } from "@/app/admin/elections/CandidationTable";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createColumnHelper,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type Row,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import { useRouter, useParams } from "next/navigation";
import type { CandidateRead, ElectionPostRead } from "@/api/types.gen";
import CandidationForm from "./CandidationForm";
import { toast } from "sonner";
import getErrorMessage from "@/help_functions/getErrorMessage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { ArrowLeft } from "lucide-react";

const columnHelper = createColumnHelper<CandidateRead>();

const postColumnHelper = createColumnHelper<ElectionPostRead>();

export default function AdminElectionCandidatesPage() {
	const { t, i18n } = useTranslation("admin");
	const router = useRouter();
	const params = useParams();
	const subElectionId = Number(params?.sub_election_id);
	const queryClient = useQueryClient();

	const {
		data: subElection,
		error: subElectionError,
		isLoading: subElectionLoading,
	} = useQuery({
		...electionsGetSubElectionOptions({
			path: { sub_election_id: subElectionId },
		}),
		enabled: Number.isFinite(subElectionId),
		refetchOnWindowFocus: false,
	});

	const deleteCandidate = useMutation({
		...deleteCandidateMutation(),
		throwOnError: false,
		onSuccess: () => {
			toast.success(t("admin:elections.election_candidates.delete_success"));
			queryClient.invalidateQueries({
				queryKey: electionsGetSubElectionQueryKey({
					path: {
						sub_election_id: subElectionId,
					},
				}),
			});
		},
		onError: (error) => {
			toast.error(
				`${t("admin:elections.election_candidates.error_delete")} ${getErrorMessage(error, t)}`,
			);
		},
	});

	const deleteCandidation = useMutation({
		...deleteCandidationMutation(),
		throwOnError: false,
		onSuccess: () => {
			toast.success(
				t("elections.election_candidations.delete_candidation_success"),
			);
			queryClient.invalidateQueries({
				queryKey: electionsGetSubElectionQueryKey({
					path: {
						sub_election_id: subElectionId,
					},
				}),
			});
		},
		onError: (error) => {
			toast.error(
				`${t("elections.election_candidations.error_delete_candidation")} ${getErrorMessage(error, t)}`,
			);
		},
	});

	const getPostName = (post_id: number) => {
		if (!subElection?.election_posts) return "-";
		const post = subElection.election_posts.find(
			(p) => p.election_post_id === post_id,
		);
		if (!post) return "-";
		return i18n.language === "en" ? post.name_en : post.name_sv;
	};

	// Candidate table search
	const [search, setSearch] = useState<string>("");

	// Candidation table search
	const [candidationSearch, setCandidationSearch] = useState<string>("");

	// Election posts table search
	const [postSearch, setPostSearch] = useState<string>("");

	// compute filtered rows
	const filteredRows = useMemo(() => {
		if (!subElection?.candidates) return [];
		const lower = (search || "").toLowerCase();
		return subElection.candidates.filter((c) => {
			const user = c.user;
			const first = user.first_name ?? "";
			const last = user.last_name ?? "";
			const email = user.email ?? "";
			const matchesSearch =
				first.toLowerCase().includes(lower) ||
				last.toLowerCase().includes(lower) ||
				`${first} ${last}`.toLowerCase().includes(lower) ||
				email.toLowerCase().includes(lower);
			return matchesSearch;
		});
	}, [subElection, search]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: getPostName is stable enough
	const filteredCandidations = useMemo(() => {
		if (!subElection?.candidates) return [];
		const lower = (candidationSearch || "").toLowerCase();
		return subElection.candidates.flatMap((c) =>
			c.candidations
				.filter((cand) => {
					const postName = getPostName(cand.post_id).toLowerCase();
					const createdAt = new Date(cand.created_at)
						.toLocaleString()
						.toLowerCase();
					const user = c.user;
					const first = user.first_name ?? "";
					const last = user.last_name ?? "";
					const email = user.email ?? "";
					return (
						postName.includes(lower) ||
						createdAt.includes(lower) ||
						first.toLowerCase().includes(lower) ||
						last.toLowerCase().includes(lower) ||
						email.toLowerCase().includes(lower)
					);
				})
				.map((cand) => ({
					...cand,
					user: c.user,
					candidate_id: c.candidate_id,
				})),
		);
	}, [subElection, candidationSearch]);

	// compute filtered posts
	const filteredPosts = useMemo(() => {
		if (!subElection?.election_posts) return [];
		const lower = (postSearch || "").toLowerCase();
		return subElection.election_posts.filter(
			(p) =>
				(p.name_sv ?? "").toLowerCase().includes(lower) ||
				(p.name_en ?? "").toLowerCase().includes(lower),
		);
	}, [subElection, postSearch]);

	// NEW: map post_id -> number of candidations
	const postCandidationCount = useMemo(() => {
		const map: Record<number, number> = {};
		if (subElection?.candidates) {
			for (const c of subElection.candidates) {
				for (const cand of c.candidations) {
					map[cand.post_id] = (map[cand.post_id] ?? 0) + 1;
				}
			}
		}
		return map;
	}, [subElection]);

	const handleRowClick = (row: Row<CandidateRead>) => {
		if (!subElection) return;
		router.push(
			`/admin/elections/${subElection.election_id}/${subElection.sub_election_id}/candidate/${row.original.candidate_id}`,
		);
	};

	const handleCandidationRowClick = (row: Row<any>) => {
		const candidateId = row.original.candidate_id;
		if (!subElection || !candidateId) return;
		router.push(
			`/admin/elections/${subElection.election_id}/${subElection.sub_election_id}/candidate/${candidateId}`,
		);
	};

	// Inner component to properly use hooks (do not call hooks inside column cell functions)
	function DeleteCandidateDialog({ candidate }: { candidate: CandidateRead }) {
		const [open, setOpen] = useState(false);
		return (
			<ConfirmDeleteDialog
				open={open}
				onOpenChange={setOpen}
				onConfirm={() =>
					deleteCandidate.mutate({
						path: {
							sub_election_id: candidate.sub_election_id,
							user_id: candidate.user_id,
						},
					})
				}
				triggerText={t("admin:elections.election_candidates.remove_candidate")}
				title={t("admin:elections.election_candidates.remove_candidate")}
				description={t("admin:elections.election_candidates.remove_confirm")}
				showIcon={true}
			/>
		);
	}

	const columns = [
		columnHelper.accessor((row) => row.user.first_name, {
			id: "first_name",
			header: t("admin:first_name"),
			cell: (info) => info.getValue() ?? "-",
			size: 60,
		}),
		columnHelper.accessor((row) => row.user.last_name, {
			id: "last_name",
			header: t("admin:last_name"),
			cell: (info) => info.getValue() ?? "-",
			size: 100,
		}),
		columnHelper.accessor((row) => row.user.email, {
			id: "email",
			header: t("admin:email"),
			cell: (info) => info.getValue(),
			size: 120,
		}),
		columnHelper.accessor((row) => row.user.start_year, {
			id: "start_year",
			header: t("admin:start_year"),
			cell: (info) => info.getValue(),
			size: 40,
		}),
		columnHelper.accessor((row) => row.candidations, {
			id: "candidations",
			header: t("admin:elections.election_candidates.number_of_candidations"),
			cell: (info) => info.getValue().length,
			size: 140,
		}),
		{
			id: "actions",
			header: t("admin:elections.election_candidates.actions"),
			cell: ({ row }: { row: Row<CandidateRead> }) => (
				<DeleteCandidateDialog candidate={row.original} />
			),
		},
	];

	const postColumns = [
		postColumnHelper.accessor("name_sv", {
			id: "name_sv",
			header: t("admin:elections.posts.name_sv"),
			cell: (info) => info.getValue() ?? "-",
			size: 100,
		}),
		postColumnHelper.accessor("name_en", {
			id: "name_en",
			header: t("admin:elections.posts.name_en"),
			cell: (info) => info.getValue() ?? "-",
			size: 100,
		}),
		postColumnHelper.accessor(
			(row) => postCandidationCount[row.election_post_id] ?? 0,
			{
				id: "candidations_count",
				header: t("admin:elections.posts.candidations_count"),
				cell: (info) => info.getValue(),
				size: 80,
			},
		),
	];

	const [sorting, setSorting] = useState<SortingState>([
		{ id: "first_name", desc: false },
	]);

	const [postSorting, setPostSorting] = useState<SortingState>([
		{ id: "name_sv", desc: false },
	]);

	const [candidationFormOpen, setCandidationFormOpen] = useState(false);

	const table = useReactTable({
		columns,
		data: filteredRows,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: setSorting,
		state: { sorting },
	});

	const postTable = useReactTable({
		columns: postColumns,
		data: filteredPosts,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: setPostSorting,
		state: { sorting: postSorting },
	});

	// Flat map all candidations from all candidates
	const allCandidations =
		subElection?.candidates?.flatMap((c) =>
			c.candidations.map((cand) => ({
				...cand,
				user: c.user, // optionally attach user info if needed
			})),
		) ?? [];

	if (!Number.isFinite(subElectionId)) {
		return (
			<div className="px-8">
				<h3 className="text-3xl py-3 underline underline-offset-4 text-primary">
					{t("admin:elections.election_candidates.title")}
				</h3>
				<p className="text-red-600">
					{t("admin:elections.election_candidates.missing_id")}
				</p>
			</div>
		);
	}

	if (subElectionLoading) {
		return <LoadingErrorCard />;
	}

	if (subElectionError) {
		return <LoadingErrorCard error={subElectionError} />;
	}

	return (
		<div className="px-8 space-y-4">
			<div className="flex items-start justify-between gap-4">
				<div>
					<h3 className="text-3xl py-3 underline underline-offset-4 text-primary">
						{t("elections.sub_election.page_title")}
						{" - "}
						{i18n.language === "en"
							? subElection?.title_en
							: subElection?.title_sv}
					</h3>
					<p className="text-xs md:text-sm font-medium">
						{t("elections.sub_election.page_description")}
					</p>
				</div>
				<div className="flex items-start">
					<Button
						variant="outline"
						onClick={() =>
							router.push(`/admin/elections/${params?.election_id}`)
						}
					>
						<ArrowLeft />
						{t("elections.back_to_elections")}
					</Button>
				</div>
			</div>
			<Button variant="default" onClick={() => setCandidationFormOpen(true)}>
				{t("elections.election_candidates.add")}
			</Button>
			<CandidationForm
				subElectionId={subElectionId}
				open={candidationFormOpen}
				onOpenChange={setCandidationFormOpen}
			/>

			<Tabs defaultValue="candidates" className="w-full">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="candidates">
						{t("elections.sub_election.candidates_tab")}
					</TabsTrigger>
					<TabsTrigger value="candidations">
						{t("elections.sub_election.candidations_tab")}
					</TabsTrigger>
					<TabsTrigger value="posts">
						{t("elections.sub_election.posts_tab")}
					</TabsTrigger>
				</TabsList>

				<TabsContent value="candidates" className="space-y-4">
					<h4 className="text-xl font-semibold">
						{t("elections.election_candidates.tab_title")}
					</h4>
					<p className="text-xs md:text-sm font-medium">
						{t("elections.election_candidates.tab_description")}
					</p>
					<div className="mt-4 mb-2 grid grid-cols-1 gap-2 items-center md:grid-cols-2 xl:grid-cols-3">
						<Input
							placeholder={t(
								"elections.election_candidates.search_placeholder",
							)}
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							autoFocus
						/>
					</div>
					<Separator className="mb-4" />
					<AdminTable table={table} onRowClick={handleRowClick} />
				</TabsContent>

				<TabsContent value="candidations" className="space-y-4">
					<h4 className="text-xl font-semibold">
						{t("elections.election_candidations.tab_title")}
					</h4>
					<p className="text-xs md:text-sm font-medium">
						{t("elections.election_candidations.tab_description")}
					</p>
					<div className="mt-4 mb-2 grid grid-cols-1 gap-2 items-center md:grid-cols-2 xl:grid-cols-3">
						<Input
							placeholder={t(
								"elections.election_candidations.search_placeholder",
							)}
							value={candidationSearch}
							onChange={(e) => setCandidationSearch(e.target.value)}
						/>
					</div>
					<Separator className="mb-4" />
					<CandidationTable
						candidations={filteredCandidations}
						getPostName={getPostName}
						onDeleteCandidation={(c) => {
							if (c.candidate_id) {
								deleteCandidation.mutate({
									query: {
										candidate_id: c.candidate_id,
										election_post_id: c.election_post_id,
									},
								});
							}
						}}
						showUserInfo={true}
						onRowClick={handleCandidationRowClick}
					/>
				</TabsContent>

				<TabsContent value="posts" className="space-y-4">
					<h4 className="text-xl font-semibold">
						{t("elections.posts.tab_title")}
					</h4>
					<p className="text-xs md:text-sm font-medium">
						{t("elections.posts.tab_description")}
					</p>
					<div className="mt-4 mb-2 grid grid-cols-1 gap-2 items-center md:grid-cols-2 xl:grid-cols-3">
						<Input
							placeholder={t("elections.posts.search_placeholder")}
							value={postSearch}
							onChange={(e) => setPostSearch(e.target.value)}
						/>
					</div>
					<Separator className="mb-4" />
					<AdminTable table={postTable} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
