"use client";

import { getAllCoursesOptions } from "@/api/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table";
import type { CourseRead } from "@/api";
import CourseEditForm from "./CourseEditForm";
import { useTranslation } from "react-i18next";
import AdminPage from "@/widgets/AdminPage";
import CourseForm from "./CourseForm";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Courses() {
	const { t } = useTranslation("admin");

	const router = useRouter();

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
			header: t("courses.title"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("course_code", {
			header: t("courses.course_code"),
			cell: (info) => info.getValue() || "-",
		}),
		columnHelper.accessor("description", {
			header: t("courses.description"),
			cell: (info) => info.getValue() || "-",
		}),
		columnHelper.accessor("updated_at", {
			header: t("courses.updated_at"),
			cell: (info) => formatUpdatedAt(info.getValue()),
		}),
		columnHelper.display({
			id: "view_course_documents",
			header: t("courses.view_course_documents"),
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
						{t("courses.view_course_documents")}
					</Button>
				</div>
			),
		}),
	];

	return (
		<AdminPage
			title={t("courses.title_page")}
			description={t("courses.description_subtitle")}
			queryResult={useQuery({
				...getAllCoursesOptions(),
				refetchOnWindowFocus: false,
			})}
			columns={columns}
			editComponent={CourseEditForm}
			headerButtons={<CourseForm />}
		/>
	);
}
