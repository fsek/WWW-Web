import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
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
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	createAlbumMutation,
	getAlbumsQueryKey,
} from "@/api/@tanstack/react-query.gen";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AdminChooseDates } from "@/widgets/AdminChooseDates";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

const albumSchema = z.object({
	title_sv: z.string().min(2),
	title_en: z.string().min(2),
	desc_sv: z.string(),
	desc_en: z.string(),
	location: z.string(),
	date: z.date(),
});

export default function AlbumsForm() {
	const [open, setOpen] = useState(false);
	const [submitEnabled, setSubmitEnabled] = useState(true);
	const lastFormValues = useRef<z.infer<typeof albumSchema> | null>(null);
	const albumForm = useForm<z.infer<typeof albumSchema>>({
		resolver: zodResolver(albumSchema),
		defaultValues: {},
	});
	const { t } = useTranslation("admin");

	const queryClient = useQueryClient();

	const createAlbum = useMutation({
		...createAlbumMutation(),
		throwOnError: false,
		onSuccess: (data) => {
			// Use lastFormValues ref to access the picture
			toast.success(t("albums.success_add"));
			queryClient.invalidateQueries({ queryKey: getAlbumsQueryKey() });
			setOpen(false);
			setSubmitEnabled(true);
		},
		onError: (error) => {
			toast.error(
				t("albums.error_add", { error: error?.detail ?? "Unknown error" }),
			);
			setSubmitEnabled(true);
		},
	});

	function onSubmit(values: z.infer<typeof albumSchema>) {
		setSubmitEnabled(false);
		lastFormValues.current = values; // <-- store values for later use
		createAlbum.mutate({
			body: {
				...values,
				year: values.date.getFullYear(),
			},
		});
	}

	useEffect(() => {
		if (open) {
			albumForm.reset({
				title_sv: "",
				title_en: "",
				desc_sv: "",
				desc_en: "",
				location: "",
			});
			lastFormValues.current = null; // Reset last form values
		}
	}, [open, albumForm]);

	return (
		<div className="p-3">
			<Button
				onClick={() => {
					albumForm.reset();
					setOpen(true);
					setSubmitEnabled(true);
				}}
			>
				<Plus />
				{t("albums.create_album")}
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="min-w-fit lg:max-w-7xl">
					<DialogHeader>
						<DialogTitle>{t("albums.create_album")}</DialogTitle>
					</DialogHeader>
					<hr />
					<Form {...albumForm}>
						<form
							onSubmit={albumForm.handleSubmit(onSubmit)}
							className="grid gap-x-4 gap-y-3 lg:grid-cols-2"
						>
							<FormField
								control={albumForm.control}
								name="title_sv"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("albums.title_sv")}</FormLabel>
										<FormControl>
											<Input
												placeholder={t("albums.title_sv")}
												{...field}
												value={field.value ?? ""}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={albumForm.control}
								name="title_en"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("albums.title_en")}</FormLabel>
										<FormControl>
											<Input
												placeholder={t("albums.title_en")}
												{...field}
												value={field.value ?? ""}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={albumForm.control}
								name="desc_sv"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("albums.desc_sv")}</FormLabel>
										<FormControl>
											<Textarea
												placeholder={t("albums.desc_sv")}
												className="h-48"
												{...field}
												value={field.value ?? ""}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={albumForm.control}
								name="desc_en"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("albums.desc_en")}</FormLabel>
										<FormControl>
											<Textarea
												placeholder={t("albums.desc_en")}
												className="h-48"
												{...field}
												value={field.value ?? ""}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={albumForm.control}
								name="location"
								render={({ field: { onChange, value, ...field } }) => (
									<FormItem className="lg:col-span-1">
										<FormLabel>{t("albums.location")}</FormLabel>
										<FormControl>
											<Input placeholder={t("albums.location")} {...field} />
										</FormControl>
									</FormItem>
								)}
							/>

							{/* Pinned From */}
							<FormField
								control={albumForm.control}
								name="date"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("albums.date")}</FormLabel>
										<AdminChooseDates
											value={field.value ?? undefined}
											onChange={field.onChange}
										/>
									</FormItem>
								)}
							/>
							<div className="space-x-2 lg:col-span-2 lg:grid-cols-subgrid">
								<Button
									type="submit"
									disabled={!submitEnabled}
									className="w-32 min-w-fit"
								>
									{t("albums.publish")}
								</Button>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
