"use client";

import {
	getAllDocumentsFromCourseOptions,
	getCourseOptions,
} from "@/api/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table";
import type { CourseDocumentRead } from "@/api";
import CourseEditForm from "./CourseDocumentEditForm";
import { useTranslation } from "react-i18next";
import AdminPage from "@/widgets/AdminPage";
import CourseForm from "./CourseDocumentForm";
import { Button } from "@/components/ui/button";
import { ExternalLink, List } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import { buildCourseDocumentFileHref } from "@/utils/pluggHrefBuilders";

export default function CourseDocumentsPage() {
	const { t } = useTranslation("admin");

	const router = useRouter();
	const params = useParams();
	const courseId = Number(params.course_id);
	const validCourseId = Number.isFinite(courseId) && courseId > 0;

	function openCourseDocument(courseDocumentId: number) {
		window.open(
			buildCourseDocumentFileHref(courseDocumentId),
			"_blank",
			"noopener,noreferrer",
		);
	}

	const courseQuery = useQuery({
		...getCourseOptions({ path: { course_id: validCourseId ? courseId : 0 } }),
		enabled: validCourseId,
		refetchOnWindowFocus: false,
	});

	if (!validCourseId) {
		return (
			<LoadingErrorCard
				error={t("courses.course_documents.invalid_course_id")}
			/>
		);
	}

	const translatedCategoryByValue: Record<
		CourseDocumentRead["category"],
		string
	> = {
		Notes: t("courses.course_documents.categories.notes"),
		Summary: t("courses.course_documents.categories.summary"),
		Solutions: t("courses.course_documents.categories.solutions"),
		Other: t("courses.course_documents.categories.other"),
	};

	// Column setup
	const columnHelper = createColumnHelper<CourseDocumentRead>();
	// biome-ignore lint/suspicious/noExplicitAny: any is kind of needed here
	const columns: ColumnDef<CourseDocumentRead, any>[] = [
		columnHelper.accessor("title", {
			header: t("courses.course_documents.title"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("file_name", {
			header: t("courses.course_documents.file_name"),
			cell: (info) => info.getValue() || "-",
		}),
		columnHelper.accessor("author", {
			header: t("courses.course_documents.author"),
			cell: (info) => info.getValue() || "-",
		}),
		columnHelper.accessor("category", {
			header: t("courses.course_documents.category"),
			cell: (info) => {
				const category = info.getValue() as CourseDocumentRead["category"];
				return translatedCategoryByValue[category] ?? category;
			},
		}),
		columnHelper.accessor("sub_category", {
			header: t("courses.course_documents.sub_category"),
			cell: (info) => info.getValue() || "-",
		}),
		columnHelper.accessor("updated_at", {
			header: t("courses.course_documents.updated_at"),
			cell: (info) =>
				new Date(info.getValue()).toLocaleString("sv-SE", {
					year: "numeric",
					month: "2-digit",
					day: "2-digit",
					hour: "2-digit",
					minute: "2-digit",
				}),
		}),
		columnHelper.display({
			id: "open_document",
			header: t("courses.course_documents.open_document"),
			cell: (info) => (
				<Button
					type="button"
					variant="outline"
					onClick={(event) => {
						event.stopPropagation();
						openCourseDocument(info.row.original.course_document_id);
					}}
				>
					<ExternalLink />
					{t("courses.course_documents.open_document")}
				</Button>
			),
		}),
	];

	return (
		<AdminPage
			title={t("courses.course_documents.title_page", {
				course: courseQuery.data?.title,
			})}
			description={t("courses.course_documents.description_subtitle")}
			queryResult={useQuery({
				...getAllDocumentsFromCourseOptions({ path: { course_id: courseId } }),
				refetchOnWindowFocus: false,
			})}
			columns={columns}
			editComponent={CourseEditForm}
			headerButtons={
				<>
					<Button
						variant="outline"
						onClick={() => router.push("/admin/courses")}
					>
						<List />
						{t("courses.view_courses")}
					</Button>
					<CourseForm courseId={courseId} />
				</>
			}
		/>
	);
}
