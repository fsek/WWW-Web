import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	deleteSongCategoryMutation,
	getAllSongCategoriesQueryKey,
	updateSongCategoryMutation,
} from "@/api/@tanstack/react-query.gen";
import type { SongCategoryRead, SongCategoryCreate } from "@/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { Save } from "lucide-react";

const songCategoryEditSchema = z.object({
	id: z.number(),
	name: z.string().min(2),
});

type SongCategoryEditFormType = z.infer<typeof songCategoryEditSchema>;

interface SongCategoryEditFormProps {
	open: boolean;
	onClose: () => void;
	selectedSongCategory: SongCategoryRead;
}

export default function SongCategoryEditForm({
	open,
	onClose,
	selectedSongCategory,
}: SongCategoryEditFormProps) {
	const { t } = useTranslation("admin");
	const form = useForm<SongCategoryEditFormType>({
		resolver: zodResolver(songCategoryEditSchema),
		defaultValues: {
			name: "",
		},
	});

	useEffect(() => {
		if (open && selectedSongCategory) {
			form.reset({
				...selectedSongCategory,
			});
		}
	}, [selectedSongCategory, form, open]);

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
			onClose();
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

	function handleFormSubmit(values: SongCategoryEditFormType) {
		const updatedSongCategory: SongCategoryCreate = {
			name: values.name,
		};

		updateSongCategory.mutate(
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

	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	function handleRemoveSubmit() {
		removeSongCategory.mutate(
			{ path: { category_id: form.getValues("id") } },
			{
				onSuccess: () => {
					onClose();
				},
			},
		);
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(isOpen) => {
				if (!isOpen) {
					onClose();
				}
			}}
		>
			<DialogContent className="min-w-fit lg:max-w-7xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{t("song_categories.edit_song_category")}</DialogTitle>
				</DialogHeader>
				<hr />
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleFormSubmit)}
						className="grid gap-x-4 gap-y-3 lg:grid-cols-4"
					>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("song_categories.name")}</FormLabel>
									<FormControl>
										<Input
											placeholder={t("song_categories.name_placeholder")}
											{...field}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						<div className="space-x-2 lg:col-span-4 lg:grid-cols-subgrid">
							<ConfirmDeleteDialog
								open={deleteDialogOpen}
								onOpenChange={setDeleteDialogOpen}
								onConfirm={handleRemoveSubmit}
								triggerText={t("song_categories.remove_song_category")}
								title={t("song_categories.confirm_remove")}
								description={t("song_categories.confirm_remove_text")}
								confirmText={t("song_categories.remove_song_category")}
								cancelText={t("cancel")}
							/>
							<Button type="submit" className="w-32 min-w-fit">
								<Save />
								{t("save")}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
