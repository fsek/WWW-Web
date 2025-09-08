import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	adminDeleteUserMutation,
	adminGetAllUsersQueryKey,
	adminUpdateUserMutation,
	updateUserPostsMutation,
} from "@/api/@tanstack/react-query.gen";
import { action, target, type AdminUserRead } from "@/api";
import { useTranslation } from "react-i18next";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { toast } from "sonner";
import { AdminChooseMultPosts } from "@/widgets/AdminChooseMultPosts";
import { Save } from "lucide-react";
import UserDetailsCard from "@/components/UserDetailsCard";
import { useAuthState } from "@/lib/auth";

interface UserPostsEditFormProps {
	open: boolean;
	onClose: () => void;
	selectedUser: AdminUserRead;
}

export default function UserPostsEditForm({
	open,
	onClose,
	selectedUser,
}: UserPostsEditFormProps) {
	const { t } = useTranslation("admin");
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const auth = useAuthState();
	const permissions = auth.getPermissions();
	const queryClient = useQueryClient();

	const updateUser = useMutation({
		...adminUpdateUserMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminGetAllUsersQueryKey() });
			onClose();
			toast.success(t("member.update_success", "User updated successfully!"));
		},
		onError: () => {
			toast.error(t("member.update_error", "Failed to update user."));
		},
	});

	const deleteUser = useMutation({
		...adminDeleteUserMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminGetAllUsersQueryKey() });
			onClose();
			toast.success(t("member.delete_success", "User deleted."));
		},
		onError: (e) => {
			toast.error(
				t("member.delete_error", "Failed to delete user: {details}", {
					details: e.detail,
				}),
			);
		},
	});

	// function handleUpdatePosts() {
	// 	updateUser.mutate(
	// 		{
	// 			path: { user_id: selectedUser.id },
	// 			body: { post_ids: selectedPosts },
	// 		},
	// 		{
	// 			onSuccess: () => {
	// 				setConfirmOpen(false);
	// 			},
	// 		},
	// 	);
	// }

	function handleDeleteUser() {
		deleteUser.mutate(
			{
				path: { user_id: selectedUser.id },
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
			<DialogContent className="min-w-fit lg:max-w-7xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{t("member.edit", "Manage User")}</DialogTitle>
				</DialogHeader>
				<hr />
				<div className="py-4">
					<UserDetailsCard user={selectedUser} />
					<div className="my-4">
						<h3 className="font-semibold mb-2">
							{t("member.manage", "Manage User")}
						</h3>
					</div>

					<div className="flex gap-2 mt-6">
						{/* <Button
							onClick={handleUpdatePosts}
							disabled={updateUserPosts.isPending}
							className="bg-primary hover:bg-primary/90"
						>
							<Save />
							{t("user-posts.save", "Save Changes")}
						</Button> */}
						{permissions.hasRequiredPermissions([
							[action.SUPER, target.USER],
						]) ? (
							<ConfirmDeleteDialog
								open={confirmOpen}
								onOpenChange={setConfirmOpen}
								onConfirm={handleDeleteUser}
								triggerText={t("member.remove")}
								title={t("member.confirm_remove")}
								description={t("member.confirm_remove_text")}
								confirmText={t("member.remove")}
								cancelText={t("cancel", "Cancel")}
							/>
						) : (
							<></>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
