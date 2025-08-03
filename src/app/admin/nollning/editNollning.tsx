import type { NollningRead } from "@/api";
import {
	getAllNollningQueryKey,
	patchNollningMutation,
} from "@/api/@tanstack/react-query.gen";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogTitle,
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
import { DialogTrigger } from "@radix-ui/react-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface Props {
	nollning: NollningRead;
}

const nollningSchema = z.object({
	id: z.number(),
	name: z.string().min(1),
	description: z.string().min(1),
	year: z.coerce.number().min(1960).max(2100),
});

const EditNollning = ({ nollning }: Props) => {
	const [open, setOpen] = useState(false);

	const nollningForm = useForm<z.infer<typeof nollningSchema>>({
		resolver: zodResolver(nollningSchema),
	});

	useEffect(() => {
		nollningForm.reset({
			id: nollning.id,
			name: nollning.name,
			description: nollning.description,
			year: nollning.year,
		});
	}, [nollning, nollningForm]);

	const queryClient = useQueryClient();

	const editNollning = useMutation({
		...patchNollningMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllNollningQueryKey() });
			setOpen(false);
		},
		onError: () => {
			setOpen(false);
		},
	});

	const onSubmit = (values: z.infer<typeof nollningSchema>) => {
		editNollning.mutate({
			path: { nollning_id: values.id },
			body: {
				name: values.name,
				description: values.description,
				year: values.year,
			},
		});
	};

	return (
		<div>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<Button
						onClick={() => {
							nollningForm.reset();
						}}
					>
						Redigera Nollning
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="text-3xl py-3 font-bold text-primary">
							Redigera Nollning
						</DialogTitle>
					</DialogHeader>
					<Form {...nollningForm}>
						<form onSubmit={nollningForm.handleSubmit(onSubmit)}>
							<div className="px-8 space-x-4 space-y-4">
								<FormField
									control={nollningForm.control}
									name={"name"}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Namn </FormLabel>
											<FormControl>
												<Input placeholder={nollning.name} {...field} />
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={nollningForm.control}
									name={"year"}
									render={({ field }) => (
										<FormItem>
											<FormLabel>År</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder={nollning.year.toString()}
													{...field}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={nollningForm.control}
									name={"description"}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Beskrivning</FormLabel>
											<FormControl>
												<textarea
													className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
													{...field}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
								<Button type="submit" className="w-32 min-w-fit">
									Spara
								</Button>

								<DialogClose type="button" className="w-32 min-w-fit">
									Avbryt
								</DialogClose>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default EditNollning;
