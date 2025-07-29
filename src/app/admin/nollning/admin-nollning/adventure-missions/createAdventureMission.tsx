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

const AdventureMissionSchema = z.object({
	title: z.string().min(2),
	description: z.string().min(2),
	max_points: z.number().min(1),
	min_points: z.number().min(0),
	nollning_week: z.number().min(1).max(5),
});

interface Props {
	nollningID: number;
}

const CreateAdventureMission = ({ nollningID }: Props) => {
	const [open, setOpen] = useState(false);

	const adventureMissionForm = useForm<z.infer<typeof AdventureMissionSchema>>({
		resolver: zodResolver(AdventureMissionSchema),
		defaultValues: {
			title: "",
			description: "",
			max_points: 1,
			min_points: 1,
			nollning_week: 1,
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
			setOpen(false);
		},
		onError: () => {
			setOpen(false);
		},
	});

	function onSubmit(values: z.infer<typeof AdventureMissionSchema>) {
		console.log("hejHejHej");
		createAdventureMission.mutate({
			body: {
				title: values.title,
				description: values.description,
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
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="text-3xl py-3 underline underline-offset-4">
							Skapa Äventyrsuppdrag
						</DialogTitle>
					</DialogHeader>
					<Form {...adventureMissionForm}>
						<form onSubmit={adventureMissionForm.handleSubmit(onSubmit)}>
							<div className="px-8 space-x-4">
								<FormField
									control={adventureMissionForm.control}
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
									control={adventureMissionForm.control}
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
									control={adventureMissionForm.control}
									name={"min_points"}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Min Poäng </FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="0"
													{...field}
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
													placeholder="0"
													{...field}
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
													{...field}
													onChange={(e) =>
														field.onChange(e.target.valueAsNumber)
													}
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
