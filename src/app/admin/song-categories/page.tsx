"use client";

import { getAllSongCategoriesOptions } from "@/api/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table";
import type { SongCategoryRead } from "../../../api";
import SongCategoryForm from "./SongCategoryForm";
import SongCategoryEditForm from "./SongCategoryEditForm";
import { useTranslation } from "react-i18next";
import AdminPage from "@/widgets/AdminPage";

export default function SongCategories() {
	const { t } = useTranslation("admin");

	// Column setup
	const columnHelper = createColumnHelper<SongCategoryRead>();
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const columns: ColumnDef<SongCategoryRead, any>[] = [
		columnHelper.accessor("name", {
			header: t("song_categories.name"),
			cell: (info) => info.getValue(),
		}),
	];
	return (
		<AdminPage
			title={t("song_categories.title")}
			description={t("song_categories.description_subtitle")}
			queryResult={useQuery({
				...getAllSongCategoriesOptions(),
				refetchOnWindowFocus: false,
			})}
			columns={columns}
			editComponent={SongCategoryEditForm}
			headerButtons={<SongCategoryForm />}
		/>
	);
}
