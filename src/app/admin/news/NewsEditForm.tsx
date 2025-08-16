import { useState, useEffect, useRef } from "react";
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
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
	updateNewsMutation,
	getAllNewsQueryKey,
	deleteNewsMutation,
	getNewsImageOptions,
	postNewsImageMutation,
} from "@/api/@tanstack/react-query.gen";
import { useTranslation } from "react-i18next";
import { AdminChooseDates } from "@/widgets/AdminChooseDates";
import { toast } from "sonner";
import type { NewsRead } from "@/api";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { Save } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";

const newsSchema = z.object({
	title_sv: z.string().min(2),
	title_en: z.string().min(2),
	text_sv: z.string().min(2),
	text_en: z.string().min(2),
	picture: z.any().optional(),
	pinned_from: z.date().optional().nullable(),
	pinned_to: z.date().optional().nullable(),
});

interface NewsEditFormProps {
	open: boolean;
	onClose: () => void;
	selectedNews: NewsRead;
}

export default function NewsEditForm({
	open,
	onClose,
	selectedNews,
}: NewsEditFormProps) {
	const [submitEnabled, setSubmitEnabled] = useState(true);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [usePinning, setUsePinning] = useState(false);
	const lastFormValues = useRef<z.infer<typeof newsSchema> | null>(null);
	const newsEditForm = useForm<z.infer<typeof newsSchema>>({
		resolver: zodResolver(newsSchema),
	});
	const { t } = useTranslation("admin");

	const queryClient = useQueryClient();

	const { data: newsImage } = useQuery({
		...getNewsImageOptions({ path: { news_id: selectedNews.id, size: "small" } }),
		retry: false,
		throwOnError: false,
	});
	const router = useRouter();

	const postNewsImage = useMutation({
		...postNewsImageMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllNewsQueryKey() });
			onClose();
			setSubmitEnabled(true);
			toast.success(t("news.success_edit"));
		},
		onError: (error) => {
			toast.error(
				t("news.error_image_upload", {
					error: error?.detail ?? "Unknown error",
				}),
			);
			setSubmitEnabled(true);
		},
	});

	// Initialize form with existing news data
	useEffect(() => {
		if (selectedNews) {
			if (selectedNews.pinned_from == null && selectedNews.pinned_to == null) {
				setUsePinning(false);
			} else {
				setUsePinning(true);
			}
			newsEditForm.reset({
				title_sv: selectedNews.title_sv || "",
				title_en: selectedNews.title_en || "",
				text_sv: selectedNews.content_sv || "",
				text_en: selectedNews.content_en || "",
				pinned_from: selectedNews.pinned_from
					? new Date(selectedNews.pinned_from)
					: null,
				pinned_to: selectedNews.pinned_to
					? new Date(selectedNews.pinned_to)
					: null,
			});
		}
	}, [selectedNews, newsEditForm]);

	const updateNews = useMutation({
		...updateNewsMutation(),
		throwOnError: false,
		onSuccess: (data) => {
			// After updating news, check if a new image is selected and post it
			const picture = lastFormValues.current?.picture;
			if (picture) {
				postNewsImage.mutate({
					path: { news_id: selectedNews.id },
					body: { image: picture },
				});
			} else {
				queryClient.invalidateQueries({ queryKey: getAllNewsQueryKey() });
				onClose();
				setSubmitEnabled(true);
				toast.success(t("news.success_edit"));
			}
		},
		onError: () => {
			toast.error(t("news.error_edit"));
			setSubmitEnabled(true);
		},
	});

	const deleteNews = useMutation({
		...deleteNewsMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllNewsQueryKey() });
			onClose();
			toast.success(t("news.success_delete"));
		},
		onError: () => {
			toast.error(t("news.error_delete"));
		},
	});

	function onSubmit(values: z.infer<typeof newsSchema>) {
		setSubmitEnabled(false);
		lastFormValues.current = values;
		updateNews.mutate({
			path: { news_id: selectedNews.id },
			body: {
				title_sv: values.title_sv,
				title_en: values.title_en,
				content_sv: values.text_sv,
				content_en: values.text_en,
				pinned_from: values.pinned_from,
				pinned_to: values.pinned_to,
			},
		});
	}

	function handleRemoveNews() {
		deleteNews.mutate({
			path: { news_id: selectedNews.id },
		});
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
					<DialogTitle>{t("news.edit_news")}</DialogTitle>
				</DialogHeader>
				<hr />
				<Form {...newsEditForm}>
					<form
						onSubmit={newsEditForm.handleSubmit(onSubmit)}
						className="grid gap-x-4 gap-y-3 lg:grid-cols-2"
					>
						<FormField
							control={newsEditForm.control}
							name="title_sv"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("news.title_sv")}</FormLabel>
									<FormControl>
										<Input
											placeholder={t("news.title_sv")}
											{...field}
											value={field.value ?? ""}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={newsEditForm.control}
							name="title_en"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("news.title_en")}</FormLabel>
									<FormControl>
										<Input
											placeholder={t("news.title_en")}
											{...field}
											value={field.value ?? ""}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						<FormField
							control={newsEditForm.control}
							name="text_sv"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("news.text_sv")}</FormLabel>
									<FormControl>
										<Textarea
											placeholder={t("news.text_sv")}
											className="h-48"
											{...field}
											value={field.value ?? ""}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={newsEditForm.control}
							name="text_en"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("news.text_en")}</FormLabel>
									<FormControl>
										<Textarea
											placeholder={t("news.text_en")}
											className="h-48"
											{...field}
											value={field.value ?? ""}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={newsEditForm.control}
							name="picture"
							render={({ field: { onChange, value, ...field } }) => (
								<FormItem className="lg:col-span-1">
									<FormLabel>{t("news.picture")}</FormLabel>
									<div className="flex space-x-2 flex-col">
										<FormControl>
											<Input
												{...field}
												type="file"
												accept=".jpg,.jpeg,.png,.gif,.webp"
												onChange={(e) => {
													const file = e.target.files?.[0];
													onChange(file);
												}}
											/>
										</FormControl>
										{newsImage !== undefined && (
											<div className="mt-2 text-muted-foreground">
												{t("news.image_uploaded")}
											</div>
										)}
									</div>
								</FormItem>
							)}
						/>

						{/* Use pinning */}
						<label
							// key={permission.id}
							htmlFor={"use-pinning"}
							className="flex items-center space-x-3 rounded-md border p-3 hover:bg-accent/50 transition-colors cursor-pointer lg:col-span-1"
						>
							<Checkbox
								id={"use-pinning"}
								checked={usePinning}
								onCheckedChange={(checked) => {
									if (!checked) {
										newsEditForm.setValue("pinned_from", null);
										newsEditForm.setValue("pinned_to", null);
										setUsePinning(false);
									} else {
										newsEditForm.setValue("pinned_from", new Date());
										newsEditForm.setValue(
											"pinned_to",
											new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
										);
										setUsePinning(true);
									}
								}}
								className="h-5 w-5"
							/>
							<span className="text-sm font-medium">
								{t("news.use_pinning")}
							</span>
						</label>

						{/* Pinned From */}
						<FormField
							control={newsEditForm.control}
							name="pinned_from"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("news.pinned_from")}</FormLabel>
									<AdminChooseDates
										value={field.value ?? undefined}
										onChange={field.onChange}
										disabled={!usePinning}
									/>
								</FormItem>
							)}
						/>
						{/* Pinned To */}
						<FormField
							control={newsEditForm.control}
							name="pinned_to"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("news.pinned_to")}</FormLabel>
									<AdminChooseDates
										value={field.value ?? undefined}
										onChange={field.onChange}
										disabled={!usePinning}
									/>
								</FormItem>
							)}
						/>
						<div className="space-x-2 lg:col-span-2 lg:grid-cols-subgrid flex flex-row items-center">
							<Button
								variant="outline"
								type="button"
								onClick={() => router.push(`/news/${selectedNews.id}`)}
							>
								{t("admin:news.view_news")}
							</Button>
							<Button
								type="submit"
								disabled={!submitEnabled}
								className="w-32 min-w-fit"
							>
								<Save />
								{t("save")}
							</Button>
							<ConfirmDeleteDialog
								open={confirmOpen}
								onOpenChange={setConfirmOpen}
								onConfirm={handleRemoveNews}
								triggerText={t("remove")}
								title={t("news.confirm_remove")}
								description={t("news.confirm_remove_text")}
								confirmText={t("remove")}
								cancelText={t("cancel")}
							/>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
