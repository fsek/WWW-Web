import {
	createAdventureMissionMutation,
	getNollningQueryKey,
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
	nollningID: number;
}

const CreateAdventureMission = ({ nollningID }: Props) => {
	const [open, setOpen] = useState(false);

	const adventureMissionForm = useForm<z.infer<typeof AdventureMissionSchema>>({
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

	const queryClient = useQueryClient();

	const createAdventureMission = useMutation({
		...createAdventureMissionMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getNollningQueryKey({
					path: { nollning_id: nollningID },
				}),
			});
			toast.success("Äventyrsuppdrag skapat!");
			setOpen(false);
		},
		onError: () => {
			toast.error("Kunde inte skapa äventyrsuppdrag.");
			setOpen(false);
		},
	});

	function onSubmit(values: z.infer<typeof AdventureMissionSchema>) {
		console.log("hejHejHej");
		createAdventureMission.mutate({
			body: {
				title_sv: values.title_sv,
				title_en: values.title_en,
				description_sv: values.description_sv,
				description_en: values.description_en,
				max_points: values.max_points,
				min_points: values.min_points,
				nollning_week: values.nollning_week,
			},
			path: { nollning_id: nollningID },
		});
	}

	return (
		<div>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<Button
						onClick={() => {
							adventureMissionForm.reset();
						}}
					>
						Skapa Äventyrsuppdrag
					</Button>
				</DialogTrigger>
				<DialogContent className="min-w-fit lg:max-w-7xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="text-3xl py-3 font-bold text-primary">
							Skapa Äventyrsuppdrag
						</DialogTitle>
					</DialogHeader>
					<Form {...adventureMissionForm} >
						<form onSubmit={adventureMissionForm.handleSubmit(onSubmit)} className="w-full">
							<div className="px-8 space-x-4 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
								<FormField
									control={adventureMissionForm.control}
									name={"title_sv"}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Titel (Svenska) </FormLabel>
											<FormControl>
												<Input placeholder="Titel" {...field} />
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={adventureMissionForm.control}
									name={"title_en"}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Titel (Engelska) </FormLabel>
											<FormControl>
												<Input placeholder="Titel" {...field} />
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={adventureMissionForm.control}
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
									control={adventureMissionForm.control}
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
									control={adventureMissionForm.control}
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
													onChange={(e) =>
														field.onChange(e.target.valueAsNumber)
													}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={adventureMissionForm.control}
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
													onChange={(e) =>
														field.onChange(e.target.valueAsNumber)
													}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={adventureMissionForm.control}
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
													onChange={(e) =>
														field.onChange(e.target.valueAsNumber)
													}
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
									onClick={() => setOpen(false)}
									className="w-32 min-w-fit"
								>
									Avbryt
								</Button>
								<Button type="submit" className="w-32 min-w-fit">
									Skapa
								</Button>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default CreateAdventureMission;
