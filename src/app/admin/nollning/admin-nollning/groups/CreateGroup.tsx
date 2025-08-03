import {
	addGroupToNollningMutation,
	getGroupsQueryKey,
	getNollningQueryKey,
	uploadGroupMutation,
} from "@/api/@tanstack/react-query.gen";
import { Button } from "@/components/ui/button";
import {
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
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
import { Dialog } from "@radix-ui/react-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import GroupTypeSelect from "./GroupTypeSelect";
import { ValueSetter } from "node_modules/date-fns/parse/_lib/Setter";

const GroupSchema = z.object({
	name: z.string().min(2),
	group_type: z.enum(["Mentor", "Mission"]),
	nollning_group_number: z.coerce.number().min(1).optional(),
});

interface Props {
	nollningID: number;
	className?: string;
}

const CreateAdventureMission = ({ nollningID, className }: Props) => {
	const [open, setOpen] = useState(false);
	const [pendingGroupNumber, setPendingGroupNumber] = useState<number | undefined>(
		undefined
	);

	const groupForm = useForm<z.infer<typeof GroupSchema>>({
		resolver: zodResolver(GroupSchema),
		defaultValues: {
			name: "",
			group_type: "Mentor",
			nollning_group_number: undefined,
		},
	});

	const queryClient = useQueryClient();

	const createGroup = useMutation({
		...uploadGroupMutation(),
		onSuccess: (group) => {
			addGroupToNollning.mutate({
				path: { nollning_id: nollningID },
				body: {
					group_id: group.id,
					nollning_group_number: pendingGroupNumber,
				},
			});
			queryClient.invalidateQueries({
				queryKey: getGroupsQueryKey(),
			});
			setOpen(false);
			setPendingGroupNumber(undefined);
		},
		onError: () => {
			setPendingGroupNumber(undefined);
			setOpen(false);
		},
	});

	const addGroupToNollning = useMutation({
		...addGroupToNollningMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getNollningQueryKey({
					path: { nollning_id: nollningID },
				}),
			});
			setOpen(false);
		},
		onError: () => {
			setOpen(false);
		},
	});

	function onSubmit(values: z.infer<typeof GroupSchema>) {
		setPendingGroupNumber(values.nollning_group_number);
		createGroup.mutate({
			body: {
				name: values.name,
				group_type: values.group_type,
			},
		});
	}

	return (
		<div>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<Button
						className={className}
						onClick={() => {
							groupForm.reset();
						}}
					>
						Skapa Faddergrupp
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="text-3xl py-3 font-bold text-primary">
							Skapa Faddergrupp
						</DialogTitle>
					</DialogHeader>
					<Form {...groupForm}>
						<form onSubmit={groupForm.handleSubmit(onSubmit)}>
							<div className="px-8 space-x-4 space-y-4">
								<FormField
									control={groupForm.control}
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
									control={groupForm.control}
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
								<FormField
									control={groupForm.control}
									name={"nollning_group_number"}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Gruppnummer</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="Gruppnummer"
													value={field.value === undefined ? "" : field.value}
													onChange={e => {
														const val = e.target.value;
														field.onChange(val === "" ? undefined : Number(val));
													}}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
								<Button type="submit" className="w-32 min-w-fit">
									Skapa
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

export default CreateAdventureMission;
