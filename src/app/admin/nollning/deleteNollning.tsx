import type { NollningRead } from "@/api";
import {
	deleteNollningMutation,
	getAllNollningQueryKey,
} from "@/api/@tanstack/react-query.gen";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/ui/ConfirmDeleteDialog";
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

interface Props {
	nollning: NollningRead;
}

const DeleteNollning = ({ nollning }: Props) => {
	const [open, setOpen] = useState(false);

	const queryClient = useQueryClient();

	const deleteNollning = useMutation({
		...deleteNollningMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllNollningQueryKey() });
		},
		onError: () => { },
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
				triggerText="Förinta"
				title={`Radera ${nollning.name}`}
				description={`Är du säker på att du vill radera ${nollning.name}? Detta kan inte ångras.`}
				confirmText="Förinta"
				cancelText="Avbryt"
				confirmByTyping={true}
				confirmByTypingText={`Skriv "${nollning.name}" nedan för att bekräfta borttagningen.`}
				confirmByTypingKey={nollning.name}
			/>
		</div>
	);
};

export default DeleteNollning;
