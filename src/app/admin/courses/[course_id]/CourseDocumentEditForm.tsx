import { useEffect, useState } from "react";
import { z } from "zod";
import {
	deleteCourseDocumentMutation,
	getAllDocumentsFromCourseQueryKey,
	updateCourseDocumentMutation,
} from "@/api/@tanstack/react-query.gen";
import { CategoryEnum, type CategoryEnum as CategoryEnumType } from "@/api";
import type { CourseDocumentRead, CourseDocumentUpdate } from "@/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import AdminForm from "@/widgets/AdminForm";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { buildCourseDocumentFileHref } from "@/utils/pluggHrefBuilders";

const courseDocumentEditSchema = z.object({
	id: z.number(),
	course_id: z.number(),
	title: z.string().trim().min(1),
	author: z.string().trim().min(1),
	category: z.enum([
		CategoryEnum.NOTES,
		CategoryEnum.SUMMARY,
		CategoryEnum.SOLUTIONS,
		CategoryEnum.OTHER,
	]),
	sub_category: z.string().optional(),
});

interface CourseEditFormProps {
	item: CourseDocumentRead | null;
	onClose: () => void;
}

export default function CourseEditForm({ onClose, item }: CourseEditFormProps) {
	const { t } = useTranslation("admin");

	function openCourseDocument(courseDocumentId: number) {
		window.open(
			buildCourseDocumentFileHref(courseDocumentId),
			"_blank",
			"noopener,noreferrer",
		);
	}

	const [convertedItem, setConvertedItem] = useState<z.infer<
		typeof courseDocumentEditSchema
	> | null>(null);

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

	useEffect(() => {
		if (item) {
			const convertedItem = {
				id: item.course_document_id,
				course_id: item.course_id,
				title: item.title,
				author: item.author,
				category: item.category,
				sub_category: item.sub_category ?? "",
			} as z.infer<typeof courseDocumentEditSchema>;
			setConvertedItem(convertedItem);
		}
	}, [item]);

	const queryClient = useQueryClient();

	const updateCourseDocument = useMutation({
		...updateCourseDocumentMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getAllDocumentsFromCourseQueryKey({
					path: { course_id: item?.course_id ?? convertedItem?.course_id ?? 0 },
				}),
			});
			toast.success(t("courses.course_documents.edit_success"));
		},
		onError: (error) => {
			toast.error(
				typeof error?.detail === "string"
					? error.detail
					: t("courses.course_documents.edit_error"),
			);
			onClose();
		},
	});

	const removeCourseDocument = useMutation({
		...deleteCourseDocumentMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getAllDocumentsFromCourseQueryKey({
					path: { course_id: item?.course_id ?? convertedItem?.course_id ?? 0 },
				}),
			});
			toast.success(t("courses.course_documents.remove_success"));
		},
		onError: (error) => {
			toast.error(
				typeof error?.detail === "string"
					? error.detail
					: t("courses.course_documents.remove_error"),
			);
			onClose();
		},
	});

	function handleFormSubmit(values: z.infer<typeof courseDocumentEditSchema>) {
		const updatedCourseDocument: CourseDocumentUpdate = {
			title: values.title,
			author: values.author,
			category: values.category,
			sub_category: values.sub_category?.trim() ? values.sub_category : null,
		};

		updateCourseDocument.mutate(
			{
				path: { course_document_id: values.id },
				body: updatedCourseDocument,
			},
			{
				onSuccess: () => {
					onClose();
				},
			},
		);
	}

	function handleRemoveSubmit(data: z.infer<typeof courseDocumentEditSchema>) {
		removeCourseDocument.mutate(
			{ path: { course_document_id: data.id } },
			{
				onSuccess: () => {
					onClose();
				},
			},
		);
	}

	return (
		<AdminForm
			title={t("courses.course_documents.edit_document")}
			formType="edit"
			gridCols={2}
			open={!!item}
			onOpenChange={(isOpen) => {
				if (!isOpen) onClose();
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
			]}
			zodSchema={courseDocumentEditSchema}
			onSubmit={handleFormSubmit}
			useDeleteButton
			onDelete={handleRemoveSubmit}
			showDialogButton={false}
			editItem={convertedItem || undefined}
			setEditItem={setConvertedItem}
			customButtons={
				<Button
					type="button"
					variant="secondary"
					onClick={() => {
						if (!item) return;
						openCourseDocument(item.course_document_id);
					}}
				>
					<ExternalLink />
					{t("courses.course_documents.open_document")}
				</Button>
			}
			requireConfirmationToDelete={true}
			confirmDeleteDialogTitle={t("courses.course_documents.confirm_remove")}
			confirmDeleteDialogDescription={t(
				"courses.course_documents.confirm_remove_text",
			)}
		/>
	);
}
