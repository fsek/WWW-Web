"use client";

import {
	getProgramOptions,
	getSpecialisationsByProgramOptions,
} from "@/api/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table";
import type { SpecialisationRead } from "@/api";
import { useTranslation } from "react-i18next";
import AdminPage from "@/widgets/AdminPage";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, List } from "lucide-react";
import SpecialisationEditForm from "@/app/admin/specialisations/SpecialisationEditForm";
import SpecialisationForm from "@/app/admin/specialisations/SpecialisationForm";

export default function Programs() {
	const { t, i18n } = useTranslation("admin");
	const router = useRouter();
	const params = useParams();
	const programId = Number(params.program_id);

	const programQuery = useQuery({
		...getProgramOptions({ path: { program_id: programId } }),
		refetchOnWindowFocus: false,
	});

	const programTitle =
		i18n.language === "sv"
			? programQuery.data?.title_sv
			: programQuery.data?.title_en;

	// Column setup
	const columnHelper = createColumnHelper<SpecialisationRead>();
	// biome-ignore lint/suspicious/noExplicitAny: any is kind of needed here
	const columns: ColumnDef<SpecialisationRead, any>[] = [
		columnHelper.accessor("title_sv", {
			header: t("programs.specialisations_page.title_sv"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("title_en", {
			header: t("programs.specialisations_page.title_en"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("courses", {
			header: t("programs.specialisations_page.courses"),
			cell: (info) => info.getValue()?.length || "-",
		}),
		columnHelper.display({
			id: "view_courses",
			header: t("programs.specialisations_page.view_courses"),
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
						{t("programs.specialisations_page.view_courses")}
					</Button>
				</div>
			),
		}),
	];

	return (
		<AdminPage
			title={
				programTitle
					? t("programs.specialisations_page.title_with_program", {
							program: programTitle,
						})
					: t("programs.specialisations_page.title")
			}
			description={t("programs.specialisations_page.description_subtitle")}
			queryResult={useQuery({
				...getSpecialisationsByProgramOptions({
					path: { program_id: programId },
				}),
				refetchOnWindowFocus: false,
			})}
			columns={columns}
			editComponent={SpecialisationEditForm}
			headerButtons={
				<>
					<Button
						variant="outline"
						onClick={() => router.push("/admin/programs")}
					>
						<ArrowLeft />
						{t("programs.specialisations_page.back_to_programs")}
					</Button>
					<Button
						variant="default"
						onClick={() => router.push("/admin/specialisations")}
					>
						<List />
						{t("programs.specialisations_page.view_specialisations")}
					</Button>
				</>
			}
		/>
	);
}
