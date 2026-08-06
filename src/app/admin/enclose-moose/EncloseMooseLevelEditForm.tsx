import { useEffect, useState } from "react";
import { z } from "zod";
import {
	mooseGetAllLevelsQueryKey,
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

const encloseMooseLevelEditSchema = z.object({
	level_id: z.string(),
	release_date: z.date(),
	day_index: z.int().optional(),
	name: z.string(),
	encoded_grid: z.string(),
	wall_budget: z.int(),
});

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
				queryKey: mooseGetAllLevelsQueryKey(),
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

	const removeSong = useMutation({
		...mooseAdminDeleteLevelMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: mooseGetAllLevelsQueryKey(),
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
			name: values.name,
			day_index: values.day_index,
			release_date: values.release_date,

			encoded_grid: values.encoded_grid,
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
		removeSong.mutate(
			{ path: { level_id: data.level_id } },
			{
				onSuccess: () => {
					onClose();
				},
			},
		);
	}

	const detailsButton = (
		<Button
			variant="outline"
			type="button"
			onClick={() => router.push(`/songs/${item?.id}`)}
		>
			{t("enclose_moose.view_level")}
		</Button>
	);

	return (
		<AdminForm
			title={t("enclose_moose.edit_level")}
			formType="edit"
			gridCols={4}
			open={!!item}
			onOpenChange={(isOpen) => {
				if (!isOpen) onClose();
			}}
			inputFields={[
				{
					variant: "text",
					name: "name",
					label: t("enclose_moose.name"),
					placeholder: t("enclose_moose.name_placeholder"),
				},
			]}
			zodSchema={encloseMooseLevelEditSchema}
			onSubmit={handleFormSubmit}
			useDeleteButton
			onDelete={handleRemoveSubmit}
			customButtons={detailsButton}
			showDialogButton={false}
			editItem={convertedItem || undefined}
			setEditItem={setConvertedItem}
		/>
	);
}
