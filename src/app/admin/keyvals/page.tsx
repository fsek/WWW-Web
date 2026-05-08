"use client";

import { getKeyvalsOptions } from "@/api/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table";
import type { KeyvalRead } from "@/api";
import KeyvalEditForm from "./KeyvalEditForm";
import { useTranslation } from "react-i18next";
import AdminPage from "@/widgets/AdminPage";
import KeyvalForm from "./KeyvalForm";

export default function Keyvals() {
	const { t } = useTranslation("admin");

	// Column setup
	const columnHelper = createColumnHelper<KeyvalRead>();
	// biome-ignore lint/suspicious/noExplicitAny: any is kind of needed here
	const columns: ColumnDef<KeyvalRead, any>[] = [
		columnHelper.accessor("key", {
			header: t("keyvals.key"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("value", {
			header: t("keyvals.value"),
			cell: (info) => info.getValue() || "-",
		}),
	];

	return (
		<AdminPage
			title={t("keyvals.title")}
			description={t("keyvals.description_subtitle")}
			queryResult={useQuery({
				...getKeyvalsOptions(),
				refetchOnWindowFocus: false,
			})}
			columns={columns}
			editComponent={KeyvalEditForm}
			headerButtons={<KeyvalForm />}
		/>
	);
}
