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
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface Props {
	nollning: NollningRead;
}

const nollningSchema = z.object({
	id: z.number(),
	name: z.string().min(1),
	description: z.string().min(1),
});

const EditNollning = ({ nollning }: Props) => {
	const [open, setOpen] = useState(false);

	const nollningForm = useForm<z.infer<typeof nollningSchema>>({
		resolver: zodResolver(nollningSchema),
		defaultValues: {
			id: nollning.id,
			name: nollning.name,
			description: nollning.description,
		},
	});

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
						<DialogTitle className="text-xl px-8 py-3 underline underline-offset-4 decoration-sidebar">
							Redigera Nollning
						</DialogTitle>
					</DialogHeader>
					<Form {...nollningForm}>
						<form onSubmit={nollningForm.handleSubmit(onSubmit)}>
							<div className="px-8 space-x-4">
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
