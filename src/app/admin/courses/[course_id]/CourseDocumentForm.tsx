import { useState } from "react";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	createCourseDocumentMutation,
	getAllDocumentsFromCourseQueryKey,
} from "@/api/@tanstack/react-query.gen";
import { CategoryEnum, type CategoryEnum as CategoryEnumType } from "@/api";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import AdminForm from "@/widgets/AdminForm";
import { MAX_DOC_FILE_SIZE_MB } from "@/constants";

const ALLOWED_DOC_FILE_TYPES = new Set([
	"application/pdf",
	"image/jpeg",
	"image/png",
	"text/plain",
]);

interface CourseDocumentFormProps {
	courseId: number;
}

export default function CourseDocumentForm({
	courseId,
}: CourseDocumentFormProps) {
	const [open, setOpen] = useState(false);
	const { t } = useTranslation("admin");

	const courseDocumentSchema = z.object({
		title: z.string().trim().min(1),
		author: z.string().trim().min(1),
		category: z.enum([
			CategoryEnum.NOTES,
			CategoryEnum.SUMMARY,
			CategoryEnum.SOLUTIONS,
			CategoryEnum.OTHER,
		]),
		sub_category: z.string().optional(),
		file: z
			.instanceof(File)
			.refine(
				(file) => file.size <= MAX_DOC_FILE_SIZE_MB * 1024 * 1024,
				t("courses.course_documents.file_size_error", {
					size: MAX_DOC_FILE_SIZE_MB,
				}),
			)
			.refine(
				(file) => ALLOWED_DOC_FILE_TYPES.has(file.type),
				t("courses.course_documents.file_type_error"),
			),
	});

	const queryClient = useQueryClient();

	const categoryOptions: { value: CategoryEnumType; label: string }[] = [
		{
			value: CategoryEnum.NOTES,
			label: t("courses.course_documents.categories.notes"),
		},
		{
			value: CategoryEnum.SUMMARY,
			label: t("courses.course_documents.categories.summary"),
		},
		{
			value: CategoryEnum.SOLUTIONS,
			label: t("courses.course_documents.categories.solutions"),
		},
		{
			value: CategoryEnum.OTHER,
			label: t("courses.course_documents.categories.other"),
		},
	];

	const createCourseDocument = useMutation({
		...createCourseDocumentMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getAllDocumentsFromCourseQueryKey({
					path: { course_id: courseId },
				}),
			});
			toast.success(t("courses.course_documents.create_success"));
			setOpen(false);
		},
		onError: (error) => {
			toast.error(
				typeof error?.detail === "string"
					? error.detail
					: t("courses.course_documents.create_error"),
			);
			setOpen(false);
		},
	});

	function onSubmit(values: z.infer<typeof courseDocumentSchema>) {
		createCourseDocument.mutate({
			body: {
				title: values.title,
				author: values.author,
				category: values.category,
				sub_category: values.sub_category?.trim() ? values.sub_category : null,
				file: values.file,
				course_id: courseId,
			},
		});
	}

	return (
		<AdminForm
			title={t("courses.course_documents.create_document")}
			formType="add"
			gridCols={2}
			open={open}
			onOpenChange={setOpen}
			defaultValues={{
				title: "",
				author: "",
				category: CategoryEnum.OTHER,
				sub_category: "",
				file: undefined,
			}}
			inputFields={[
				{
					variant: "text",
					name: "title",
					label: t("courses.course_documents.title"),
					placeholder: t("courses.course_documents.title"),
					colSpan: 1,
				},
				{
					variant: "text",
					name: "author",
					label: t("courses.course_documents.author"),
					placeholder: t("courses.course_documents.author"),
					colSpan: 1,
				},
				{
					variant: "selectFromOptions",
					name: "category",
					label: t("courses.course_documents.category"),
					placeholder: t("courses.course_documents.select_category"),
					options: categoryOptions,
					colSpan: 1,
				},
				{
					variant: "text",
					name: "sub_category",
					label: t("courses.course_documents.sub_category"),
					placeholder: t("courses.course_documents.sub_category"),
					colSpan: 1,
				},
				{
					variant: "file",
					name: "file",
					label: t("courses.course_documents.file"),
					accept: ".pdf",
					colSpan: 2,
				},
			]}
			zodSchema={courseDocumentSchema}
			onSubmit={onSubmit}
		/>
	);
}
