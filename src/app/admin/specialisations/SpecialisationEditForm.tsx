import { useEffect, useState } from "react";
import { z } from "zod";
import {
	deleteSpecialisationMutation,
	getAllCoursesOptions,
	getAllSpecialisationsQueryKey,
	getSpecialisationOptions,
	getSpecialisationsByProgramQueryKey,
	updateSpecialisationMutation,
} from "@/api/@tanstack/react-query.gen";
import {
	AssociationTypeEnum,
	type SpecialisationRead,
	type SpecialisationUpdate,
} from "@/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import AdminForm from "@/widgets/AdminForm";
import AssociatedImageManager from "@/components/AssociatedImageManager";

const MAX_SPECIALISATION_TITLE = 100;
const MAX_SPECIALISATION_DESC = 10000;

const specialisationEditSchema = z.object({
	id: z.number(),
	title_sv: z.string().trim().min(1).max(MAX_SPECIALISATION_TITLE),
	title_en: z.string().trim().min(1).max(MAX_SPECIALISATION_TITLE),
	description_sv: z.string().max(MAX_SPECIALISATION_DESC).optional(),
	description_en: z.string().max(MAX_SPECIALISATION_DESC).optional(),
	course_ids: z.array(z.number()).optional(),
});

interface SpecialisationEditFormProps {
	item: SpecialisationRead | null;
	onClose: () => void;
}

export default function SpecialisationEditForm({
	onClose,
	item,
}: SpecialisationEditFormProps) {
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
		typeof specialisationEditSchema
	> | null>(null);
	const [associatedImageId, setAssociatedImageId] = useState<number | null>(
		null,
	);

	useEffect(() => {
		if (item) {
			const convertedItem = {
				id: item.specialisation_id,
				title_sv: item.title_sv,
				title_en: item.title_en,
				description_sv: item.description_sv ?? "",
				description_en: item.description_en ?? "",
				course_ids: (item.courses ?? []).map((course) => course.course_id),
			} as z.infer<typeof specialisationEditSchema>;
			setConvertedItem(convertedItem);
			setAssociatedImageId(item.associated_img_id ?? null);
		} else {
			setAssociatedImageId(null);
		}
	}, [item]);

	const queryClient = useQueryClient();

	async function syncSpecialisationAfterImageChange(specialisationId: number) {
		try {
			const updatedSpecialisation = await queryClient.fetchQuery({
				...getSpecialisationOptions({
					path: { specialisation_id: specialisationId },
				}),
			});

			setAssociatedImageId(updatedSpecialisation.associated_img_id ?? null);

			queryClient.invalidateQueries({
				queryKey: getAllSpecialisationsQueryKey(),
			});
			invalidateSpecialisationsByProgramQueries(item?.programs);
			invalidateSpecialisationsByProgramQueries(updatedSpecialisation.programs);
		} catch {
			toast.error(t("admin:associated_image.sync_error"));
		}
	}

	function invalidateSpecialisationsByProgramQueries(
		programs: SpecialisationRead["programs"] | undefined,
	) {
		// This only invalidates programs that are actually associated with the specialisation,
		// not all of them (at least in the way it's currently called).
		const programIds = new Set(
			(programs ?? []).map((program) => program.program_id),
		);

		for (const programId of programIds) {
			queryClient.invalidateQueries({
				queryKey: getSpecialisationsByProgramQueryKey({
					path: { program_id: programId },
				}),
			});
		}
	}

	const updateSpecialisation = useMutation({
		...updateSpecialisationMutation(),
		throwOnError: false,
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: getAllSpecialisationsQueryKey(),
			});
			invalidateSpecialisationsByProgramQueries(
				data?.programs ?? item?.programs,
			);
			toast.success(t("specialisations.edit_success"));
		},
		onError: (error) => {
			toast.error(
				typeof error?.detail === "string"
					? error.detail
					: t("specialisations.edit_error"),
			);
			onClose();
		},
	});

	const removeSpecialisation = useMutation({
		...deleteSpecialisationMutation(),
		throwOnError: false,
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: getAllSpecialisationsQueryKey(),
			});
			invalidateSpecialisationsByProgramQueries(
				data?.programs ?? item?.programs,
			);
			toast.success(t("specialisations.remove_success"));
		},
		onError: (error) => {
			toast.error(
				typeof error?.detail === "string"
					? error.detail
					: t("specialisations.remove_error"),
			);
			onClose();
		},
	});

	function handleFormSubmit(values: z.infer<typeof specialisationEditSchema>) {
		const updatedSpecialisation: SpecialisationUpdate = {
			title_sv: values.title_sv,
			title_en: values.title_en,
			description_sv: values.description_sv?.trim()
				? values.description_sv
				: null,
			description_en: values.description_en?.trim()
				? values.description_en
				: null,
			course_ids: values.course_ids ?? [],
		};

		updateSpecialisation.mutate(
			{
				path: { specialisation_id: values.id },
				body: updatedSpecialisation,
			},
			{
				onSuccess: () => {
					onClose();
				},
			},
		);
	}

	function handleRemoveSubmit(data: z.infer<typeof specialisationEditSchema>) {
		removeSpecialisation.mutate(
			{ path: { specialisation_id: data.id } },
			{
				onSuccess: () => {
					onClose();
				},
			},
		);
	}

	return (
		<AdminForm
			title={t("specialisations.edit_specialisation")}
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
					label: t("specialisations.title_sv"),
					placeholder: t("specialisations.title_sv"),
					colSpan: 2,
				},
				{
					variant: "text",
					name: "title_en",
					label: t("specialisations.title_en"),
					placeholder: t("specialisations.title_en"),
					colSpan: 2,
				},
				{
					variant: "textarea",
					name: "description_sv",
					label: t("specialisations.description_sv"),
					placeholder: t("specialisations.description_sv"),
					rows: 8,
					colSpan: 2,
				},
				{
					variant: "textarea",
					name: "description_en",
					label: t("specialisations.description_en"),
					placeholder: t("specialisations.description_en"),
					rows: 8,
					colSpan: 2,
				},
				{
					variant: "styledMultiSelect",
					name: "course_ids",
					label: t("specialisations.courses"),
					placeholder: t("specialisations.select_courses"),
					options: courseOptions,
					colSpan: 4,
				},
			]}
			zodSchema={specialisationEditSchema}
			onSubmit={handleFormSubmit}
			useDeleteButton
			onDelete={handleRemoveSubmit}
			showDialogButton={false}
			editItem={convertedItem || undefined}
			setEditItem={setConvertedItem}
			customButtons={
				<AssociatedImageManager
					associationType={AssociationTypeEnum.SPECIALISATION}
					associationId={item?.specialisation_id ?? null}
					associatedImageId={associatedImageId}
					onImageChanged={() => {
						if (!item?.specialisation_id) {
							return;
						}

						void syncSpecialisationAfterImageChange(item.specialisation_id);
					}}
				/>
			}
			confirmDeleteDialogConfirmByTyping={true}
			confirmDeleteDialogConfirmByTypingKey={
				item?.title_sv || "Delete this specialisation"
			}
			requireConfirmationToDelete={true}
			confirmDeleteDialogTitle={t("specialisations.confirm_remove")}
			confirmDeleteDialogDescription={t("specialisations.confirm_remove_text")}
		/>
	);
}
