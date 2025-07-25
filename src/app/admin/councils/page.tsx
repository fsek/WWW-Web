"use client";

import { useState } from "react";
import { getAllCouncilsOptions } from "@/api/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import { createColumnHelper, type Row } from "@tanstack/react-table";

import AdminTable from "@/widgets/AdminTable";
import type { CouncilRead } from "../../../api";
import useCreateTable from "@/widgets/useCreateTable";
import CouncilForm from "./CouncilForm";
import CouncilEditForm from "./CouncilEditForm";
import { useTranslation } from "react-i18next";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import { Toaster } from "@/components/ui/sonner";

export default function Councils() {
	const { t, i18n } = useTranslation("admin");

	// Column setup
	const columnHelper = createColumnHelper<CouncilRead>();
	const columns = [
		columnHelper.accessor(i18n.language === "en" ? "name_en" : "name_sv", {
			header: t("councils.name", "Name"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor(
			i18n.language === "en" ? "description_en" : "description_sv",
			{
				header: t("councils.description", "Description"),
				cell: (info) => info.getValue() ?? "",
			},
		),
	];

	const { data, error, isPending } = useQuery({
		...getAllCouncilsOptions(),
	});

	const [openEditDialog, setOpenEditDialog] = useState(false);
	const [selectedCouncil, setSelectedCouncil] = useState<CouncilRead | null>(
		null,
	);

	const table = useCreateTable({ data: data ?? [], columns });

	function handleRowClick(row: Row<CouncilRead>) {
		setSelectedCouncil(row.original);
		setOpenEditDialog(true);
	}

	function handleClose() {
		setOpenEditDialog(false);
		setSelectedCouncil(null);
	}

	if (isPending) {
		return <LoadingErrorCard />;
	}

	if (error) {
		return <LoadingErrorCard error={error} />;
	}

	return (
		<div className="px-8 space-x-4">
			<h3 className="text-xl px-8 py-3 underline underline-offset-4 decoration-sidebar">
				{t("councils.title")}
			</h3>
			<p className="py-3">{t("councils.description_subtitle")}</p>
			<CouncilForm />

			<AdminTable table={table} onRowClick={handleRowClick} />

			<CouncilEditForm
				open={openEditDialog}
				onClose={() => handleClose()}
				selectedCouncil={selectedCouncil as CouncilRead}
			/>
			<Toaster position="top-center" richColors />
		</div>
	);
}
