import type { GroupRead } from "@/api";
import {
	getNollningQueryKey,
	patchGroupMutation,
	removeGroupMutation,
} from "@/api/@tanstack/react-query.gen";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogClose,
	DialogHeader,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import GroupTypeSelect from "./GroupTypeSelect";

const GroupSchema = z.object({
	id: z.number().int(),
	name: z.string().min(2),
	group_type: z.enum(["Mentor", "Mission", "Default", "Committee"]),
});

interface Props {
	open: boolean;
	onClose: () => void;
	selectedGroup: GroupRead;
	nollning_id: number;
}

const EditGroup = ({ open, onClose, selectedGroup, nollning_id }: Props) => {
	const form = useForm<z.infer<typeof GroupSchema>>({
		resolver: zodResolver(GroupSchema),
		defaultValues: {
			name: "",
			group_type: "Mentor",
		},
	});

	useEffect(() => {
		if (open && selectedGroup) {
			form.reset({
				...selectedGroup,
			});
		}
	}, [selectedGroup, form, open]);

	const queryClient = useQueryClient();

	const updateGroup = useMutation({
		...patchGroupMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getNollningQueryKey({
					path: { nollning_id: nollning_id },
				}),
			});
		},
		onError: () => {
			onClose();
		},
	});

	const removeGroup = useMutation({
		...removeGroupMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getNollningQueryKey({
					path: { nollning_id: nollning_id },
				}),
			});
		},
		onError: () => {
			onClose();
		},
	});

	function onSubmit(values: z.infer<typeof GroupSchema>) {
		updateGroup.mutate(
			{
				path: { id: values.id },
				body: {
					name: values.name,
					group_type: values.group_type,
				},
			},
			{
				onSuccess: () => {
					onClose();
				},
			},
		);
	}

	function onDelete() {
		removeGroup.mutate(
			{ path: { id: selectedGroup.id } },
			{
				onSuccess: () => {
					onClose();
				},
			},
		);
	}

	return (
		<div>
			<Dialog
				open={open}
				onOpenChange={(isOpen) => {
					if (!isOpen) {
						onClose();
					}
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="text-xl px-8 py-3 underline underline-offset-4 decoration-sidebar">
							Skapa Faddergrupp
						</DialogTitle>
					</DialogHeader>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)}>
							<div className="px-8 space-x-4 space-y-4">
								<FormField
									control={form.control}
									name={"name"}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Titel </FormLabel>
											<FormControl>
												<Input placeholder="Namn" {...field} />
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name={"group_type"}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Grupptyp</FormLabel>
											<GroupTypeSelect
												value={field.value}
												onChange={field.onChange}
											/>
										</FormItem>
									)}
								/>

								<Button type="submit" className="w-32 min-w-fit">
									Skapa
								</Button>
								<Button variant="destructive" onClick={onDelete}>
									Förinta
								</Button>
								<DialogClose>Avbryt</DialogClose>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default EditGroup;
