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
import type React from "react";
import { useEffect } from "react";
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
	children?: React.ReactNode;
}

const EditGroup = ({
	open,
	onClose,
	selectedGroup,
	nollning_id,
	children,
}: Props) => {
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
				<DialogContent className="px-10 py-8 space-y-2">
					<DialogHeader>
						<DialogTitle className=" px-4 text-2xl underline underline-offset-4 ">
							{selectedGroup?.name ?? "ingen grupp vald :(("}
						</DialogTitle>
					</DialogHeader>
					<div className="border border-gray-300 rounded-lg">
						<div className="space-y-4 p-4">
							<h3 className="underline underline-offset-2 ">
								Administrera faddergrupp
							</h3>
							{children}
						</div>
					</div>
					<Form {...form}>
						<form
							className="border border-gray-300 rounded-lg "
							onSubmit={form.handleSubmit(onSubmit)}
						>
							<div className="space-x-4 space-y-4 p-4">
								<h3 className="underline underline-offset-2 ">
									Redigera Faddergrupp
								</h3>
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

								<div className=" space-x-2 flex flex-row w-full">
									<Button type="submit" className="flex-1">
										Spara ändringar
									</Button>
									<Button
										variant="destructive"
										type="button"
										className="flex-1"
										onClick={onDelete}
									>
										Förinta
									</Button>
								</div>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default EditGroup;
