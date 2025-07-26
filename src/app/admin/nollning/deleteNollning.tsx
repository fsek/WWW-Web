import type { NollningRead } from "@/api";
import {
	deleteNollningMutation,
	getAllNollningQueryKey,
} from "@/api/@tanstack/react-query.gen";
import { Button } from "@/components/ui/button";
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
		onError: () => {},
	});

	return (
		<div>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<Button
						variant="destructive"
						type="button"
						className="w-32 min-w-fit"
					>
						Förinta
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="text-3xl py-3 underline underline-offset-4">
							Vill du verkligen radera {nollning.name}
						</DialogTitle>
						<DialogDescription>
							{nollning.name} kommer permanent raderas, dett går inte att ångra
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<div>
							<Button
								variant="destructive"
								type="button"
								className="w-32 min-w-fit"
								onClick={() =>
									deleteNollning.mutate({
										path: { nollning_id: nollning.id },
									})
								}
							>
								Förinta
							</Button>
							<DialogClose>Avbryt</DialogClose>
						</div>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default DeleteNollning;
