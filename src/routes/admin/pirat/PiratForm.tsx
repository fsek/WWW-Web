import { useState, useEffect } from "react";
import { type CarRead, CarsService } from "../../../api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DateTimePicker } from "../../../widgets/DateTimePicker";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogTitle } from "@radix-ui/react-dialog";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createBookingMutation,
	createBookingOptions,
	getAllBookingQueryKey,
} from "@/api/@tanstack/react-query.gen";

const bookingSchema = z.object({
	description: z.string().min(2),
	start_time: z.date(),
	end_time: z.date(),
});

export default function NewsForm() {
	const [open, setOpen] = useState(false);
	const [submitEnabled, setSubmitEnabled] = useState(true);
	const bookingForm = useForm<z.infer<typeof bookingSchema>>({
		resolver: zodResolver(bookingSchema),
	});

	const createBooking = useMutation({
		...createBookingMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllBookingQueryKey() });
			setOpen(false);
			setSubmitEnabled(true);
		},
	});

	const queryClient = useQueryClient();

	function onSubmit(values: z.infer<typeof bookingSchema>) {
		// Do something with the form values.
		// ✅ This will be type-safe and validated.
		setSubmitEnabled(false);
		createBooking.mutate({
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
					bookingForm.reset();
					setOpen(true);
					setSubmitEnabled(true);
				}}
			>
				Skapa nyhet
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="min-w-fit lg:max-w-7xl">
					<DialogHeader>
						<DialogTitle>Skapa nyhet</DialogTitle>
					</DialogHeader>
					<hr />
					<Form {...bookingForm}>
						<form
							onSubmit={bookingForm.handleSubmit(onSubmit)}
							className="w-full border border-gray-300 rounded-md p-2 space-y-5"
						>
							<FormField
								control={bookingForm.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Titel (sv)</FormLabel>
										<FormControl>
											<Input placeholder="description..." {...field} />
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={bookingForm.control}
								name="start_time"
								render={({ field }) => (
									<FormItem className="flex w-72 flex-col gap-2">
										<FormLabel htmlFor="datetime">Start time</FormLabel>
										<FormControl>
											<DateTimePicker
												value={field.value}
												onChange={field.onChange}
												granularity="minute"
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={bookingForm.control}
								name="end_time"
								render={({ field }) => (
									<FormItem className="flex w-72 flex-col gap-2">
										<FormLabel htmlFor="datetime">End time</FormLabel>
										<FormControl>
											<DateTimePicker
												value={field.value}
												onChange={field.onChange}
												granularity="minute"
											/>
										</FormControl>
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
