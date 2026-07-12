"use client";

import type { AssociationTypeEnum } from "@/api";
import {
	deleteAssociatedImageMutation,
	uploadAssociatedImageMutation,
} from "@/api/@tanstack/react-query.gen";
import ImageDisplay from "@/components/ImageDisplay";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import getErrorMessage from "@/help_functions/getErrorMessage";
import { useMutation } from "@tanstack/react-query";
import { Eye, ImagePlus, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface AssociatedImageManagerProps {
	associationType: AssociationTypeEnum;
	associationId: number | null;
	associatedImageId: number | null;
	onImageChanged?: () => void;
	addButtonText?: string;
}

export default function AssociatedImageManager({
	associationType,
	associationId,
	associatedImageId,
	onImageChanged,
	addButtonText,
}: AssociatedImageManagerProps) {
	const { t } = useTranslation();
	const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
	const [previewOpen, setPreviewOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [fileToUpload, setFileToUpload] = useState<File | null>(null);

	useEffect(() => {
		if (!uploadDialogOpen) {
			setFileToUpload(null);
		}
	}, [uploadDialogOpen]);

	const uploadAssociatedImage = useMutation({
		...uploadAssociatedImageMutation(),
		onSuccess: () => {
			toast.success(t("admin:associated_image.upload_success"));
			setUploadDialogOpen(false);
			onImageChanged?.();
		},
		onError: (error) => {
			toast.error(getErrorMessage(error, (key) => t(key)));
		},
	});

	const deleteAssociatedImage = useMutation({
		...deleteAssociatedImageMutation(),
		onSuccess: () => {
			toast.success(t("admin:associated_image.delete_success"));
			onImageChanged?.();
		},
		onError: (error) => {
			toast.error(getErrorMessage(error, (key) => t(key)));
		},
	});

	function handleUpload() {
		if (!fileToUpload || associationId === null) {
			return;
		}

		uploadAssociatedImage.mutate({
			body: {
				file: fileToUpload,
			},
			query: {
				association_type: associationType,
				association_id: associationId,
			},
		});
	}

	function handleDelete() {
		if (associatedImageId === null) {
			return;
		}

		deleteAssociatedImage.mutate({
			path: {
				id: associatedImageId,
			},
		});
	}

	if (associatedImageId === null) {
		return (
			<>
				<Button
					type="button"
					variant="outline"
					onClick={() => setUploadDialogOpen(true)}
					disabled={associationId === null}
				>
					<ImagePlus className="size-4" />
					{addButtonText ?? t("admin:associated_image.add")}
				</Button>

				<Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>{t("admin:associated_image.add_title")}</DialogTitle>
							{associationId === null ? (
								<DialogDescription>
									{t("admin:associated_image.no_target")}
								</DialogDescription>
							) : null}
						</DialogHeader>

						<Input
							type="file"
							accept="image/*"
							onChange={(event) => {
								setFileToUpload(event.target.files?.[0] ?? null);
							}}
						/>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setUploadDialogOpen(false)}
							>
								{t("admin:cancel")}
							</Button>
							<Button
								type="button"
								onClick={handleUpload}
								disabled={!fileToUpload || uploadAssociatedImage.isPending}
							>
								<Upload className="size-4" />
								{t("admin:associated_image.upload")}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</>
		);
	}

	return (
		<div className="flex items-center gap-2">
			<Button
				type="button"
				variant="outline"
				className="h-9"
				onClick={() => setPreviewOpen(true)}
				title={t("admin:associated_image.view")}
			>
				<Eye className="size-4" />
				{t("admin:associated_image.view_action")}
			</Button>

			<ConfirmDeleteDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				onConfirm={handleDelete}
				disabled={deleteAssociatedImage.isPending}
				triggerText={t("admin:associated_image.delete_action")}
				title={t("admin:associated_image.delete_title")}
				description={t("admin:associated_image.delete_description")}
				confirmText={t("admin:remove")}
				cancelText={t("admin:cancel")}
			/>

			<Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
				<DialogContent className="max-w-3xl">
					<DialogHeader>
						<DialogTitle>
							{t("admin:associated_image.preview_title")}
						</DialogTitle>
					</DialogHeader>
					<div className="relative h-[26rem] w-full rounded-md border bg-muted">
						<ImageDisplay
							type="associated_img"
							imageId={associatedImageId}
							size="large"
							alt={t("admin:associated_image.preview_alt")}
							className="object-contain"
							fill
						/>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
