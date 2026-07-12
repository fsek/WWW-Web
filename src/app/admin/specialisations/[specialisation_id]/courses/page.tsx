"use client";

import {
	getCoursesBySpecialisationOptions,
	getSpecialisationOptions,
} from "@/api/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table";
import type { CourseRead } from "@/api";
import { useTranslation } from "react-i18next";
import AdminPage from "@/widgets/AdminPage";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye } from "lucide-react";

export default function SpecialisationCourses() {
	const { t, i18n } = useTranslation("admin");
	const router = useRouter();
	const params = useParams();
	const specialisationId = Number(params.specialisation_id);

	const specialisationQuery = useQuery({
		...getSpecialisationOptions({
			path: { specialisation_id: specialisationId },
		}),
		refetchOnWindowFocus: false,
	});

	const specialisationTitle =
		i18n.language === "sv"
			? specialisationQuery.data?.title_sv
			: specialisationQuery.data?.title_en;

	function formatUpdatedAt(updatedAt: CourseRead["updated_at"]) {
		return updatedAt
			? new Date(updatedAt).toLocaleString("sv-SE", {
					year: "numeric",
					month: "2-digit",
					day: "2-digit",
					hour: "2-digit",
					minute: "2-digit",
				})
			: "-";
	}

	// Column setup
	const columnHelper = createColumnHelper<CourseRead>();
	// biome-ignore lint/suspicious/noExplicitAny: any is kind of needed here
	const columns: ColumnDef<CourseRead, any>[] = [
		columnHelper.accessor("title", {
			header: t("specialisations.courses_page.title_column"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("course_code", {
			header: t("specialisations.courses_page.course_code"),
			cell: (info) => info.getValue() || "-",
		}),
		columnHelper.accessor("updated_at", {
			header: t("specialisations.courses_page.updated_at"),
			cell: (info) => formatUpdatedAt(info.getValue()),
		}),
		columnHelper.display({
			id: "view_course_documents",
			header: t("specialisations.courses_page.view_course_documents"),
			cell: (info) => (
				<div className="flex gap-2">
					<Button
						variant="outline"
						onClick={(e) => {
							e.stopPropagation();
							router.push(`/admin/courses/${info.row.original.course_id}`);
						}}
					>
						<Eye />
						{t("specialisations.courses_page.view_course_documents")}
					</Button>
				</div>
			),
		}),
	];

	return (
		<AdminPage
			title={
				specialisationTitle
					? t("specialisations.courses_page.title_with_specialisation", {
							specialisation: specialisationTitle,
						})
					: t("specialisations.courses_page.title")
			}
			description={t("specialisations.courses_page.description_subtitle")}
			queryResult={useQuery({
				...getCoursesBySpecialisationOptions({
					path: { specialisation_id: specialisationId },
				}),
				refetchOnWindowFocus: false,
			})}
			columns={columns}
			editComponent={null}
			headerButtons={
				<Button
					variant="outline"
					onClick={() => router.push("/admin/specialisations")}
				>
					<ArrowLeft />
					{t("specialisations.courses_page.back_to_specialisations")}
				</Button>
			}
		/>
	);
}
