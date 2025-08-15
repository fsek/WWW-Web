import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogTitle } from "@radix-ui/react-dialog";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createSongMutation,
	getAllSongsQueryKey,
	getAllSongCategoriesOptions,
} from "@/api/@tanstack/react-query.gen";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { SelectFromOptions } from "@/widgets/SelectFromOptions";

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

	const songForm = useForm<z.infer<typeof songSchema>>({
		resolver: zodResolver(songSchema),
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
		<div className="p-3">
			<Button
				onClick={() => {
					songForm.reset();
					setOpen(true);
					setSubmitEnabled(true);
				}}
			>
				<Plus />
				{t("songs.create_song")}
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="min-w-fit lg:max-w-7xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>{t("songs.create_song")}</DialogTitle>
					</DialogHeader>
					<hr />
					<Form {...songForm}>
						<form
							onSubmit={songForm.handleSubmit(onSubmit)}
							className="grid gap-x-4 gap-y-3 lg:grid-cols-4"
						>
							<FormField
								control={songForm.control}
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
								control={songForm.control}
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
								control={songForm.control}
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
								control={songForm.control}
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
								control={songForm.control}
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
								<Button
									type="submit"
									disabled={!submitEnabled}
									className="w-32 min-w-fit"
								>
									{t("songs.create")}
								</Button>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
