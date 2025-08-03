import {
	getAllNollningQueryKey,
	postNollningMutation,
} from "@/api/@tanstack/react-query.gen";
import { Button } from "@/components/ui/button";
import {
	DialogClose,
	DialogContent,
	DialogHeader,
} from "@/components/ui/dialog";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogTitle, DialogTrigger } from "@radix-ui/react-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

const nollningSchema = z.object({
	name: z.string().min(1),
	description: z.string().min(1),
	year: z.coerce.number().min(1960).max(2100),
});

const CreateNollning = () => {
	const [open, setOpen] = useState(false);

	const nollningForm = useForm<z.infer<typeof nollningSchema>>({
		resolver: zodResolver(nollningSchema),
		defaultValues: {
			name: "",
			description: "",
			year: new Date().getFullYear(),
		},
	});

	const queryClient = useQueryClient();

	const createNollning = useMutation({
		...postNollningMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllNollningQueryKey() });
			toast.success("Nollning skapad!");
			setOpen(false);
		},
		onError: () => {
			toast.error("Kunde inte skapa nollning.");
			setOpen(false);
		},
	});

	function onSubmit(values: z.infer<typeof nollningSchema>) {
		createNollning.mutate({
			body: {
				name: values.name,
				description: values.description,
				year: values.year,
			},
		});
	}

	return (
		<div>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<Button
						onClick={() => {
							nollningForm.reset();
						}}
					>
						<Plus />
						Skapa Nollning
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="text-3xl py-3 font-bold text-primary">
							Skapa Nollning
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
												<Input placeholder="Namn" {...field} />
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
													placeholder="År"
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
													placeholder="Beskrivning"
													{...field}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
								<Button
									type="submit"
									className="w-32 min-w-fit"
									disabled={createNollning.isPending}
								>
									{createNollning.isPending ? "Skapar..." : "Skapa"}
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

export default CreateNollning;
