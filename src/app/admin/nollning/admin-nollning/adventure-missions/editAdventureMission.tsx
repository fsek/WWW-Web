import type { AdventureMissionRead } from "@/api";
import {
	deleteAdventureMissionMutation,
	editAdventureMissionMutation,
	getNollningByYearQueryKey,
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
import { useState } from "react";
import { toast } from "sonner";

const AdventureMissionSchema = z.object({
	title_sv: z.string().min(2),
	title_en: z.string().min(2),
	description_sv: z.string().min(2),
	description_en: z.string().min(2),
	max_points: z.number().min(1),
	min_points: z.number().min(0),
	nollning_week: z.number().min(0).max(4),
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
			title_sv: "",
			title_en: "",
			description_sv: "",
			description_en: "",
			max_points: 1,
			min_points: 0,
			nollning_week: 0,
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
			queryClient.invalidateQueries({
				queryKey: getNollningByYearQueryKey({
					path: { year: new Date().getFullYear() },
				}),
			});
			toast.success("Äventyrsuppdrag uppdaterat!");
		},
		onError: () => {
			toast.error("Kunde inte uppdatera äventyrsuppdrag.");
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
			queryClient.invalidateQueries({
				queryKey: getNollningByYearQueryKey({
					path: { year: new Date().getFullYear() },
				}),
			});
			toast.success("Äventyrsuppdrag raderat!");
		},
		onError: () => {
			toast.error("Kunde inte radera äventyrsuppdrag.");
			onClose();
		},
	});

	function onSubmit(values: z.infer<typeof AdventureMissionSchema>) {
		updateAdventureMission.mutate(
			{
				path: { mission_id: selectedMission.id },
				body: {
					title_sv: values.title_sv,
					title_en: values.title_en,
					description_sv: values.description_sv,
					description_en: values.description_en,
					max_points: values.max_points,
					min_points: values.min_points,
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
			{
				path: { mission_id: selectedMission.id },
				query: { nollning_id: nollning_id },
			},
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
			onOpenChange={(open) => {
				if (!open) {
					onClose();
				}
			}}
		>
			<DialogContent className="min-w-fit lg:max-w-7xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Redigera Äventyrsuppdrag</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit, (error) =>
							console.log(error),
						)}
						className="w-full"
					>
						<div className="px-8 space-x-4 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
							<FormField
								control={form.control}
								name={"title_sv"}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Titel (Svenska)</FormLabel>
										<FormControl>
											<Input placeholder="Titel" {...field} />
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name={"title_en"}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Titel (Engelska)</FormLabel>
										<FormControl>
											<Input placeholder="Titel" {...field} />
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name={"description_sv"}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Beskrivning (Svenska)</FormLabel>
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
								name={"description_en"}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Beskrivning (Engelska)</FormLabel>
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
												value={
													typeof field.value === "number" && !Number.isNaN(field.value)
														? field.value
														: ""
												}
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
												placeholder="1"
												value={
													typeof field.value === "number" && !Number.isNaN(field.value)
														? field.value
														: ""
												}
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
												value={
													typeof field.value === "number" && !Number.isNaN(field.value)
														? field.value
														: ""
												}
												onChange={(e) => field.onChange(e.target.valueAsNumber)}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						</div>
						<div className="flex flex-row justify-end space-x-2 mt-4">
							<Button
								type="button"
								variant="outline"
								onClick={onClose}
								className="w-32 min-w-fit"
							>
								Avbryt
							</Button>
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
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export default EditAdventureMission;
