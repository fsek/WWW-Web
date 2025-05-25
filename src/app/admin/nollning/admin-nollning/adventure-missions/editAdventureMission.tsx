import type { AdventureMissionRead } from "@/api";
import {
	deleteAdventureMissionMutation,
	editAdventureMissionMutation,
	getNollningQueryKey,
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

const AdventureMissionSchema = z.object({
	title: z.string().min(2),
	description: z.string().min(2),
	max_points: z.number().min(1),
	min_points: z.number().min(0),
	nollning_week: z.number().min(1).max(5),
});

interface Props {
	open: boolean;
	onClose: () => void;
	selectedMission: AdventureMissionRead;
	nollning_id: number;
}

const EditAdventureMission = ({
	open,
	onClose,
	selectedMission,
	nollning_id,
}: Props) => {
	const form = useForm<z.infer<typeof AdventureMissionSchema>>({
		resolver: zodResolver(AdventureMissionSchema),
		defaultValues: {
			title: "",
			description: "",
			max_points: 1,
			min_points: 1,
			nollning_week: 1,
		},
	});

	useEffect(() => {
		if (open && selectedMission) {
			form.reset({
				...selectedMission,
			});
		}
	}, [selectedMission, form, open]);

	const queryClient = useQueryClient();

	const updateAdventureMission = useMutation({
		...editAdventureMissionMutation(),
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

	const removeAdventureMission = useMutation({
		...deleteAdventureMissionMutation(),
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

	function onSubmit(values: z.infer<typeof AdventureMissionSchema>) {
		updateAdventureMission.mutate(
			{
				path: { mission_id: selectedMission.id },
				body: {
					title: values.title,
					description: values.description,
					max_points: values.max_points,
					min_points: values.min_points,
					nollning_id: nollning_id,
					nollning_week: values.nollning_week,
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
		removeAdventureMission.mutate(
			{ path: { mission_id: selectedMission.id } },
			{
				onSuccess: () => {
					onClose();
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
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Redigera Äventyrsuppdrag</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit, (error) =>
							console.log(error),
						)}
					>
						<div className="px-8 space-x-4">
							<FormField
								control={form.control}
								name={"title"}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Titel </FormLabel>
										<FormControl>
											<Input placeholder="Titel" {...field} />
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name={"description"}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Beskrivning</FormLabel>
										<FormControl>
											<textarea
												className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
												placeholder="Beskrivning"
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name={"min_points"}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Min Poäng </FormLabel>
										<FormControl>
											<Input
												type="number"
												placeholder="0"
												{...field}
												onChange={(e) => field.onChange(e.target.valueAsNumber)}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name={"max_points"}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Max Poäng </FormLabel>
										<FormControl>
											<Input
												type="number"
												placeholder="0"
												{...field}
												onChange={(e) => field.onChange(e.target.valueAsNumber)}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name={"nollning_week"}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Vecka </FormLabel>
										<FormControl>
											<Input
												type="number"
												placeholder="0"
												{...field}
												onChange={(e) => field.onChange(e.target.valueAsNumber)}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							<Button type="submit" className="w-32 min-w-fit">
								Spara
							</Button>
							<Button
								variant="destructive"
								type="button"
								className="w-32 min-w-fit"
								onClick={onDelete}
							>
								Förinta
							</Button>
							<DialogClose>Avbryt</DialogClose>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export default EditAdventureMission;
