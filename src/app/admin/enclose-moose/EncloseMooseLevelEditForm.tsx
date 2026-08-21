import { useEffect, useState } from "react";
import { z } from "zod";
import {
	mooseAdminGetAllLevelsQueryKey,
	mooseAdminUpdateLevelMutation,
	mooseAdminDeleteLevelMutation,
} from "@/api/@tanstack/react-query.gen";
import type { EncloseMooseLevelRead, EncloseMooseLevelUpdate } from "@/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import AdminForm from "@/widgets/AdminForm";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface EncloseMooseLevelEditFormProps {
	item: EncloseMooseLevelRead | null;
	onClose: () => void;
}

export default function EncloseMooseLevelEditForm({
	onClose,
	item,
}: EncloseMooseLevelEditFormProps) {
	const { t } = useTranslation("admin");
	const router = useRouter();

	const encloseMooseLevelEditSchema = z.object({
		level_id: z.int(),
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

	// Convert item to the zod schema format (category_id instead of category object)
	const [convertedItem, setConvertedItem] = useState<z.infer<
		typeof encloseMooseLevelEditSchema
	> | null>(null);
	// biome-ignore lint/correctness/useExhaustiveDependencies: we don't care if convertedItem changes
	useEffect(() => {
		if (item) {
			const convertedItem = {
				...item,
			} as z.infer<typeof encloseMooseLevelEditSchema>;
			setConvertedItem(convertedItem);
		}
	}, [item]);

	const queryClient = useQueryClient();

	const updateLevel = useMutation({
		...mooseAdminUpdateLevelMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: mooseAdminGetAllLevelsQueryKey(),
			});
			toast.success(t("enclose_moose.edit_success"));
		},
		onError: (error) => {
			toast.error(
				typeof error?.detail === "string"
					? error.detail
					: t("enclose_moose.edit_error"),
			);
			onClose();
		},
	});

	const removeLevel = useMutation({
		...mooseAdminDeleteLevelMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: mooseAdminGetAllLevelsQueryKey(),
			});
			toast.success(t("enclose_moose.remove_success"));
		},
		onError: (error) => {
			toast.error(
				typeof error?.detail === "string"
					? error.detail
					: t("enclose_moose.remove_error"),
			);
			onClose();
		},
	});

	function handleFormSubmit(
		values: z.infer<typeof encloseMooseLevelEditSchema>,
	) {
		const updatedLevel: EncloseMooseLevelUpdate = {
			name_sv: values.name_sv,
			name_en: values.name_en,
			day_index: values.day_index,
			release_date: format(values.release_date, "yyyy-MM-dd") as any,
			encoded_grid: values.encoded_grid.replace(/\\n/g, "\n"),
			wall_budget: values.wall_budget,
		};

		updateLevel.mutate(
			{
				path: { level_id: values.level_id },
				body: updatedLevel,
			},
			{
				onSuccess: () => {
					onClose();
				},
			},
		);
	}

	function handleRemoveSubmit(
		data: z.infer<typeof encloseMooseLevelEditSchema>,
	) {
		removeLevel.mutate(
			{ path: { level_id: data.level_id } },
			{
				onSuccess: () => {
					onClose();
				},
			},
		);
	}

	return (
		<AdminForm
			title={t("enclose_moose.edit_level")}
			formType="edit"
			gridCols={2}
			open={!!item}
			onOpenChange={(isOpen) => {
				if (!isOpen) onClose();
			}}
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
					rows: 10,
				},
				{
					variant: "number",
					name: "wall_budget",
					label: t("enclose_moose.wall_budget"),
					placeholder: t("enclose_moose.wall_budget_placeholder"),
					min: 0,
				},
			]}
			zodSchema={encloseMooseLevelEditSchema}
			onSubmit={handleFormSubmit}
			useDeleteButton
			onDelete={handleRemoveSubmit}
			// customButtons={detailsButton}
			showDialogButton={false}
			editItem={convertedItem || undefined}
			setEditItem={setConvertedItem}
		/>
	);
}
