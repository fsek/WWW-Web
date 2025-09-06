"use client";

import {
	electionsGetSubElectionOptions,
	deleteCandidateMutation,
	electionsGetSubElectionQueryKey,
} from "@/api/@tanstack/react-query.gen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import AdminTable from "@/widgets/AdminTable";
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
import type { CandidateRead } from "@/api/types.gen";
import CandidationForm from "./CandidationForm";
import { toast } from "sonner";
import getErrorMessage from "@/help_functions/getErrorMessage";

const columnHelper = createColumnHelper<CandidateRead>();

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

	// search state
	const [search, setSearch] = useState<string>("");

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

	const handleRowClick = (row: Row<CandidateRead>) => {
		if (!subElection) return;
		router.push(
			`/admin/elections/${subElection.election_id}/${subElection.sub_election_id}/candidate/${row.original.candidate_id}`,
		);
	};

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
				<Button
					variant="destructive"
					size="sm"
					onClick={(e) => {
						e.stopPropagation();
						deleteCandidate.mutate({
							path: {
								sub_election_id: row.original.sub_election_id,
								user_id: row.original.user_id,
							},
						});
					}}
				>
					{t("admin:elections.election_candidates.remove_candidate")}
				</Button>
			),
		},
	];

	const [sorting, setSorting] = useState<SortingState>([
		{ id: "first_name", desc: false },
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
		<div className="px-8 space-x-4">
			<div className="space-y-0">
				<h3 className="text-3xl py-3 underline underline-offset-4 text-primary">
					{t("admin:elections.election_candidates.title")}
					{" - "}
					{i18n.language === "en"
						? subElection?.title_en
						: subElection?.title_sv}
				</h3>
				<p className="text-xs md:text-sm font-medium">
					{t("admin:elections.election_candidates.description")}
				</p>

				<div className="mt-4 mb-2 grid grid-cols-1 gap-2 items-center md:grid-cols-2 xl:grid-cols-3">
					<Input
						placeholder={t(
							"admin:elections.election_candidates.search_placeholder",
						)}
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						autoFocus
					/>
					<Button
						variant="default"
						onClick={() => setCandidationFormOpen(true)}
					>
						{t("admin:elections.election_candidates.add")}
					</Button>
				</div>
				<CandidationForm
					subElectionId={subElectionId}
					open={candidationFormOpen}
					onOpenChange={setCandidationFormOpen}
				/>
				<Separator className="mb-4" />
			</div>

			<AdminTable table={table} onRowClick={handleRowClick} />
		</div>
	);
}
