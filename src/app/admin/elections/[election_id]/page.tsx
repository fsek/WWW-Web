"use client";

import { use, useEffect, useState } from "react";
import { getElectionOptions } from "@/api/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import { createColumnHelper, type Row } from "@tanstack/react-table";
import AdminTable from "@/widgets/AdminTable";
import type { SubElectionRead } from "@/api";
import useCreateTable from "@/widgets/useCreateTable";
import SubElectionsForm from "./SubElectionsForm";
import SubElectionsEditForm from "./SubElectionsEditForm";
import { useTranslation } from "react-i18next";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import formatTime from "@/help_functions/timeFormater";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, List } from "lucide-react";

export default function SubElections() {
	const { t } = useTranslation("admin");
	const router = useRouter();
	const params = useParams();
	const electionId = Number(params?.election_id);

	// Column setup
	const columnHelper = createColumnHelper<SubElectionRead>();

	const columns = [
		columnHelper.accessor("title_sv", {
			id: "title_sv",
			header: t("election.sub_election.title_sv"),
			cell: (info) => info.getValue() ?? "",
		}),
		columnHelper.accessor("title_en", {
			id: "title_en",
			header: t("election.sub_election.title_en"),
			cell: (info) => info.getValue() ?? "",
		}),
		columnHelper.accessor("end_time", {
			header: t("election.sub_election.end_time"),
			cell: (info) => {
				const value = info.getValue();
				return value ? formatTime(value) : "-";
			},
		}),
		columnHelper.accessor((row) => row.posts?.length ?? 0, {
			id: "posts_count",
			header: t("election.sub_election.posts_count"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor((row) => row.candidates?.length ?? 0, {
			id: "candidates_count",
			header: t("election.sub_election.candidates_count"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.display({
			id: "actions",
			header: t("election.sub_election.actions"),
			cell: (info) => (
				<div className="flex gap-2">
					<Button
						variant="outline"
						onClick={(e) => {
							e.stopPropagation();
							router.push(
								`/admin/elections/${info.row.original.election_id}/${info.row.original.sub_election_id}`,
							);
						}}
					>
						<List />
						{t("election.sub_election.edit_candidates")}
					</Button>
				</div>
			),
		}),
	];

	const {
		data: election,
		error,
		isPending,
	} = useQuery({
		...getElectionOptions({ path: { election_id: electionId } }),
	});

	const [openEditDialog, setOpenEditDialog] = useState(false);
	const [selectedSubElection, setSelectedSubElection] =
		useState<SubElectionRead | null>(null);

	const table = useCreateTable({
		data: election?.sub_elections ?? [],
		columns,
	});

	// set default sort on end_time (recent -> old) once data arrives
	useEffect(() => {
		if (election?.sub_elections && table.getState().sorting.length === 0) {
			table.setSorting([{ id: "end_time", desc: true }]);
		}
	}, [election, table]);

	function handleRowClick(row: Row<SubElectionRead>) {
		setSelectedSubElection(row.original);
		setOpenEditDialog(true);
	}

	function handleClose() {
		setOpenEditDialog(false);
		setSelectedSubElection(null);
	}

	if (isPending) {
		return <LoadingErrorCard />;
	}

	if (error) {
		return <LoadingErrorCard error={error} />;
	}

	return (
		<div className="px-8 space-x-4">
			<div className="flex items-center gap-4 py-3">
				<Button
					variant="outline"
					onClick={() => router.push("/admin/elections")}
				>
					<ArrowLeft />
					{t("election.back_to_elections")}
				</Button>
				<h3 className="text-3xl font-bold text-primary">
					{t("election.sub_election.title")} - {election?.title_sv}
				</h3>
			</div>
			<p className="py-3">{t("election.sub_election.description")}</p>
			<SubElectionsForm electionId={electionId} />

			<AdminTable table={table} onRowClick={handleRowClick} />

			{selectedSubElection && (
				<SubElectionsEditForm
					open={openEditDialog}
					onClose={() => handleClose()}
					selectedSubElection={selectedSubElection}
					electionId={electionId}
				/>
			)}
		</div>
	);
}
