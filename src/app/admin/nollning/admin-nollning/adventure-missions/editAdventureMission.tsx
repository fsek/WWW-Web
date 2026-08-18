import type { AdventureMissionRead } from "@/api";
import {
	deleteAdventureMissionMutation,
	editAdventureMissionMutation,
	getNollningByYearQueryKey,
	getNollningQueryKey,
} from "@/api/@tanstack/react-query.gen";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import AdminForm from "@/widgets/AdminForm";
import { useMemo } from "react";
import { MISSION_CATEGORY_ENUM, type MissionCategory } from "@/constants";

const AdventureMissionSchema = z.object({
	title_sv: z.string().min(2),
	title_en: z.string().min(2),
	description_sv: z.string().min(2),
	description_en: z.string().min(2),
	max_points: z.number().min(1),
	min_points: z.number().min(0),
	nollning_week: z.number().min(0).max(4),
	unlock_code: z.string().optional(),
	unlock_hint_sv: z.string().optional(),
	unlock_hint_en: z.string().optional(),
	mission_category: z.enum(Object.values(MISSION_CATEGORY_ENUM)),
});

interface Props {
	open: boolean;
	setOpen: (open: boolean) => void;
	onClose: () => void;
	selectedMission: AdventureMissionRead;
	setSelectedMission: (mission: AdventureMissionRead | null) => void;
	nollning_id: number;
}

const EditAdventureMission = ({
	open,
	setOpen,
	onClose,
	selectedMission,
	setSelectedMission,
	nollning_id,
}: Props) => {
	const { t } = useTranslation("admin");
	const cleanedSelectedMission = useMemo(
		() => ({
			...selectedMission,
			unlock_code: selectedMission.unlock_code ?? "",
			unlock_hint_sv: selectedMission.unlock_hint_sv ?? "",
			unlock_hint_en: selectedMission.unlock_hint_en ?? "",
			mission_category: Object.values(MISSION_CATEGORY_ENUM).includes(
				selectedMission.mission_category as MissionCategory,
			) // If the mission category is not valid, default to "Spel"
				? (selectedMission.mission_category as MissionCategory)
				: MISSION_CATEGORY_ENUM.GAME,
		}),
		[selectedMission],
	);

	function setConvertedItem(
		item: z.infer<typeof AdventureMissionSchema> | null,
	) {
		setSelectedMission(item ? { ...selectedMission, ...item } : null);
	}

	const queryClient = useQueryClient();

	const updateAdventureMission = useMutation({
		...editAdventureMissionMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getNollningQueryKey({
					path: { nollning_id: nollning_id },
				}),
			});
			queryClient.invalidateQueries({
				queryKey: getNollningByYearQueryKey({
					path: { year: new Date().getFullYear() },
				}),
			});
			toast.success(t("nollning.missions.edit_success"));
		},
		onError: () => {
			toast.error(t("nollning.missions.edit_error"));
			onClose();
		},
	});

	const removeAdventureMission = useMutation({
		...deleteAdventureMissionMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getNollningQueryKey({
					path: { nollning_id: nollning_id },
				}),
			});
			queryClient.invalidateQueries({
				queryKey: getNollningByYearQueryKey({
					path: { year: new Date().getFullYear() },
				}),
			});
			toast.success(t("nollning.missions.delete_success"));
		},
		onError: () => {
			toast.error(t("nollning.missions.delete_error"));
			onClose();
		},
	});

	function onSubmit(values: z.infer<typeof AdventureMissionSchema>) {
		updateAdventureMission.mutate(
			{
				path: { mission_id: selectedMission.id },
				body: {
					title_sv: values.title_sv,
					title_en: values.title_en,
					description_sv: values.description_sv,
					description_en: values.description_en,
					max_points: values.max_points,
					min_points: values.min_points,
					nollning_week: values.nollning_week,
					unlock_code: values.unlock_code,
					unlock_hint_sv: values.unlock_hint_sv,
					unlock_hint_en: values.unlock_hint_en,
					mission_category: values.mission_category,
				},
			},
			{
				onSuccess: () => {
					onClose();
				},
			},
		);
	}

	function onDelete() {
		removeAdventureMission.mutate(
			{
				path: { mission_id: selectedMission.id },
				query: { nollning_id: nollning_id },
			},
			{
				onSuccess: () => {
					onClose();
				},
			},
		);
	}

	return (
		<AdminForm
			title={t("nollning.missions.edit_title")}
			formType="edit"
			gridCols={2}
			open={open}
			onOpenChange={setOpen}
			inputFields={[
				{
					variant: "text",
					name: "title_sv",
					label: t("nollning.missions.title_sv"),
					placeholder: t("nollning.missions.title_placeholder"),
				},
				{
					variant: "text",
					name: "title_en",
					label: t("nollning.missions.title_en"),
					placeholder: t("nollning.missions.title_placeholder"),
				},
				{
					variant: "textarea",
					name: "description_sv",
					label: t("nollning.missions.description_sv"),
					placeholder: t("nollning.missions.description_placeholder"),
				},
				{
					variant: "textarea",
					name: "description_en",
					label: t("nollning.missions.description_en"),
					placeholder: t("nollning.missions.description_placeholder"),
				},
				{
					variant: "number",
					name: "min_points",
					label: t("nollning.missions.min_points"),
					placeholder: "0",
				},
				{
					variant: "number",
					name: "max_points",
					label: t("nollning.missions.max_points"),
					placeholder: "1",
				},
				{
					variant: "number",
					name: "nollning_week",
					label: t("nollning.missions.week"),
					placeholder: "0",
				},
				{
					variant: "text",
					name: "unlock_code",
					label: t("nollning.missions.unlock_code"),
					placeholder: t("nollning.missions.unlock_code_placeholder"),
				},
				{
					variant: "text",
					name: "unlock_hint_sv",
					label: t("nollning.missions.unlock_hint_sv"),
					placeholder: t("nollning.missions.unlock_hint_placeholder"),
				},
				{
					variant: "text",
					name: "unlock_hint_en",
					label: t("nollning.missions.unlock_hint_en"),
					placeholder: t("nollning.missions.unlock_hint_placeholder"),
				},
				{
					variant: "selectFromOptions",
					name: "mission_category",
					label: t("nollning.missions.mission_category"),
					placeholder: t("nollning.missions.mission_category_placeholder"),
					options: Object.values(MISSION_CATEGORY_ENUM).map((value) => ({
						value,
						label: value,
					})),
				},
			]}
			zodSchema={AdventureMissionSchema}
			showDialogButton={false}
			onSubmit={onSubmit}
			onDelete={onDelete}
			useDeleteButton
			editItem={cleanedSelectedMission}
			setEditItem={setConvertedItem}
		/>
	);
};

export default EditAdventureMission;
