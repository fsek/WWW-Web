"use client";

import {
	type EncloseMooseLevelRead,
	mooseAdminGetAllLevelsOptions,
	mooseAdminGetLevelOptions,
	mooseGetAllLevelsOptions,
} from "../../../api";
import { useTranslation } from "react-i18next";
import AdminPage from "@/widgets/AdminPage";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import {
	type ColumnDef,
	createColumnHelper,
	type Row,
} from "@tanstack/react-table";
import EncloseMooseLevelEditForm from "./EncloseMooseLevelEditForm";
import EncloseMooseLevelForm from "./EncloseMooseLevelForm";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function EncloseMoose() {
	const { t } = useTranslation("admin");
	const router = useRouter();

	const columnHelper = createColumnHelper<EncloseMooseLevelRead>();

	const columns: ColumnDef<EncloseMooseLevelRead, any>[] = [
		columnHelper.accessor("name_sv", {
			header: t("enclose_moose.name_sv"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("name_en", {
			header: t("enclose_moose.name_en"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("release_date", {
			header: t("enclose_moose.release_date"),
			cell: (info) => new Date(info.getValue()).toLocaleDateString("sv-SE"),
		}),
		columnHelper.accessor("day_index", {
			header: t("enclose_moose.day_index"),
			cell: (info) => info.getValue() ?? t("enclose_moose.day_index_missing"),
		}),
		// {
		// 	id: "view",
		// 	header: t("enclose_moose.results"),
		// 	cell: ({ row }: { row: Row<EncloseMooseLevelRead> }) => (
		// 		<Button
		// 			variant="outline"
		// 			onClick={(e) => {
		// 				e.stopPropagation();
		// 				router.push(`/admin/enclose-moose/levels/${row.original.level_id}`);
		// 			}}
		// 		>
		// 			{t("enclose_moose.view_results")}
		// 		</Button>
		// 	),
		// },
	];

	return (
		<AdminPage
			title={t("enclose_moose.page_title")}
			description={t("enclose_moose.page_description")}
			queryResult={useQuery({
				...mooseAdminGetAllLevelsOptions(),
				refetchOnWindowFocus: false,
			})}
			columns={columns}
			editComponent={EncloseMooseLevelEditForm}
			headerButtons={<EncloseMooseLevelForm />}
		/>
	);
}
