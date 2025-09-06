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
import { List, Eye, EyeOff } from "lucide-react";

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
		columnHelper.accessor("visible", {
			header: t("elections.visible"),
			cell: (info) =>
				info.getValue() ? (
					<span className="flex items-center gap-1">
						<Eye className="w-4 h-4 text-green-600" />
						{t("yes")}
					</span>
				) : (
					<span className="flex items-center gap-1">
						<EyeOff className="w-4 h-4 text-red-600" />
						{t("no")}
					</span>
				),
		}),
		columnHelper.accessor("start_time", {
			header: t("elections.start_time"),
			cell: (info) => {
				const value = info.getValue();
				return value ? formatTime(value) : "-";
			},
		}),
		columnHelper.accessor(
			(row) => {
				if (row.sub_elections) {
					const min_time = Math.min(
						...row.sub_elections.map((sub) =>
							sub.end_time
								? new Date(sub.end_time).getTime()
								: Number.POSITIVE_INFINITY,
						),
					);
					if (min_time !== Number.POSITIVE_INFINITY) {
						return formatTime(new Date(min_time).toISOString());
					}
					return "-";
				}
				return 0;
			},
			{
				id: "earliest_end_time",
				header: t("elections.earliest_end_time"),
				cell: (info) => info.getValue(),
			},
		),
		columnHelper.accessor("sub_elections", {
			header: t("elections.sub_elections"),
			cell: (info) => info.getValue()?.length ?? 0,
		}),
		columnHelper.accessor(
			(row) => {
				if (row.sub_elections) {
					const num_posts = row.sub_elections.reduce(
						(acc, sub) => acc + (sub.posts ? sub.posts.length : 0),
						0,
					);
					return num_posts;
				}
				return 0;
			},
			{
				id: "posts_count",
				header: t("elections.sub_posts_count"),
				cell: (info) => info.getValue(),
			},
		),
		columnHelper.accessor(
			(row) => {
				if (row.sub_elections) {
					const num_candidates = row.sub_elections.reduce(
						(acc, sub) => acc + (sub.candidates ? sub.candidates.length : 0),
						0,
					);
					return num_candidates;
				}
				return 0;
			},
			{
				id: "candidates_count",
				header: t("elections.sub_candidates_count"),
				cell: (info) => info.getValue(),
			},
		),
		columnHelper.display({
			id: "actions",
			header: t("elections.actions"),
			cell: (info) => (
				<div className="flex gap-2">
					<Button
						variant="outline"
						onClick={(e) => {
							e.stopPropagation();
							router.push(`/admin/elections/${info.row.original.election_id}`);
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
		refetchOnWindowFocus: false,
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
