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
	createEventMutation,
	getAllEventsQueryKey,
} from "@/api/@tanstack/react-query.gen";

import { AdminChooseCouncil } from "@/widgets/AdminChooseCouncil";
import { AdminChooseDates } from "@/widgets/AdminChooseDates";

const eventsSchema = z.object({
	title_sv: z.string().min(2),
	title_en: z.string().min(2),
	council_id: z.number().int(),
	starts_at: z.date(),
	ends_at: z.date(),
	signup_start: z.date(),
	signup_end: z.date(),
	description_sv: z.string().max(1000),
	description_en: z.string().max(1000),
	max_event_users: z.number(),
	priorities: z.array(z.string()),
	all_day: z.boolean(),
	signup_not_opened_yet: z.boolean(),
	recurring: z.boolean(),
	drink: z.boolean(),
	food: z.boolean(),
	cash: z.boolean(),
	closed: z.boolean(),
	can_signup: z.boolean(),
	drink_package: z.boolean(),
});

export default function EventsForm() {
	const [open, setOpen] = useState(false);
	const [submitEnabled, setSubmitEnabled] = useState(true);

	const eventsForm = useForm<z.infer<typeof eventsSchema>>({
		resolver: zodResolver(eventsSchema),
		defaultValues: {
			title_sv: "",
			title_en: "",
			council_id: 0,
			starts_at: new Date("2025-01-31T18:00"),
			ends_at: new Date("2025-01-31T20:00"),
			signup_start: new Date("2025-01-31T18:00"),
			signup_end: new Date("2025-01-31T20:00"),
			description_sv: "",
			description_en: "",
			max_event_users: 0,
			priorities: [],
			all_day: false,
			signup_not_opened_yet: false,
			recurring: false,
			drink: false,
			food: false,
			cash: false,
			closed: false,
			can_signup: false,
			drink_package: false,
		},
	});

	const queryClient = useQueryClient();

	const createEvents = useMutation({
		...createEventMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllEventsQueryKey() });
			setOpen(false);
			setSubmitEnabled(true);
		},
	});

	function onSubmit(values: z.infer<typeof eventsSchema>) {
		setSubmitEnabled(false);
		createEvents.mutate({
			body: {
				title_sv: values.title_sv,
				title_en: values.title_en,
				council_id: values.council_id,
				starts_at: values.starts_at,
				ends_at: values.ends_at,
				signup_start: values.signup_start,
				signup_end: values.signup_end,
				description_sv: values.description_sv,
				description_en: values.description_en,
				max_event_users: values.max_event_users,
				priorities: [],
				all_day: values.all_day,
				signup_not_opened_yet: values.signup_not_opened_yet,
				recurring: values.recurring,
				drink: values.drink,
				food: values.food,
				cash: values.cash,
				closed: values.closed,
				can_signup: values.can_signup,
				drink_package: values.drink_package,
			},
		});
	}

	return (
		<div className="p-3">
			<Button
				onClick={() => {
					eventsForm.reset();
					setOpen(true);
					setSubmitEnabled(true);
				}}
			>
				Skapa event
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="min-w-fit lg:max-w-7xl">
					<DialogHeader>
						<DialogTitle>Skapa event</DialogTitle>
					</DialogHeader>
					<hr />
					<Form {...eventsForm}>
						<form
							onSubmit={eventsForm.handleSubmit(onSubmit)}
							className="grid gap-x-4 gap-y-3 lg:grid-cols-4"
						>
							<FormField
								control={eventsForm.control}
								name="title_sv"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Titel (sv)</FormLabel>
										<FormControl>
											<Input placeholder="Titel" {...field} />
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={eventsForm.control}
								name="title_en"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Titel (en)</FormLabel>
										<FormControl>
											<Input placeholder="Title" {...field} />
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={eventsForm.control}
								name="council_id"
								render={({ field }) => (
									<FormItem className="lg:col-span-2">
										<FormLabel>Council name</FormLabel>
										<AdminChooseCouncil
											value={field.value}
											onChange={field.onChange}
										/>
									</FormItem>
								)}
							/>

							<FormField
								control={eventsForm.control}
								name="starts_at"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Starttime</FormLabel>
										<AdminChooseDates
											value={field.value}
											onChange={field.onChange}
										/>
									</FormItem>
								)}
							/>

							<FormField
								control={eventsForm.control}
								name="ends_at"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Endtime</FormLabel>
										<AdminChooseDates
											value={field.value}
											onChange={field.onChange}
										/>
									</FormItem>
								)}
							/>

							<FormField
								control={eventsForm.control}
								name="signup_start"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Signup start</FormLabel>
										<AdminChooseDates
											value={field.value}
											onChange={field.onChange}
										/>
									</FormItem>
								)}
							/>

							<FormField
								control={eventsForm.control}
								name="signup_end"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Signup end</FormLabel>
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
