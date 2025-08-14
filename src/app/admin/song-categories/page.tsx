"use client";

import { useState } from "react";
import { getAllSongCategoriesOptions } from "@/api/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import { createColumnHelper, type Row } from "@tanstack/react-table";

import AdminTable from "@/widgets/AdminTable";
import type { SongCategoryRead } from "../../../api";
import useCreateTable from "@/widgets/useCreateTable";
import SongCategoryForm from "./SongCategoryForm";
import SongCategoryEditForm from "./SongCategoryEditForm";
import { useTranslation } from "react-i18next";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";

export default function SongCategories() {
	const { t } = useTranslation("admin");

	// Column setup
	const columnHelper = createColumnHelper<SongCategoryRead>();
	const columns = [
		columnHelper.accessor("name", {
			header: t("song_categories.name"),
			cell: (info) => info.getValue(),
		}),
	];

	const { data, error, isPending } = useQuery({
		...getAllSongCategoriesOptions(),
	});

	const [openEditDialog, setOpenEditDialog] = useState(false);
	const [selectedSongCategory, setSelectedSongCategory] =
		useState<SongCategoryRead | null>(null);

	const table = useCreateTable({ data: data ?? [], columns });

	function handleRowClick(row: Row<SongCategoryRead>) {
		setSelectedSongCategory(row.original);
		setOpenEditDialog(true);
	}

	function handleClose() {
		setOpenEditDialog(false);
		setSelectedSongCategory(null);
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
				{t("song_categories.title")}
			</h3>
			<p className="py-3">{t("song_categories.description_subtitle")}</p>
			<SongCategoryForm />

			<AdminTable table={table} onRowClick={handleRowClick} />

			<SongCategoryEditForm
				open={openEditDialog}
				onClose={() => handleClose()}
				selectedSongCategory={selectedSongCategory as SongCategoryRead}
			/>
		</div>
	);
}
