import { useState } from "react";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createSongMutation,
	getAllSongsQueryKey,
	getAllSongCategoriesOptions,
} from "@/api/@tanstack/react-query.gen";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import AdminForm from "@/widgets/AdminForm";

const songSchema = z.object({
	title: z.string().min(2),
	author: z.string().optional(),
	melody: z.string().optional(),
	content: z.string().min(1),
	category_id: z.string().min(1),
});

export default function SongForm() {
	const [open, setOpen] = useState(false);
	const [submitEnabled, setSubmitEnabled] = useState(true);
	const { t } = useTranslation("admin");


	const { data: categories } = useQuery({
		...getAllSongCategoriesOptions(),
		enabled: open,
		refetchOnWindowFocus: false,
	});

	const queryClient = useQueryClient();

	const createSong = useMutation({
		...createSongMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getAllSongsQueryKey(),
			});
			toast.success(t("songs.create_success"));
			setOpen(false);
			setSubmitEnabled(true);
		},
		onError: (error) => {
			toast.error(
				typeof error?.detail === "string"
					? error.detail
					: t("songs.create_error"),
			);
			setOpen(false);
			setSubmitEnabled(true);
		},
	});

	function onSubmit(values: z.infer<typeof songSchema>) {
		setSubmitEnabled(false);
		createSong.mutate({
			body: {
				title: values.title,
				author: values.author || null,
				melody: values.melody || null,
				content: values.content,
				category_id: Number.parseInt(values.category_id),
			},
		});
	}

	const categoryOptions =
		categories?.map((category) => ({
			label: category.name,
			value: category.id.toString(),
		})) || [];

	return (
		<AdminForm
			title={t("songs.create_song")}
			formType="add"
			gridCols={4}
			open={open}
			onOpenChange={setOpen}
			inputFields={[
				{
					variant: "text",
					name: "title",
					label: t("songs.title_placeholder"),
					placeholder: "Never Gonna Give You Up",
				},
				{
					variant: "text",
					name: "author",
					label: t("songs.author"),
					placeholder: "Rick Astley",
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
			zodSchema={songSchema}
			onSubmit={onSubmit}
			submitEnabled={submitEnabled}
			setSubmitEnabled={setSubmitEnabled}
		/>
	);
}
