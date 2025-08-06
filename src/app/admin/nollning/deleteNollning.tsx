import type { NollningRead } from "@/api";
import {
	deleteNollningMutation,
	getAllNollningQueryKey,
} from "@/api/@tanstack/react-query.gen";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface Props {
	nollning: NollningRead;
}

const DeleteNollning = ({ nollning }: Props) => {
	const [open, setOpen] = useState(false);
	const { t } = useTranslation("admin");

	const queryClient = useQueryClient();

	const deleteNollning = useMutation({
		...deleteNollningMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllNollningQueryKey() });
			toast.success(t("nollning.main.delete_success"));
		},
		onError: () => {
			toast.error(t("nollning.main.delete_error"));
		},
	});

	return (
		<div>
			<ConfirmDeleteDialog
				open={open}
				onOpenChange={setOpen}
				onConfirm={() =>
					deleteNollning.mutate({
						path: { nollning_id: nollning.id },
					})
				}
				triggerText={t("nollning.main.delete_button")}
				title={t("nollning.main.delete_title", { name: nollning.name })}
				description={t("nollning.main.delete_description", {
					name: nollning.name,
				})}
				confirmText={t("nollning.main.delete_confirm")}
				cancelText={t("nollning.main.cancel")}
				confirmByTyping={true}
				confirmByTypingText={t("nollning.main.delete_confirm_typing", {
					name: nollning.name,
				})}
				confirmByTypingKey={nollning.name}
			/>
		</div>
	);
};

export default DeleteNollning;
