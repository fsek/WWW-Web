import { useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	removePermissionMutation,
	getAllPermissionsQueryKey,
} from "@/api/@tanstack/react-query.gen";
import type { PermissionWithPosts } from "./page";
import { useTranslation } from "react-i18next";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { toast } from "sonner";

interface PermissionEditFormProps {
	item: PermissionWithPosts | null;
	onClose: () => void;
}

export default function PermissionEditForm({
	item: selectedPermission,
	onClose,
}: PermissionEditFormProps) {
	const { t, i18n } = useTranslation("admin");
	const [confirmOpen, setConfirmOpen] = useState(false);

	const queryClient = useQueryClient();

	const removePermission = useMutation({
		...removePermissionMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllPermissionsQueryKey() });
			onClose();
			toast.success(t("permissions.remove_success", "Permission borttagen!"));
		},
		onError: () => {
			onClose();
			toast.error(
				t("permissions.remove_error", "Kunde inte ta bort permission."),
			);
		},
	});

	if (!selectedPermission) return null;

	function handleRemove() {
		if (!selectedPermission) return;
		removePermission.mutate(
			{
				body: {
					action: selectedPermission.action,
					target: selectedPermission.target,
				},
			},
			{
				onSuccess: () => {
					setConfirmOpen(false);
				},
			},
		);
	}

	return (
		<Dialog
			open={!!selectedPermission}
			onOpenChange={(isOpen) => {
				if (!isOpen) {
					onClose();
				}
			}}
		>
			<DialogContent className="min-w-fit lg:max-w-7xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{t("permissions.edit", "Redigera permission")}
					</DialogTitle>
				</DialogHeader>
				<hr />
				<div className="py-4">
					<div className="mb-2">
						<span className="font-semibold">
							{t("permissions.target", "Target")}:{" "}
						</span>
						<span>{selectedPermission.target}</span>
					</div>
					<div className="mb-4">
						<span className="font-semibold">
							{t("permissions.action", "Action")}:{" "}
						</span>
						<span>{selectedPermission.action}</span>
					</div>
					<div className="mb-4">
						<span className="font-semibold">
							{t("permissions.posts_with_permission", "Posts with permission")}{" "}
							({selectedPermission.posts.length}):
						</span>
						{selectedPermission.posts.length > 0 ? (
							<ul className="list-disc pl-6 mt-1">
								{selectedPermission.posts.map((post) => (
									<li key={post.id}>
										{i18n.language === "en" ? post.name_en : post.name_sv}
									</li>
								))}
							</ul>
						) : (
							<p className="mt-1 text-muted-foreground">
								{t(
									"permissions.no_posts",
									"No posts have this permission.",
								)}
							</p>
						)}
					</div>
					<ConfirmDeleteDialog
						open={confirmOpen}
						onOpenChange={setConfirmOpen}
						onConfirm={handleRemove}
						triggerText={t("permissions.remove", "Remove permission")}
						title={t("permissions.confirm_remove", "Confirm removal")}
						description={t(
							"permissions.confirm_remove_text",
							"Are you sure you want to remove this permission?",
						)}
						confirmText={t("permissions.remove", "Remove permission")}
						cancelText={t("cancel", "Cancel")}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
