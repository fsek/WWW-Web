import { useEffect, useState } from "react";
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
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import {
	patchAlbumMutation,
	deleteOneAlbumMutation,
	getAlbumsQueryKey,
	getAlbumImagesOptions,
} from "@/api/@tanstack/react-query.gen";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { AdminChooseDates } from "@/widgets/AdminChooseDates";
import { toast } from "sonner";
import { Save, Trash2 } from "lucide-react";
import type { AlbumRead } from "@/api";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";

const albumSchema = z.object({
	title_sv: z.string().min(2),
	title_en: z.string().min(2),
	desc_sv: z.string(),
	desc_en: z.string(),
	location: z.string(),
});

interface AlbumsEditFormProps {
	open: boolean;
	onClose: () => void;
	selectedAlbum: AlbumRead;
}

export default function AlbumsEditForm({
	open,
	onClose,
	selectedAlbum,
}: AlbumsEditFormProps) {
	const [submitEnabled, setSubmitEnabled] = useState(true);
	const [confirmOpen, setConfirmOpen] = useState(false);

	const albumForm = useForm<z.infer<typeof albumSchema>>({
		resolver: zodResolver(albumSchema),
	});

	const { t, i18n } = useTranslation("admin");
	const queryClient = useQueryClient();
	const router = useRouter();

	// Get the image ids to check if it's empty
	const {
		data: albumImages,
		error: imagesError,
		isPending: isAlbumImagesLoading,
	} = useSuspenseQuery({
		...getAlbumImagesOptions({ path: { album_id: selectedAlbum.id } }),
		refetchOnWindowFocus: false,
	});

	// Initialize form with existing album data
	useEffect(() => {
		if (selectedAlbum) {
			albumForm.reset({
				title_sv: selectedAlbum.title_sv || "",
				title_en: selectedAlbum.title_en || "",
				desc_sv: selectedAlbum.desc_sv || "",
				desc_en: selectedAlbum.desc_en || "",
				location: selectedAlbum.location || "",
			});
		}
	}, [selectedAlbum, albumForm]);

	const updateAlbum = useMutation({
		...patchAlbumMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAlbumsQueryKey() });
			onClose();
			setSubmitEnabled(true);
			toast.success(t("albums.success_edit"));
		},
		onError: () => {
			toast.error(t("albums.error_edit"));
			setSubmitEnabled(true);
		},
	});

	const deleteAlbum = useMutation({
		...deleteOneAlbumMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAlbumsQueryKey() });
			onClose();
			toast.success(
				t("albums.success_delete", {
					album:
						i18n.language === "sv"
							? selectedAlbum.title_sv
							: selectedAlbum.title_en,
				}),
			);
		},
		onError: () => {
			toast.error(t("albums.error_delete"));
		},
	});

	function onSubmit(values: z.infer<typeof albumSchema>) {
		setSubmitEnabled(false);
		updateAlbum.mutate({
			path: { album_id: selectedAlbum.id },
			body: {
				...values,
			},
		});
	}

	function handleRemoveAlbum() {
		deleteAlbum.mutate({
			path: { album_id: selectedAlbum.id },
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
					<DialogTitle>{t("albums.edit_album")}</DialogTitle>
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
										<Input placeholder={t("albums.title_sv")} {...field} />
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
										<Input placeholder={t("albums.title_en")} {...field} />
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
											{...field}
											className="h-48"
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
											{...field}
											className="h-48"
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={albumForm.control}
							name="location"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("albums.location")}</FormLabel>
									<FormControl>
										<Input placeholder={t("albums.location")} {...field} />
									</FormControl>
								</FormItem>
							)}
						/>

						<div className="space-x-2 lg:col-span-2 flex items-center">
							<Button
								variant="outline"
								type="button"
								onClick={() => router.push(`/gallery/${selectedAlbum.id}`)}
							>
								{t("albums.view_album")}
							</Button>
							<Button
								type="submit"
								disabled={!submitEnabled}
								className="flex space-x-2 items-center"
							>
								<Save />
								{t("save")}
							</Button>
							<ConfirmDeleteDialog
								open={confirmOpen}
								onOpenChange={setConfirmOpen}
								onConfirm={handleRemoveAlbum}
								disabled={albumImages.length !== 0}
								triggerText={t("remove")}
								title={t("albums.confirm_remove")}
								description={t("albums.confirm_remove_text")}
								confirmText={t("remove")}
								cancelText={t("cancel")}
							/>
							<p className="text-sm text-secondary-foreground select-none">
								{albumImages.length !== 0 ? `(${t("albums.only_empty")})` : ""}
							</p>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
