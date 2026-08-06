import { useState } from "react";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createSongMutation,
	getAllSongsQueryKey,
	getAllSongCategoriesOptions,
	mooseAdminCreateLevelMutation,
	mooseAdminGetAllLevelsQueryKey,
} from "@/api/@tanstack/react-query.gen";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import AdminForm from "@/widgets/AdminForm";

const encloseMooseLevelSchema = z.object({
	level_id: z.string(),
	release_date: z.date(),
	day_index: z.int().optional(),
	name: z.string(),
	encoded_grid: z.string(),
	wall_budget: z.int(),
});

export default function EncloseMooseLevelForm() {
	const [open, setOpen] = useState(false);
	const { t } = useTranslation("admin");

	const queryClient = useQueryClient();

	const createLevel = useMutation({
		...mooseAdminCreateLevelMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: mooseAdminGetAllLevelsQueryKey(),
			});
			toast.success(t("enclose_moose.create_level_success"));
			setOpen(false);
		},
		onError: (error) => {
			toast.error(
				typeof error?.detail === "string"
					? error.detail
					: t("enclose_moose.create_level_error"),
			);
			setOpen(false);
		},
	});

	function onSubmit(values: z.infer<typeof encloseMooseLevelSchema>) {
		createLevel.mutate({
			body: {
				level_id: values.level_id,
				name: values.name,
				day_index: values.day_index,
				release_date: values.release_date,
				encoded_grid: values.encoded_grid,
				wall_budget: values.wall_budget,
			},
		});
	}

	return (
		<AdminForm
			title={t("enclose_moose.create_level")}
			formType="add"
			gridCols={4}
			open={open}
			onOpenChange={setOpen}
			inputFields={[
				{
					variant: "text",
					name: "name",
					label: t("enclose_moose.name"),
					placeholder: t("enclose_moose.name_placeholder"),
				},
			]}
			zodSchema={encloseMooseLevelSchema}
			onSubmit={onSubmit}
		/>
	);
}
