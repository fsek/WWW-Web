import { useEffect, useState } from "react";
import { z } from "zod";
import {
	deleteProgramMutation,
	getProgramOptions,
	getAllSpecialisationsOptions,
	getAllProgramsQueryKey,
	updateProgramMutation,
} from "@/api/@tanstack/react-query.gen";
import {
	AssociationTypeEnum,
	type ProgramRead,
	type ProgramUpdate,
} from "@/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import AdminForm from "@/widgets/AdminForm";
import AssociatedImageManager from "@/components/AssociatedImageManager";

const MAX_PROGRAM_TITLE = 100;
const MAX_PROGRAM_DESC = 10000;

const programEditSchema = z.object({
	id: z.number(),
	title_sv: z.string().trim().min(1).max(MAX_PROGRAM_TITLE),
	title_en: z.string().trim().min(1).max(MAX_PROGRAM_TITLE),
	description_sv: z.string().max(MAX_PROGRAM_DESC).optional(),
	description_en: z.string().max(MAX_PROGRAM_DESC).optional(),
	specialisation_ids: z.array(z.number()).optional(),
});

interface ProgramEditFormProps {
	item: ProgramRead | null;
	onClose: () => void;
}

export default function ProgramEditForm({
	onClose,
	item,
}: ProgramEditFormProps) {
	const { t, i18n } = useTranslation("admin");
	const { data: allSpecialisations = [] } = useQuery({
		...getAllSpecialisationsOptions(),
		refetchOnWindowFocus: false,
	});

	const specialisationOptions = allSpecialisations
		.map((specialisation) => ({
			value: specialisation.specialisation_id,
			label:
				i18n.language === "sv"
					? specialisation.title_sv
					: specialisation.title_en,
		}))
		.sort((a, b) => a.label.localeCompare(b.label, i18n.language));

	const [convertedItem, setConvertedItem] = useState<z.infer<
		typeof programEditSchema
	> | null>(null);
	const [associatedImageId, setAssociatedImageId] = useState<number | null>(
		null,
	);

	useEffect(() => {
		if (item) {
			const convertedItem = {
				id: item.program_id,
				title_sv: item.title_sv,
				title_en: item.title_en,
				description_sv: item.description_sv ?? "",
				description_en: item.description_en ?? "",
				specialisation_ids: (item.specialisations ?? []).map(
					(specialisation) => specialisation.specialisation_id,
				),
			} as z.infer<typeof programEditSchema>;
			setConvertedItem(convertedItem);
			setAssociatedImageId(item.associated_img_id ?? null);
		} else {
			setAssociatedImageId(null);
		}
	}, [item]);

	const queryClient = useQueryClient();

	async function syncProgramAfterImageChange(programId: number) {
		try {
			const updatedProgram = await queryClient.fetchQuery({
				...getProgramOptions({ path: { program_id: programId } }),
			});

			setAssociatedImageId(updatedProgram.associated_img_id ?? null);

			queryClient.invalidateQueries({
				queryKey: getAllProgramsQueryKey(),
			});
		} catch {
			toast.error(t("admin:associated_image.sync_error"));
		}
	}

	const updateProgram = useMutation({
		...updateProgramMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getAllProgramsQueryKey(),
			});
			toast.success(t("programs.edit_success"));
		},
		onError: (error) => {
			toast.error(
				typeof error?.detail === "string"
					? error.detail
					: t("programs.edit_error"),
			);
			onClose();
		},
	});

	const removeProgram = useMutation({
		...deleteProgramMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getAllProgramsQueryKey(),
			});
			toast.success(t("programs.remove_success"));
		},
		onError: (error) => {
			toast.error(
				typeof error?.detail === "string"
					? error.detail
					: t("programs.remove_error"),
			);
			onClose();
		},
	});

	function handleFormSubmit(values: z.infer<typeof programEditSchema>) {
		const updatedProgram: ProgramUpdate = {
			title_sv: values.title_sv,
			title_en: values.title_en,
			description_sv: values.description_sv?.trim()
				? values.description_sv
				: null,
			description_en: values.description_en?.trim()
				? values.description_en
				: null,
			specialisation_ids: values.specialisation_ids ?? [],
		};

		updateProgram.mutate(
			{
				path: { program_id: values.id },
				body: updatedProgram,
			},
			{
				onSuccess: () => {
					onClose();
				},
			},
		);
	}

	function handleRemoveSubmit(data: z.infer<typeof programEditSchema>) {
		removeProgram.mutate(
			{ path: { program_id: data.id } },
			{
				onSuccess: () => {
					onClose();
				},
			},
		);
	}

	return (
		<AdminForm
			title={t("programs.edit_program")}
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
					label: t("title_sv"),
					placeholder: t("title_sv"),
					colSpan: 2,
				},
				{
					variant: "text",
					name: "title_en",
					label: t("title_en"),
					placeholder: t("title_en"),
					colSpan: 2,
				},
				{
					variant: "textarea",
					name: "description_sv",
					label: t("description_sv"),
					placeholder: t("description_sv"),
					rows: 8,
					colSpan: 2,
				},
				{
					variant: "textarea",
					name: "description_en",
					label: t("description_en"),
					placeholder: t("description_en"),
					rows: 8,
					colSpan: 2,
				},
				{
					variant: "styledMultiSelect",
					name: "specialisation_ids",
					label: t("programs.specialisations"),
					placeholder: t("programs.select_specialisations"),
					options: specialisationOptions,
					colSpan: 4,
				},
			]}
			zodSchema={programEditSchema}
			onSubmit={handleFormSubmit}
			useDeleteButton
			onDelete={handleRemoveSubmit}
			showDialogButton={false}
			editItem={convertedItem || undefined}
			setEditItem={setConvertedItem}
			customButtons={
				<AssociatedImageManager
					associationType={AssociationTypeEnum.PROGRAM}
					associationId={item?.program_id ?? null}
					associatedImageId={associatedImageId}
					onImageChanged={() => {
						if (!item?.program_id) {
							return;
						}

						void syncProgramAfterImageChange(item.program_id);
					}}
					addButtonText={t("programs.add_program_image")}
				/>
			}
			confirmDeleteDialogConfirmByTyping={true}
			confirmDeleteDialogConfirmByTypingKey={
				item?.title_sv || "Delete this program"
			}
			requireConfirmationToDelete={true}
			confirmDeleteDialogTitle={t("programs.confirm_remove")}
			confirmDeleteDialogDescription={t("programs.confirm_remove_text")}
		/>
	);
}
