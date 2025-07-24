import { useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	removePermissionMutation,
	getAllPermissionsQueryKey,
} from "@/api/@tanstack/react-query.gen";
import type { PermissionRead } from "../../../api";
import { useTranslation } from "react-i18next";
import {
	AlertDialog,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogFooter,
	AlertDialogCancel,
	AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface PermissionEditFormProps {
	open: boolean;
	onClose: () => void;
	selectedPermission: PermissionRead;
}

export default function PermissionEditForm({
	open,
	onClose,
	selectedPermission,
}: PermissionEditFormProps) {
	const { t } = useTranslation("admin");
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

	function handleRemove() {
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
			open={open}
			onOpenChange={(isOpen) => {
				if (!isOpen) {
					onClose();
				}
			}}
		>
			<DialogContent className="min-w-fit lg:max-w-7xl">
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
					<AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
						<AlertDialogTrigger asChild>
							<Button
								variant="destructive"
								type="button"
								className="w-32 min-w-fit"
								onClick={() => setConfirmOpen(true)}
							>
								{t("permissions.remove", "Ta bort permission")}
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>
									{t("permissions.confirm_remove", "Bekräfta borttagning")}
								</AlertDialogTitle>
							</AlertDialogHeader>
							<p>
								{t(
									"permissions.confirm_remove_text",
									"Är du säker på att du vill ta bort denna permission?",
								)}
							</p>
							<AlertDialogFooter>
								<AlertDialogCancel>{t("cancel", "Avbryt")}</AlertDialogCancel>
								<AlertDialogAction
									onClick={handleRemove}
									className="bg-destructive text-white"
								>
									{t("permissions.remove", "Ta bort permission")}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</DialogContent>
		</Dialog>
	);
}
