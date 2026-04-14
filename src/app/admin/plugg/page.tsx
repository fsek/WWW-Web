"use client";

import { getAllProgramsOptions } from "@/api/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import {
	type ColumnDef,
	createColumnHelper,
	type Row,
} from "@tanstack/react-table";
import type { ProgramRead } from "@/api";
import ProgramEditForm from "./ProgramEditForm";
import { useTranslation } from "react-i18next";
import AdminPage from "@/widgets/AdminPage";
import ProgramForm from "./ProgramForm";

export default function Programs() {
	const { t } = useTranslation("admin");

	// Column setup
	const columnHelper = createColumnHelper<ProgramRead>();
	// biome-ignore lint/suspicious/noExplicitAny: any is kind of needed here
	const columns: ColumnDef<ProgramRead, any>[] = [
		columnHelper.accessor("title_sv", {
			header: t("programs.title_sv"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("title_en", {
			header: t("programs.title_en"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("program_years", {
			header: t("programs.num_years"),
			cell: (info) => info.getValue().length || "-",
		}),
		columnHelper.accessor("specialisations", {
			header: t("programs.num_specialisations"),
			cell: (info) => info.getValue().length || "-",
		}),
	];

	return (
		<AdminPage
			title={t("programs.title")}
			description={t("programs.description_subtitle")}
			queryResult={useQuery({
				...getAllProgramsOptions(),
				refetchOnWindowFocus: false,
			})}
			columns={columns}
			editComponent={ProgramEditForm}
			headerButtons={<ProgramForm />}
		/>
	);
}
