"use client";

import { getAllSongsOptions } from "@/api/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import {
	type ColumnDef,
	createColumnHelper,
	type Row,
} from "@tanstack/react-table";
import type { SongRead } from "../../../api";
import SongEditForm from "./SongEditForm";
import { useTranslation } from "react-i18next";
import AdminPage from "@/widgets/AdminPage";
import SongForm from "./SongForm";

export default function Songs() {
	const { t } = useTranslation("admin");

	// Column setup
	const columnHelper = createColumnHelper<SongRead>();
	// biome-ignore lint/suspicious/noExplicitAny: any is kind of needed here
	const columns: ColumnDef<SongRead, any>[] = [
		columnHelper.accessor("title", {
			header: t("songs.title"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("author", {
			header: t("songs.author"),
			cell: (info) => info.getValue() || "-",
		}),
		columnHelper.accessor("melody", {
			header: t("songs.melody"),
			cell: (info) => info.getValue() || "-",
		}),
		columnHelper.accessor("category", {
			header: t("songs.category"),
			cell: (info) => info.getValue()?.name || "-",
		}),
		columnHelper.accessor("views", {
			header: t("songs.views"),
			cell: (info) => info.getValue(),
		}),
	];

	return (
		<AdminPage
			title={t("songs.title")}
			description={t("songs.description_subtitle")}
			queryResult={useQuery({
				...getAllSongsOptions(),
				refetchOnWindowFocus: false,
			})}
			columns={columns}
			editComponent={SongEditForm}
			headerButtons={<SongForm />}
		/>
	);
}
