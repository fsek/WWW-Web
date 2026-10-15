import { useState } from "react";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	createSongCategoryMutation,
	getAllSongCategoriesQueryKey,
} from "@/api/@tanstack/react-query.gen";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import AdminForm from "@/widgets/AdminForm";

export default function SongCategoryForm() {
	const [open, setOpen] = useState(false);
	const { t } = useTranslation("admin");

	const songCategorySchema = z.object({
		name: z
			.string({ error: t("song_categories.name_invalid") })
			.min(2, { error: t("song_categories.name_invalid") }),
	});

	const queryClient = useQueryClient();

	const createSongCategory = useMutation({
		...createSongCategoryMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getAllSongCategoriesQueryKey(),
			});
			toast.success(t("song_categories.create_success"));
			setOpen(false);
		},
		onError: (error) => {
			toast.error(
				typeof error?.detail === "string"
					? error.detail
					: t("song_categories.create_error"),
			);
		},
	});

	async function onSubmit(values: z.infer<typeof songCategorySchema>) {
		await createSongCategory.mutateAsync({
			body: {
				name: values.name,
			},
		});
	}

	return (
		<AdminForm
			title={t("song_categories.create_song_category")}
			formType="add"
			gridCols={1}
			open={open}
			onOpenChange={setOpen}
			inputFields={[
				{
					variant: "text",
					name: "name",
					label: t("song_categories.name"),
					placeholder: t("song_categories.name_placeholder"),
				},
			]}
			zodSchema={songCategorySchema}
			onSubmit={onSubmit}
		/>
	);
}
