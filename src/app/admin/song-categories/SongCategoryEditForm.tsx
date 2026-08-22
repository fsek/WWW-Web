import { useEffect, useState } from "react";
import { z } from "zod";
import {
	deleteSongCategoryMutation,
	getAllSongCategoriesQueryKey,
	updateSongCategoryMutation,
} from "@/api/@tanstack/react-query.gen";
import type { SongCategoryRead, SongCategoryCreate } from "@/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import AdminForm from "@/widgets/AdminForm";

interface SongCategoryEditFormProps {
	item: SongCategoryRead | null;
	onClose: () => void;
}

export default function SongCategoryEditForm({
	onClose,
	item,
}: SongCategoryEditFormProps) {
	const { t } = useTranslation("admin");
	const songCategoryEditSchema = z.object({
		id: z.number(),
		name: z
			.string({ error: t("song_categories.name_invalid") })
			.min(2, { error: t("song_categories.name_invalid") }),
	});

	const [convertedItem, setConvertedItem] = useState<z.infer<
		typeof songCategoryEditSchema
	> | null>(null);
	useEffect(() => {
		if (item) {
			setConvertedItem({
				id: item.id,
				name: item.name,
			});
		}
	}, [item]);

	const queryClient = useQueryClient();

	const updateSongCategory = useMutation({
		...updateSongCategoryMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getAllSongCategoriesQueryKey(),
			});
			toast.success(t("song_categories.edit_success"));
		},
		onError: (error) => {
			toast.error(
				typeof error?.detail === "string"
					? error.detail
					: t("song_categories.edit_error"),
			);
		},
	});

	const removeSongCategory = useMutation({
		...deleteSongCategoryMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getAllSongCategoriesQueryKey(),
			});
			toast.success(t("song_categories.remove_success"));
		},
		onError: (error) => {
			toast.error(
				typeof error?.detail === "string"
					? error.detail
					: t("song_categories.remove_error"),
			);
			onClose();
		},
	});

	async function handleFormSubmit(
		values: z.infer<typeof songCategoryEditSchema>,
	) {
		const updatedSongCategory: SongCategoryCreate = {
			name: values.name,
		};

		await updateSongCategory.mutateAsync(
			{
				path: { category_id: values.id },
				body: updatedSongCategory,
			},
			{
				onSuccess: () => {
					onClose();
				},
			},
		);
	}

	function handleRemoveSubmit(data: z.infer<typeof songCategoryEditSchema>) {
		removeSongCategory.mutate(
			{ path: { category_id: data.id } },
			{
				onSuccess: () => {
					onClose();
				},
			},
		);
	}

	return (
		<AdminForm
			title={t("song_categories.edit_song_category")}
			formType="edit"
			gridCols={1}
			open={!!item}
			onOpenChange={(isOpen) => {
				if (!isOpen) onClose();
			}}
			inputFields={[
				{
					variant: "text",
					name: "name",
					label: t("song_categories.name"),
					placeholder: t("song_categories.name_placeholder"),
				},
			]}
			zodSchema={songCategoryEditSchema}
			onSubmit={handleFormSubmit}
			useDeleteButton
			onDelete={handleRemoveSubmit}
			showDialogButton={false}
			editItem={convertedItem || undefined}
			setEditItem={setConvertedItem}
		/>
	);

	// return (
	// 	<Dialog
	// 		open={open}
	// 		onOpenChange={(isOpen) => {
	// 			if (!isOpen) {
	// 				onClose();
	// 			}
	// 		}}
	// 	>
	// 		<DialogContent className="min-w-fit lg:max-w-7xl max-h-[80vh] overflow-y-auto">
	// 			<DialogHeader>
	// 				<DialogTitle>{t("song_categories.edit_song_category")}</DialogTitle>
	// 			</DialogHeader>
	// 			<hr />
	// 			<Form {...form}>
	// 				<form
	// 					onSubmit={form.handleSubmit(handleFormSubmit)}
	// 					className="grid gap-x-4 gap-y-3 lg:grid-cols-4"
	// 				>
	// 					<FormField
	// 						control={form.control}
	// 						name="name"
	// 						render={({ field }) => (
	// 							<FormItem>
	// 								<FormLabel>{t("song_categories.name")}</FormLabel>
	// 								<FormControl>
	// 									<Input
	// 										placeholder={t("song_categories.name_placeholder")}
	// 										{...field}
	// 									/>
	// 								</FormControl>
	// 								<FormMessage />
	// 							</FormItem>
	// 						)}
	// 					/>
	// 					<div className="space-x-2 lg:col-span-4 lg:grid-cols-subgrid">
	// 						<ConfirmDeleteDialog
	// 							open={deleteDialogOpen}
	// 							onOpenChange={setDeleteDialogOpen}
	// 							onConfirm={handleRemoveSubmit}
	// 							triggerText={t("song_categories.remove_song_category")}
	// 							title={t("song_categories.confirm_remove")}
	// 							description={t("song_categories.confirm_remove_text")}
	// 							confirmText={t("song_categories.remove_song_category")}
	// 							cancelText={t("cancel")}
	// 						/>
	// 						<Button type="submit" className="w-32 min-w-fit">
	// 							<Save />
	// 							{t("save")}
	// 						</Button>
	// 					</div>
	// 				</form>
	// 			</Form>
	// 		</DialogContent>
	// 	</Dialog>
	// );
}
