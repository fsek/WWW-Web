import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	adminGetAllUsersQueryKey,
	updateUserPostsMutation,
} from "@/api/@tanstack/react-query.gen";
import type { AdminUserRead } from "@/api";
import { useTranslation } from "react-i18next";
import { ConfirmDeleteDialog } from "@/components/ui/ConfirmDeleteDialog";
import { toast } from "sonner";
import { AdminChooseMultPosts } from "@/widgets/AdminChooseMultPosts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parsePhoneNumberWithError } from "libphonenumber-js";
import { Save } from "lucide-react";

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
	const [selectedPosts, setSelectedPosts] = useState<number[]>([]);

	const queryClient = useQueryClient();

	// Initialize selected posts when user is loaded
	useEffect(() => {
		if (selectedUser?.posts) {
			setSelectedPosts(selectedUser.posts.map((post) => post.id));
		} else {
			setSelectedPosts([]);
		}
	}, [selectedUser]);

	const updateUserPosts = useMutation({
		...updateUserPostsMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminGetAllUsersQueryKey() });
			onClose();
			toast.success(
				t("user-posts.update_success", "User posts updated successfully!"),
			);
		},
		onError: () => {
			toast.error(t("user-posts.update_error", "Failed to update user posts."));
		},
	});

	function handleUpdatePosts() {
		updateUserPosts.mutate(
			{
				path: { user_id: selectedUser.id },
				body: { post_ids: selectedPosts },
			},
			{
				onSuccess: () => {
					setConfirmOpen(false);
				},
			},
		);
	}

	function handleRemoveAllPosts() {
		updateUserPosts.mutate(
			{
				path: { user_id: selectedUser.id },
				body: { post_ids: [] },
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
					<DialogTitle>{t("user-posts.edit", "Manage User Posts")}</DialogTitle>
				</DialogHeader>
				<hr />
				<div className="py-4">
					<Card className="mb-4">
						<CardHeader>
							<CardTitle>
								{t("user-posts.user_info", "User Information")}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								<div className="space-y-1">
									<p className="font-semibold text-sm text-muted-foreground">
										{t("first_name")}:
									</p>
									<p className="text-base">{selectedUser.first_name}</p>
								</div>
								<div className="space-y-1">
									<p className="font-semibold text-sm text-muted-foreground">
										{t("last_name")}:
									</p>
									<p className="text-base">{selectedUser.last_name}</p>
								</div>
								<div className="space-y-1">
									<p className="font-semibold text-sm text-muted-foreground">
										{t("email")}:
									</p>
									<p className="text-base">{selectedUser.email}</p>
								</div>
								<div className="space-y-1">
									<p className="font-semibold text-sm text-muted-foreground">
										{t("stil_id")}:
									</p>
									<p className="text-base">
										{selectedUser.stil_id || t("not_provided", "Not provided")}
									</p>
								</div>
								<div className="space-y-1">
									<p className="font-semibold text-sm text-muted-foreground">
										{t("program")}:
									</p>
									<p className="text-base">{selectedUser.program}</p>
								</div>
								<div className="space-y-1">
									<p className="font-semibold text-sm text-muted-foreground">
										{t("start_year")}:
									</p>
									<p className="text-base">{selectedUser.start_year}</p>
								</div>
								<div className="space-y-1">
									<p className="font-semibold text-sm text-muted-foreground">
										{t("telephone_number")}:
									</p>
									<p className="text-base">
										{selectedUser.telephone_number
											? (() => {
													try {
														return parsePhoneNumberWithError(
															selectedUser.telephone_number,
														).formatNational();
													} catch {
														return selectedUser.telephone_number;
													}
												})()
											: t("not_provided", "Not provided")}
									</p>
								</div>
								<div className="space-y-1">
									<p className="font-semibold text-sm text-muted-foreground">
										{t("account_created")}:
									</p>
									<p className="text-base">
										{selectedUser.account_created
											? new Date(
													selectedUser.account_created,
												).toLocaleDateString("sv")
											: ""}
									</p>
								</div>
								<div className="space-y-1">
									<p className="font-semibold text-sm text-muted-foreground">
										{t("is_member")}:
									</p>
									<p className="text-base">
										{selectedUser.is_member ? t("yes", "Yes") : t("no", "No")}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<div className="my-4">
						<h3 className="font-semibold mb-2">
							{t("user-posts.manage_positions", "Manage User Positions")}
						</h3>
						<AdminChooseMultPosts
							value={selectedPosts}
							onChange={setSelectedPosts}
							className="w-full"
						/>
					</div>

					<div className="flex gap-2 mt-6">
						<Button
							onClick={handleUpdatePosts}
							disabled={updateUserPosts.isPending}
							className="bg-primary hover:bg-primary/90"
						>
							<Save />
							{t("user-posts.save", "Save Changes")}
						</Button>

						<ConfirmDeleteDialog
							open={confirmOpen}
							onOpenChange={setConfirmOpen}
							onConfirm={handleRemoveAllPosts}
							triggerText={t("user-posts.remove_all")}
							title={t("user-posts.confirm_remove")}
							description={t("user-posts.confirm_remove_all_text")}
							confirmText={t("user-posts.remove_all")}
							cancelText={t("cancel", "Cancel")}
						/>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
