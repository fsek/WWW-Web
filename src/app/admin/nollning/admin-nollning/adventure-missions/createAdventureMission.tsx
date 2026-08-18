import {
	createAdventureMissionMutation,
	getNollningQueryKey,
} from "@/api/@tanstack/react-query.gen";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import AdminForm from "@/widgets/AdminForm";
import { MISSION_CATEGORY_ENUM } from "@/constants";

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
	nollningID: number;
}

const CreateAdventureMission = ({ nollningID }: Props) => {
	const [open, setOpen] = useState(false);
	const { t } = useTranslation("admin");

	const queryClient = useQueryClient();

	const createAdventureMission = useMutation({
		...createAdventureMissionMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getNollningQueryKey({
					path: { nollning_id: nollningID },
				}),
			});
			toast.success(t("nollning.missions.create_success"));
			setOpen(false);
		},
		onError: () => {
			toast.error(t("nollning.missions.create_error"));
			setOpen(false);
		},
	});

	function onSubmit(values: z.infer<typeof AdventureMissionSchema>) {
		createAdventureMission.mutate({
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
			path: { nollning_id: nollningID },
		});
	}

	return (
		<AdminForm
			title={t("nollning.missions.create_title")}
			formType="add"
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
			onSubmit={onSubmit}
			showDialogButton
			dialogButtonText={t("nollning.missions.create_button")}
			defaultValues={{
				title_sv: "",
				title_en: "",
				description_sv: "",
				description_en: "",
				max_points: 1,
				min_points: 0,
				nollning_week: 0,
				unlock_code: "",
				unlock_hint_sv: "",
				unlock_hint_en: "",
				mission_category: MISSION_CATEGORY_ENUM.GAME, // Matches backend default
			}}
		/>
	);
};

export default CreateAdventureMission;
