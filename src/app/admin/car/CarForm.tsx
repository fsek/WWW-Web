import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogTitle } from "@radix-ui/react-dialog";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	createBookingMutation,
	getAllBookingQueryKey,
} from "@/api/@tanstack/react-query.gen";

import { AdminChooseDates } from "@/widgets/AdminChooseDates";

const carSchema = z.object({
	description: z.string().min(2),
	start_time: z.date(),
	end_time: z.date(),
});

export default function CarForm() {
	const [open, setOpen] = useState(false);
	const [submitEnabled, setSubmitEnabled] = useState(true);

	const carForm = useForm<z.infer<typeof carSchema>>({
		resolver: zodResolver(carSchema),
		defaultValues: {
			description: "skriv in en beskrivning",
			start_time: new Date(Date.now()),
			end_time: new Date(Date.now() + 1000 * 60 * 60 * 3),
		},
	});

	// https://next.jqueryscript.net/shadcn-ui/full-calendar-component-shadcn-ui/

	const queryClient = useQueryClient();

	const createBookings = useMutation({
		...createBookingMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllBookingQueryKey() });
			setOpen(false);
			setSubmitEnabled(true);
		},
	});

	function onSubmit(values: z.infer<typeof carSchema>) {
		setSubmitEnabled(false);
		createBookings.mutate({
			body: {
				description: values.description,
				start_time: values.start_time,
				end_time: values.end_time,
			},
		});
	}

	return (
		<div className="p-3">
			<Button
				onClick={() => {
					carForm.reset();
					setOpen(true);
					setSubmitEnabled(true);
				}}
			>
				Skapa bokning
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="min-w-fit lg:max-w-7xl">
					<DialogHeader>
						<DialogTitle>Skapa bokning</DialogTitle>
					</DialogHeader>
					<hr />
					<Form {...carForm}>
						<form
							onSubmit={carForm.handleSubmit(onSubmit)}
							className="grid gap-x-4 gap-y-3 lg:grid-cols-4"
						>
							<FormField
								control={carForm.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Beskrivning</FormLabel>
										<FormControl>
											<Input placeholder="Beskrivning..." {...field} />
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={carForm.control}
								name="start_time"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Start time</FormLabel>
										<AdminChooseDates
											value={field.value}
											onChange={field.onChange}
										/>
									</FormItem>
								)}
							/>
							<FormField
								control={carForm.control}
								name="end_time"
								render={({ field }) => (
									<FormItem>
										<FormLabel>End time</FormLabel>
										<AdminChooseDates
											value={field.value}
											onChange={field.onChange}
										/>
									</FormItem>
								)}
							/>

							<div className="space-x-2 lg:col-span-2 lg:grid-cols-subgrid">
								<Button variant="outline" className="w-32 min-w-fit">
									Förhandsgranska
								</Button>
								<Button
									type="submit"
									disabled={!submitEnabled}
									className="w-32 min-w-fit"
								>
									Publicera
								</Button>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
