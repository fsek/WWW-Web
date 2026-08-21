import { useState } from "react";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	mooseAdminCreateLevelMutation,
	mooseAdminGetAllLevelsQueryKey,
} from "@/api/@tanstack/react-query.gen";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import AdminForm from "@/widgets/AdminForm";
import { format } from "date-fns";
import EncodedGridHelpDialog from "./components/EncodedGridHelpDialog";

export default function EncloseMooseLevelForm() {
	const [open, setOpen] = useState(false);
	const { t } = useTranslation("admin");

	const encloseMooseLevelSchema = z.object({
		release_date: z.date({ error: t("enclose_moose.release_date_invalid") }),
		day_index: z
			.int({ error: t("enclose_moose.day_index_invalid") })
			.nullable()
			.optional(),
		name_sv: z
			.string({ error: t("enclose_moose.level_name_invalid") })
			.min(1, { error: t("enclose_moose.level_name_invalid") }),
		name_en: z
			.string({ error: t("enclose_moose.level_name_invalid") })
			.min(1, { error: t("enclose_moose.level_name_invalid") }),
		encoded_grid: z
			.string({ error: t("enclose_moose.encoded_grid_invalid") })
			.min(1, { error: t("enclose_moose.encoded_grid_invalid") }),
		wall_budget: z
			.int({ error: t("enclose_moose.wall_budget_invalid") })
			.min(0, { error: t("enclose_moose.wall_budget_invalid") }),
	});
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
		},
	});

	async function onSubmit(values: z.infer<typeof encloseMooseLevelSchema>) {
		await createLevel.mutateAsync({
			body: {
				name_sv: values.name_sv,
				name_en: values.name_en,
				day_index: values.day_index,
				release_date: format(values.release_date, "yyyy-MM-dd") as any,
				encoded_grid: values.encoded_grid
					.replace(/\\n/g, "\n")
					.replace(/^"+|"+$/g, ""),
				wall_budget: values.wall_budget,
			},
		});
	}

	return (
		<AdminForm
			title={t("enclose_moose.create_level")}
			formType="add"
			gridCols={2}
			open={open}
			onOpenChange={setOpen}
			inputFields={[
				{
					variant: "text",
					name: "name_sv",
					label: t("enclose_moose.level_name_sv"),
					placeholder: t("enclose_moose.level_name_sv_placeholder"),
				},
				{
					variant: "text",
					name: "name_en",
					label: t("enclose_moose.level_name_en"),
					placeholder: t("enclose_moose.level_name_en_placeholder"),
				},
				{
					variant: "datetime",
					name: "release_date",
					label: t("enclose_moose.release_date"),
					granularity: "day",
				},
				{
					variant: "number",
					name: "day_index",
					label: t("enclose_moose.day_index"),
					placeholder: t("enclose_moose.day_index_placeholder"),
				},
				{
					variant: "textarea",
					name: "encoded_grid",
					label: t("enclose_moose.encoded_grid"),
					placeholder: t("enclose_moose.encoded_grid_placeholder"),
					monospace: true,
					colSpan: 2,
					rows: 20,
				},
				{
					variant: "number",
					name: "wall_budget",
					label: t("enclose_moose.wall_budget"),
					placeholder: t("enclose_moose.wall_budget_placeholder"),
					min: 0,
				},
			]}
			customButtons={<EncodedGridHelpDialog />}
			zodSchema={encloseMooseLevelSchema}
			onSubmit={onSubmit}
		/>
	);
}
