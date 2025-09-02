"use client";

import { useState } from "react";
import { getAllElectionsOptions } from "@/api/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import { createColumnHelper, type Row } from "@tanstack/react-table";

import AdminTable from "@/widgets/AdminTable";
import type { ElectionRead } from "../../../api";
import useCreateTable from "@/widgets/useCreateTable";
import ElectionsForm from "./ElectionsForm";
import ElectionsEditForm from "./ElectionsEditForm";
import { useTranslation } from "react-i18next";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";

export default function Elections() {
	const { t } = useTranslation("admin");

	// Column setup
	const columnHelper = createColumnHelper<ElectionRead>();
	const columns = [
		columnHelper.accessor("title", {
			header: t("elections.title", "Title"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("description", {
			header: t("elections.description", "Description"),
			cell: (info) => info.getValue() ?? "",
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
