"use client";

import { useEffect, useState } from "react";
import { getAllElectionsOptions } from "@/api/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import { createColumnHelper, type Row } from "@tanstack/react-table";
import AdminTable from "@/widgets/AdminTable";
import type { ElectionRead } from "@/api";
import useCreateTable from "@/widgets/useCreateTable";
import ElectionsForm from "./ElectionsForm";
import ElectionsEditForm from "./ElectionsEditForm";
import { useTranslation } from "react-i18next";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import formatTime from "@/help_functions/timeFormater";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { List } from "lucide-react";

export default function Elections() {
	const { t } = useTranslation("admin");
	const router = useRouter();

	// Column setup
	const columnHelper = createColumnHelper<ElectionRead>();

	const columns = [
		columnHelper.accessor("title_sv", {
			id: "title_sv",
			header: t("elections.title_sv"),
			cell: (info) => info.getValue() ?? "",
		}),
		columnHelper.accessor("start_time", {
			header: t("elections.start_time"),
			cell: (info) => {
				const value = info.getValue();
				return value ? formatTime(value) : "-";
			},
		}),
		columnHelper.accessor("end_time_guild_meeting", {
			header: t("elections.end_guild_meeting"),
			cell: (info) => {
				const value = info.getValue();
				return value ? formatTime(value) : "-";
			},
		}),
		columnHelper.accessor("end_time_middle_meeting", {
			header: t("elections.end_middle_meeting"),
			cell: (info) => {
				const value = info.getValue();
				return value ? formatTime(value) : "-";
			},
		}),
		columnHelper.accessor("end_time_all", {
			header: t("elections.end_all"),
			cell: (info) => {
				const value = info.getValue();
				return value ? formatTime(value) : "-";
			},
		}),
		columnHelper.accessor((row) => row.posts?.length ?? 0, {
			id: "posts_count",
			header: t("elections.posts_count"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor((row) => row.candidates?.length ?? 0, {
			id: "candidates_count",
			header: t("elections.candidates_count"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.display({
			id: "actions",
			header: t("elections.actions"),
			cell: (info) => (
				<div className="flex gap-2">
					<Button
						variant="outline"
						onClick={(e) => {
							e.stopPropagation();
							router.push(`/elections/${info.row.original.election_id}`);
						}}
					>
						<List />
						{t("elections.edit")}
					</Button>
				</div>
			),
		}),
	];

	const { data, error, isPending } = useQuery({
		...getAllElectionsOptions(),
	});

	const [openEditDialog, setOpenEditDialog] = useState(false);
	const [selectedElection, setSelectedElection] = useState<ElectionRead | null>(
		null,
	);

	const table = useCreateTable({ data: data ?? [], columns });

	// set default sort on start_time (recent -> old) once data arrives
	useEffect(() => {
		if (data && table.getState().sorting.length === 0) {
			table.setSorting([{ id: "start_time", desc: true }]);
		}
	}, [data, table]);

	function handleRowClick(row: Row<ElectionRead>) {
		setSelectedElection(row.original);
		setOpenEditDialog(true);
	}

	function handleClose() {
		setOpenEditDialog(false);
		setSelectedElection(null);
	}

	if (isPending) {
		return <LoadingErrorCard />;
	}

	if (error) {
		return <LoadingErrorCard error={error} />;
	}

	return (
		<div className="px-8 space-x-4">
			<h3 className="text-3xl py-3 font-bold text-primary">
				{t("elections.title")}
			</h3>
			<p className="py-3">{t("elections.description_subtitle")}</p>
			<ElectionsForm />

			<AdminTable table={table} onRowClick={handleRowClick} />

			<ElectionsEditForm
				open={openEditDialog}
				onClose={() => handleClose()}
				selectedElection={selectedElection as ElectionRead}
			/>
		</div>
	);
}
