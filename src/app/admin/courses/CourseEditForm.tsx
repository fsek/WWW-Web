import { useEffect, useState } from "react";
import { z } from "zod";
import {
	deleteCourseMutation,
	getAllCoursesQueryKey,
	getCourseOptions,
	updateCourseMutation,
	getCoursesByProgramYearQueryKey,
	getCoursesBySpecialisationQueryKey,
} from "@/api/@tanstack/react-query.gen";
import { AssociationTypeEnum, type CourseRead, type CourseUpdate } from "@/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import AdminForm from "@/widgets/AdminForm";
import AssociatedImageManager from "@/components/AssociatedImageManager";

const MAX_COURSE_TITLE = 200;
const MAX_COURSE_CODE = 100;
const MAX_COURSE_DESC = 10000;

const courseEditSchema = z.object({
	id: z.number(),
	title: z.string().trim().min(1).max(MAX_COURSE_TITLE),
	course_code: z.string().max(MAX_COURSE_CODE).min(1),
	short_identifier: z.string().max(MAX_COURSE_TITLE).optional(),
	description: z.string().max(MAX_COURSE_DESC).optional(),
});

interface CourseEditFormProps {
	item: CourseRead | null;
	onClose: () => void;
}

export default function CourseEditForm({ onClose, item }: CourseEditFormProps) {
	const { t } = useTranslation("admin");

	const [convertedItem, setConvertedItem] = useState<z.infer<
		typeof courseEditSchema
	> | null>(null);
	const [associatedImageId, setAssociatedImageId] = useState<number | null>(
		null,
	);

	useEffect(() => {
		if (item) {
			const convertedItem = {
				id: item.course_id,
				title: item.title,
				course_code: item.course_code,
				short_identifier: item.short_identifier ?? "",
				description: item.description ?? "",
			} as z.infer<typeof courseEditSchema>;
			setConvertedItem(convertedItem);
			setAssociatedImageId(item.associated_img_id ?? null);
		} else {
			setAssociatedImageId(null);
		}
	}, [item]);

	const queryClient = useQueryClient();

	async function syncCourseAfterImageChange(courseId: number) {
		try {
			const updatedCourse = await queryClient.fetchQuery({
				...getCourseOptions({ path: { course_id: courseId } }),
			});

			setAssociatedImageId(updatedCourse.associated_img_id ?? null);

			queryClient.invalidateQueries({
				queryKey: getAllCoursesQueryKey(),
			});
			invalidateCourseQueries(item?.program_years, item?.specialisations);
			invalidateCourseQueries(
				updatedCourse.program_years,
				updatedCourse.specialisations,
			);
		} catch {
			toast.error(t("admin:associated_image.sync_error"));
		}
	}

	function invalidateCourseQueries(
		programYears: CourseRead["program_years"] = [],
		specialisations: CourseRead["specialisations"] = [],
	) {
		// This only invalidates the program years and specialisations that are related to the course,
		// not all the program years and specialisations.
		const programYearIds = new Set(
			programYears.map((py) => py.program_year_id),
		);
		const specialisationIds = new Set(
			specialisations.map((s) => s.specialisation_id),
		);

		for (const programYearId of programYearIds) {
			queryClient.invalidateQueries({
				queryKey: getCoursesByProgramYearQueryKey({
					path: { program_year_id: programYearId },
				}),
			});
		}

		for (const specialisationId of specialisationIds) {
			queryClient.invalidateQueries({
				queryKey: getCoursesBySpecialisationQueryKey({
					path: { specialisation_id: specialisationId },
				}),
			});
		}
	}

	const updateCourse = useMutation({
		...updateCourseMutation(),
		throwOnError: false,
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: getAllCoursesQueryKey(),
			});
			invalidateCourseQueries(item?.program_years, item?.specialisations);
			invalidateCourseQueries(data?.program_years, data?.specialisations);
			toast.success(t("courses.edit_success"));
		},
		onError: (error) => {
			toast.error(
				typeof error?.detail === "string"
					? error.detail
					: t("courses.edit_error"),
			);
			onClose();
		},
	});

	const removeCourse = useMutation({
		...deleteCourseMutation(),
		throwOnError: false,
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: getAllCoursesQueryKey(),
			});
			invalidateCourseQueries(item?.program_years, item?.specialisations);
			invalidateCourseQueries(data?.program_years, data?.specialisations);
			toast.success(t("courses.remove_success"));
		},
		onError: (error) => {
			toast.error(
				typeof error?.detail === "string"
					? error.detail
					: t("courses.remove_error"),
			);
			onClose();
		},
	});

	function handleFormSubmit(values: z.infer<typeof courseEditSchema>) {
		const updatedCourse: CourseUpdate = {
			title: values.title,
			course_code: values.course_code,
			short_identifier: values.short_identifier?.trim()
				? values.short_identifier
				: null,
			description: values.description?.trim() ? values.description : null,
		};

		updateCourse.mutate(
			{
				path: { course_id: values.id },
				body: updatedCourse,
			},
			{
				onSuccess: () => {
					onClose();
				},
			},
		);
	}

	function handleRemoveSubmit(data: z.infer<typeof courseEditSchema>) {
		removeCourse.mutate(
			{ path: { course_id: data.id } },
			{
				onSuccess: () => {
					onClose();
				},
			},
		);
	}

	return (
		<AdminForm
			title={t("courses.edit_course")}
			formType="edit"
			gridCols={3}
			open={!!item}
			onOpenChange={(isOpen) => {
				if (!isOpen) onClose();
			}}
			inputFields={[
				{
					variant: "text",
					name: "title",
					label: t("courses.title"),
					placeholder: t("courses.title"),
					colSpan: 1,
				},
				{
					variant: "text",
					name: "course_code",
					label: t("courses.course_code"),
					placeholder: t("courses.course_code"),
					colSpan: 1,
				},
				{
					variant: "text",
					name: "short_identifier",
					label: t("courses.short_identifier"),
					placeholder: t("courses.short_identifier_placeholder"),
					colSpan: 1,
				},
				{
					variant: "textarea",
					name: "description",
					label: t("courses.description"),
					placeholder: t("courses.description"),
					rows: 8,
					colSpan: 3,
				},
			]}
			zodSchema={courseEditSchema}
			onSubmit={handleFormSubmit}
			useDeleteButton
			onDelete={handleRemoveSubmit}
			showDialogButton={false}
			editItem={convertedItem || undefined}
			setEditItem={setConvertedItem}
			customButtons={
				<AssociatedImageManager
					associationType={AssociationTypeEnum.COURSE}
					associationId={item?.course_id ?? null}
					associatedImageId={associatedImageId}
					onImageChanged={() => {
						if (!item?.course_id) {
							return;
						}

						void syncCourseAfterImageChange(item.course_id);
					}}
				/>
			}
			requireConfirmationToDelete={true}
			confirmDeleteDialogTitle={t("courses.confirm_remove")}
			confirmDeleteDialogDescription={t("courses.confirm_remove_text")}
		/>
	);
}
