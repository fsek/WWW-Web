import { useEffect, useState } from "react";
import { z } from "zod";
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
import { useRouter } from "next/navigation";
import AdminForm from "@/widgets/AdminForm";
import { Button } from "@/components/ui/button";

interface SongEditFormProps {
	item: SongRead | null;
	onClose: () => void;
}

export default function SongEditForm({ onClose, item }: SongEditFormProps) {
	const { t } = useTranslation("admin");
	const router = useRouter();

	const songEditSchema = z.object({
		id: z.number(),
		title: z
			.string({ error: t("songs.song_title_invalid") })
			.min(2, { error: t("songs.song_title_invalid") }),
		author: z.string().optional(),
		melody: z.string().optional(),
		content: z
			.string({ error: t("songs.content_invalid") })
			.min(1, { error: t("songs.content_invalid") }),
		category_id: z
			.string({ error: t("songs.category_invalid") })
			.min(1, { error: t("songs.category_invalid") }),
	});

	// Convert item to the zod schema format (category_id instead of category object)
	const [convertedItem, setConvertedItem] = useState<z.infer<
		typeof songEditSchema
	> | null>(null);
	// biome-ignore lint/correctness/useExhaustiveDependencies: we don't care if convertedItem changes
	useEffect(() => {
		if (item) {
			const convertedItem = {
				...item,
				category_id: item.category ? item.category.id.toString() : null,
			} as z.infer<typeof songEditSchema>;
			setConvertedItem(convertedItem);
		}
	}, [item]);

	const { data: categories } = useQuery({
		...getAllSongCategoriesOptions(),
		enabled: !!convertedItem,
		refetchOnWindowFocus: false,
	});

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

	async function handleFormSubmit(values: z.infer<typeof songEditSchema>) {
		const updatedSong: SongCreate = {
			title: values.title,
			author: values.author || null,
			melody: values.melody || null,
			content: values.content,
			category_id: Number.parseInt(values.category_id),
		};

		await updateSong.mutateAsync(
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

	function handleRemoveSubmit(data: z.infer<typeof songEditSchema>) {
		removeSong.mutate(
			{ path: { song_id: data.id } },
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

	const detailsButton = (
		<Button
			variant="outline"
			type="button"
			onClick={() => router.push(`/songs/${item?.id}`)}
		>
			{t("songs.view_song")}
		</Button>
	);

	return (
		<AdminForm
			title={t("songs.edit_song")}
			formType="edit"
			gridCols={4}
			open={!!item}
			onOpenChange={(isOpen) => {
				if (!isOpen) onClose();
			}}
			inputFields={[
				{
					variant: "text",
					name: "title",
					label: t("songs.song_title"),
					placeholder: t("songs.title_placeholder"),
				},
				{
					variant: "text",
					name: "author",
					label: t("songs.author"),
					placeholder: t("songs.author_placeholder"),
				},
				{
					variant: "text",
					name: "melody",
					label: t("songs.melody"),
					placeholder: t("songs.melody_placeholder"),
				},
				{
					variant: "selectFromOptions",
					name: "category_id",
					label: t("songs.category"),
					options: categoryOptions,
					placeholder: t("songs.select_category"),
				},
				{
					variant: "textarea",
					name: "content",
					label: t("songs.content"),
					placeholder: t("songs.content_placeholder"),
					rows: 10,
					colSpan: 4,
				},
			]}
			zodSchema={songEditSchema}
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
