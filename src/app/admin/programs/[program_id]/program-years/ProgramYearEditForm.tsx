import { useEffect, useState } from "react";
import { z } from "zod";
import {
	deleteProgramYearMutation,
	getAllCoursesOptions,
	getAllProgramYearsQueryKey,
	getProgramYearOptions,
	getProgramYearsByProgramQueryKey,
	updateProgramYearMutation,
} from "@/api/@tanstack/react-query.gen";
import {
	AssociationTypeEnum,
	type ProgramYearRead,
	type ProgramYearUpdate,
} from "@/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import AdminForm from "@/widgets/AdminForm";
import AssociatedImageManager from "@/components/AssociatedImageManager";

const MAX_PROGRAM_YEAR_TITLE = 100;
const MAX_PROGRAM_YEAR_DESC = 10000;

const programYearEditSchema = z.object({
	id: z.number(),
	program_id: z.number(),
	title_sv: z.string().trim().min(1).max(MAX_PROGRAM_YEAR_TITLE),
	title_en: z.string().trim().min(1).max(MAX_PROGRAM_YEAR_TITLE),
	description_sv: z.string().max(MAX_PROGRAM_YEAR_DESC).optional(),
	description_en: z.string().max(MAX_PROGRAM_YEAR_DESC).optional(),
	course_ids: z.array(z.number()).optional(),
});

interface ProgramEditFormProps {
	item: ProgramYearRead | null;
	onClose: () => void;
}

export default function ProgramEditForm({
	onClose,
	item,
}: ProgramEditFormProps) {
	const { t } = useTranslation("admin");
	const { data: allCourses = [] } = useQuery({
		...getAllCoursesOptions(),
		refetchOnWindowFocus: false,
	});

	const courseOptions = allCourses
		.map((course) => ({
			value: course.course_id,
			label: course.title,
		}))
		.sort((a, b) => a.label.localeCompare(b.label));

	const [convertedItem, setConvertedItem] = useState<z.infer<
		typeof programYearEditSchema
	> | null>(null);
	const [associatedImageId, setAssociatedImageId] = useState<number | null>(
		null,
	);

	useEffect(() => {
		if (item) {
			const convertedItem = {
				id: item.program_year_id,
				program_id: item.program_id,
				title_sv: item.title_sv,
				title_en: item.title_en,
				description_sv: item.description_sv ?? "",
				description_en: item.description_en ?? "",
				course_ids: (item.courses ?? []).map((course) => course.course_id),
			} as z.infer<typeof programYearEditSchema>;
			setConvertedItem(convertedItem);
			setAssociatedImageId(item.associated_img_id ?? null);
		} else {
			setAssociatedImageId(null);
		}
	}, [item]);

	const queryClient = useQueryClient();

	async function syncProgramYearAfterImageChange(programYearId: number) {
		try {
			const updatedProgramYear = await queryClient.fetchQuery({
				...getProgramYearOptions({ path: { program_year_id: programYearId } }),
			});

			setAssociatedImageId(updatedProgramYear.associated_img_id ?? null);

			queryClient.invalidateQueries({
				queryKey: getAllProgramYearsQueryKey(),
			});
			queryClient.invalidateQueries({
				queryKey: getProgramYearsByProgramQueryKey({
					path: { program_id: updatedProgramYear.program_id },
				}),
			});
		} catch {
			toast.error(t("admin:associated_image.sync_error"));
		}
	}

	const updateProgramYear = useMutation({
		...updateProgramYearMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getAllProgramYearsQueryKey(),
			});
			toast.success(t("program_years.edit_success"));
		},
		onError: (error) => {
			toast.error(
				typeof error?.detail === "string"
					? error.detail
					: t("program_years.edit_error"),
			);
			onClose();
		},
	});

	const removeProgramYear = useMutation({
		...deleteProgramYearMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getAllProgramYearsQueryKey(),
			});
			toast.success(t("program_years.remove_success"));
		},
		onError: (error) => {
			toast.error(
				typeof error?.detail === "string"
					? error.detail
					: t("program_years.remove_error"),
			);
			onClose();
		},
	});

	function handleFormSubmit(values: z.infer<typeof programYearEditSchema>) {
		const updatedProgramYear: ProgramYearUpdate = {
			title_sv: values.title_sv,
			title_en: values.title_en,
			program_id: values.program_id,
			description_sv: values.description_sv?.trim()
				? values.description_sv
				: null,
			description_en: values.description_en?.trim()
				? values.description_en
				: null,
			course_ids: values.course_ids ?? [],
		};

		updateProgramYear.mutate(
			{
				path: { program_year_id: values.id },
				body: updatedProgramYear,
			},
			{
				onSuccess: () => {
					onClose();
				},
			},
		);
	}

	function handleRemoveSubmit(data: z.infer<typeof programYearEditSchema>) {
		removeProgramYear.mutate(
			{ path: { program_year_id: data.id } },
			{
				onSuccess: () => {
					onClose();
				},
			},
		);
	}

	return (
		<AdminForm
			title={t("program_years.edit_program")}
			formType="edit"
			gridCols={4}
			open={!!item}
			onOpenChange={(isOpen) => {
				if (!isOpen) onClose();
			}}
			inputFields={[
				{
					variant: "text",
					name: "title_sv",
					label: t("program_years.title_sv"),
					placeholder: t("program_years.title_sv"),
					colSpan: 2,
				},
				{
					variant: "text",
					name: "title_en",
					label: t("program_years.title_en"),
					placeholder: t("program_years.title_en"),
					colSpan: 2,
				},
				{
					variant: "textarea",
					name: "description_sv",
					label: t("program_years.description_sv"),
					placeholder: t("program_years.description_sv"),
					rows: 8,
					colSpan: 2,
				},
				{
					variant: "textarea",
					name: "description_en",
					label: t("program_years.description_en"),
					placeholder: t("program_years.description_en"),
					rows: 8,
					colSpan: 2,
				},
				{
					variant: "styledMultiSelect",
					name: "course_ids",
					label: t("program_years.courses"),
					placeholder: t("program_years.select_courses"),
					options: courseOptions,
					colSpan: 4,
				},
			]}
			zodSchema={programYearEditSchema}
			onSubmit={handleFormSubmit}
			useDeleteButton
			onDelete={handleRemoveSubmit}
			showDialogButton={false}
			editItem={convertedItem || undefined}
			setEditItem={setConvertedItem}
			customButtons={
				<AssociatedImageManager
					associationType={AssociationTypeEnum.PROGRAM_YEAR}
					associationId={item?.program_year_id ?? null}
					associatedImageId={associatedImageId}
					onImageChanged={() => {
						if (!item?.program_year_id) {
							return;
						}

						void syncProgramYearAfterImageChange(item.program_year_id);
					}}
				/>
			}
			confirmDeleteDialogConfirmByTyping={true}
			confirmDeleteDialogConfirmByTypingKey={
				item?.title_sv || "Delete this program year"
			}
			requireConfirmationToDelete={true}
			confirmDeleteDialogTitle={t("program_years.confirm_remove")}
			confirmDeleteDialogDescription={t("program_years.confirm_remove_text")}
		/>
	);
}
