"use client";

import { getAllCouncilsOptions } from "@/api/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table";

import type { CouncilRead } from "../../../api";
import CouncilForm from "./CouncilForm";
import CouncilEditForm from "./CouncilEditForm";
import { useTranslation } from "react-i18next";
import AdminPage from "@/widgets/AdminPage";

export default function Councils() {
	const { t, i18n } = useTranslation("admin");

	// Column setup
	const columnHelper = createColumnHelper<CouncilRead>();
	// biome-ignore lint/suspicious/noExplicitAny: any is kind of needed here
	const columns: ColumnDef<CouncilRead, any>[] = [
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

	return (
		<AdminPage
			title={t("councils.title")}
			description={t("councils.description_subtitle")}
			queryResult={useQuery({
				...getAllCouncilsOptions(),
			})}
			columns={columns}
			editComponent={CouncilEditForm}
			headerButtons={<CouncilForm />}
		/>
	);
}
