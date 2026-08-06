"use client";

import {
	type EncloseMooseLevelRead,
	mooseGetAllLevelsOptions,
} from "../../../api";
import { useTranslation } from "react-i18next";
import AdminPage from "@/widgets/AdminPage";
import { useQuery } from "@tanstack/react-query";
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table";
import EncloseMooseLevelEditForm from "./EncloseMooseLevelEditForm";
import EncloseMooseLevelForm from "./EncloseMooseLevelForm";

export default function EncloseMoose() {
	const { t } = useTranslation("admin");

	const columnHelper = createColumnHelper<EncloseMooseLevelRead>();

	const columns: ColumnDef<EncloseMooseLevelRead, any>[] = [
		columnHelper.accessor("name", {
			header: t("enclose_moose.name"),
			cell: (info) => info.getValue(),
		}),
	];

	return (
		<AdminPage
			title={t("enclose_moose.page_title")}
			description={t("enclose_moose.page_description")}
			queryResult={useQuery({
				...mooseGetAllLevelsOptions(),
				refetchOnWindowFocus: false,
			})}
			columns={columns}
			editComponent={EncloseMooseLevelEditForm}
			headerButtons={<EncloseMooseLevelForm />}
		/>
	);
}
