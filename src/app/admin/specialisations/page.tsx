"use client";

import { getAllSpecialisationsOptions } from "@/api/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table";
import type { SpecialisationRead } from "@/api";
import SpecialisationEditForm from "./SpecialisationEditForm";
import { useTranslation } from "react-i18next";
import AdminPage from "@/widgets/AdminPage";
import SpecialisationForm from "./SpecialisationForm";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Specialisations() {
	const { t } = useTranslation("admin");

	const router = useRouter();
	// Column setup
	const columnHelper = createColumnHelper<SpecialisationRead>();
	// biome-ignore lint/suspicious/noExplicitAny: any is kind of needed here
	const columns: ColumnDef<SpecialisationRead, any>[] = [
		columnHelper.accessor("title_sv", {
			header: t("specialisations.title_sv"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("title_en", {
			header: t("specialisations.title_en"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("courses", {
			header: t("specialisations.courses"),
			cell: (info) => info.getValue()?.length || "-",
		}),
		columnHelper.display({
			id: "view_courses",
			header: t("specialisations.view_courses"),
			cell: (info) => (
				<div className="flex gap-2">
					<Button
						variant="outline"
						onClick={(e) => {
							e.stopPropagation();
							router.push(
								`/admin/specialisations/${info.row.original.specialisation_id}/courses`,
							);
						}}
					>
						<Eye />
						{t("specialisations.view_courses")}
					</Button>
				</div>
			),
		}),
	];

	return (
		<AdminPage
			title={t("specialisations.title")}
			description={t("specialisations.description_subtitle")}
			queryResult={useQuery({
				...getAllSpecialisationsOptions(),
				refetchOnWindowFocus: false,
			})}
			columns={columns}
			editComponent={SpecialisationEditForm}
			headerButtons={<SpecialisationForm />}
		/>
	);
}
