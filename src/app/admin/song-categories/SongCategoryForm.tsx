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
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogTitle } from "@radix-ui/react-dialog";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	createSongCategoryMutation,
	getAllSongCategoriesQueryKey,
} from "@/api/@tanstack/react-query.gen";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Plus } from "lucide-react";

const songCategorySchema = z.object({
	name: z.string().min(2),
});

export default function SongCategoryForm() {
	const [open, setOpen] = useState(false);
	const [submitEnabled, setSubmitEnabled] = useState(true);
	const { t } = useTranslation("admin");

	const songCategoryForm = useForm<z.infer<typeof songCategorySchema>>({
		resolver: zodResolver(songCategorySchema),
		defaultValues: {
			name: "",
		},
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
			setSubmitEnabled(true);
		},
		onError: (error) => {
			toast.error(
				typeof error?.detail === "string"
					? error.detail
					: t("song_categories.create_error"),
			);
			setOpen(false);
			setSubmitEnabled(true);
		},
	});

	function onSubmit(values: z.infer<typeof songCategorySchema>) {
		setSubmitEnabled(false);
		createSongCategory.mutate({
			body: {
				name: values.name,
			},
		});
	}

	return (
		<div className="p-3">
			<Button
				onClick={() => {
					songCategoryForm.reset();
					setOpen(true);
					setSubmitEnabled(true);
				}}
			>
				<Plus />
				{t("song_categories.create_song_category")}
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="min-w-fit lg:max-w-7xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							{t("song_categories.create_song_category")}
						</DialogTitle>
					</DialogHeader>
					<hr />
					<Form {...songCategoryForm}>
						<form
							onSubmit={songCategoryForm.handleSubmit(onSubmit)}
							className="grid gap-x-4 gap-y-3 lg:grid-cols-4"
						>
							<FormField
								control={songCategoryForm.control}
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
								<Button
									type="submit"
									disabled={!submitEnabled}
									className="w-32 min-w-fit"
								>
									{t("song_categories.create")}
								</Button>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
