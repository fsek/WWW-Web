"use client";

import {
	getProgramOptions,
	getProgramYearsByProgramOptions,
} from "@/api/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table";
import type { ProgramYearRead } from "@/api";
import ProgramEditForm from "./ProgramYearEditForm";
import { useTranslation } from "react-i18next";
import AdminPage from "@/widgets/AdminPage";
import ProgramForm from "./ProgramYearForm";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye } from "lucide-react";

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
	const columnHelper = createColumnHelper<ProgramYearRead>();
	// biome-ignore lint/suspicious/noExplicitAny: any is kind of needed here
	const columns: ColumnDef<ProgramYearRead, any>[] = [
		columnHelper.accessor("title_sv", {
			header: t("program_years.title_sv"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("title_en", {
			header: t("program_years.title_en"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("courses", {
			header: t("program_years.courses"),
			cell: (info) => info.getValue()?.length || "-",
		}),
		columnHelper.display({
			id: "view_courses",
			header: t("program_years.view_courses"),
			cell: (info) => (
				<div className="flex gap-2">
					<Button
						variant="outline"
						onClick={(e) => {
							e.stopPropagation();
							router.push(
								`/admin/programs/${info.row.original.program_id}/program-years/${info.row.original.program_year_id}/courses`,
							);
						}}
					>
						<Eye />
						{t("program_years.view_courses")}
					</Button>
				</div>
			),
		}),
	];

	return (
		<AdminPage
			title={
				programTitle
					? t("program_years.title_with_program", { program: programTitle })
					: t("program_years.title")
			}
			description={t("program_years.description_subtitle")}
			queryResult={useQuery({
				...getProgramYearsByProgramOptions({ path: { program_id: programId } }),
				refetchOnWindowFocus: false,
			})}
			columns={columns}
			editComponent={ProgramEditForm}
			headerButtons={
				<>
					<Button
						variant="outline"
						onClick={() => router.push("/admin/programs")}
					>
						<ArrowLeft />
						{t("program_years.back_to_programs")}
					</Button>
					<ProgramForm />
				</>
			}
		/>
	);
}
