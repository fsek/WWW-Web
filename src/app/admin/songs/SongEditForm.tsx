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
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	deleteSongMutation,
	getAllSongsQueryKey,
	updateSongMutation,
	getAllSongCategoriesOptions,
} from "@/api/@tanstack/react-query.gen";
import type { SongRead, SongCreate } from "@/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { Save } from "lucide-react";
import { SelectFromOptions } from "@/widgets/SelectFromOptions";
import { useRouter } from "next/navigation";

const songEditSchema = z.object({
	id: z.number(),
	title: z.string().min(2),
	author: z.string().optional(),
	melody: z.string().optional(),
	content: z.string().min(1),
	category_id: z.string().min(1),
});

type SongEditFormType = z.infer<typeof songEditSchema>;

interface SongEditFormProps {
	open: boolean;
	onClose: () => void;
	selectedSong: SongRead;
}

export default function SongEditForm({
	open,
	onClose,
	selectedSong,
}: SongEditFormProps) {
	const { t } = useTranslation("admin");
	const router = useRouter();
	const form = useForm<SongEditFormType>({
		resolver: zodResolver(songEditSchema),
		defaultValues: {
			title: "",
			author: "",
			melody: "",
			content: "",
			category_id: "",
		},
	});

	const { data: categories } = useQuery({
		...getAllSongCategoriesOptions(),
		enabled: open,
		refetchOnWindowFocus: false,
	});

	useEffect(() => {
		if (open && selectedSong) {
			form.reset({
				id: selectedSong.id,
				title: selectedSong.title,
				author: selectedSong.author || "",
				melody: selectedSong.melody || "",
				content: selectedSong.content,
				category_id: selectedSong.category?.id?.toString() || "",
			});
		}
	}, [selectedSong, form, open]);

	const queryClient = useQueryClient();

	const updateSong = useMutation({
		...updateSongMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getAllSongsQueryKey(),
			});
			toast.success(t("songs.edit_success"));
		},
		onError: (error) => {
			toast.error(
				typeof error?.detail === "string"
					? error.detail
					: t("songs.edit_error"),
			);
			onClose();
		},
	});

	const removeSong = useMutation({
		...deleteSongMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getAllSongsQueryKey(),
			});
			toast.success(t("songs.remove_success"));
		},
		onError: (error) => {
			toast.error(
				typeof error?.detail === "string"
					? error.detail
					: t("songs.remove_error"),
			);
			onClose();
		},
	});

	function handleFormSubmit(values: SongEditFormType) {
		const updatedSong: SongCreate = {
			title: values.title,
			author: values.author || null,
			melody: values.melody || null,
			content: values.content,
			category_id: Number.parseInt(values.category_id),
		};

		updateSong.mutate(
			{
				path: { song_id: values.id },
				body: updatedSong,
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
		removeSong.mutate(
			{ path: { song_id: form.getValues("id") } },
			{
				onSuccess: () => {
					onClose();
				},
			},
		);
	}

	const categoryOptions =
		categories?.map((category) => ({
			label: category.name,
			value: category.id.toString(),
		})) || [];

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
					<DialogTitle>{t("songs.edit_song")}</DialogTitle>
				</DialogHeader>
				<hr />
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleFormSubmit)}
						className="grid gap-x-4 gap-y-3 lg:grid-cols-4"
					>
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("songs.title")}</FormLabel>
									<FormControl>
										<Input
											placeholder={t("songs.title_placeholder")}
											{...field}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="author"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("songs.author")}</FormLabel>
									<FormControl>
										<Input
											placeholder={t("songs.author_placeholder")}
											{...field}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="melody"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("songs.melody")}</FormLabel>
									<FormControl>
										<Input
											placeholder={t("songs.melody_placeholder")}
											{...field}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="category_id"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("songs.category")}</FormLabel>
									<FormControl>
										<SelectFromOptions
											options={categoryOptions}
											value={field.value}
											onChange={field.onChange}
											placeholder={t("songs.select_category")}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="content"
							render={({ field }) => (
								<FormItem className="lg:col-span-4">
									<FormLabel>{t("songs.content")}</FormLabel>
									<FormControl>
										<Textarea
											placeholder={t("songs.content_placeholder")}
											rows={10}
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
								triggerText={t("songs.remove_song")}
								title={t("songs.confirm_remove")}
								description={t("songs.confirm_remove_text")}
								confirmText={t("songs.remove_song")}
								cancelText={t("admin:cancel")}
							/>
							<Button type="submit" className="w-32 min-w-fit">
								<Save />
								{t("save")}
							</Button>
							<Button
								variant="outline"
								type="button"
								onClick={() => router.push(`/songs/${selectedSong.id}`)}
							>
								{t("admin:songs.view_song")}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
