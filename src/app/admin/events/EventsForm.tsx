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
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "react-i18next";
import { AdminChoosePriorities } from "@/widgets/AdminChoosePriorities";
import { EventCreate } from "@/api/types.gen";

const eventsSchema = z.object({
	title_sv: z.string().min(2),
	title_en: z.string().min(2),
	council_id: z.number().int().positive(),
	starts_at: z.date(),
	ends_at: z.date(),
	signup_start: z.date(),
	signup_end: z.date(),
	description_sv: z.string().max(1000).min(1),
	description_en: z.string().max(1000).min(1),
	location: z.string().max(100),
	max_event_users: z.coerce.number().nonnegative(),
	priorities: z.array(z.string()).optional().default([]),
	all_day: z.boolean(),
	signup_not_opened_yet: z.boolean(),
	recurring: z.boolean(),
	drink: z.boolean(),
	food: z.boolean(),
	cash: z.boolean(),
	closed: z.boolean(),
	can_signup: z.boolean(),
	drink_package: z.boolean(),
	is_nollning_event: z.boolean(),
}).refine(
	(data) => {
		// Check if event is in the past
		if (data.starts_at.getTime() < Date.now()) {
			return false;
		}
		return true;
	},
	{
		message: "Event start time cannot be in the past",
		path: ["starts_at"],
	}
);

export default function EventsForm() {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const [submitEnabled, setSubmitEnabled] = useState(true);

	const eventsForm = useForm<z.infer<typeof eventsSchema>>({
		resolver: zodResolver(eventsSchema),
		defaultValues: {
			title_sv: "",
			title_en: "",
			council_id: 0,
			starts_at: new Date(Date.now() + 1000 * 60 * 60 * 3), // 3 hours later 
			ends_at: new Date(Date.now() + 1000 * 60 * 60 * 5), // 5 hours later
			signup_start: new Date(Date.now() + 1000 * 60 * 60 * 1), // 1 hour later 
			signup_end: new Date(Date.now() + 1000 * 60 * 60 * 3), // 3 hours later 
			description_sv: "",
			description_en: "",
			location: "",
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
			is_nollning_event: false,
		},
	});

	const checkboxFields = [
		"all_day",
		"signup_not_opened_yet",
		"recurring",
		"drink",
		"food",
		"cash",
		"closed",
		"can_signup",
		"drink_package",
		"is_nollning_event"
	] as const;

	const queryClient = useQueryClient();

	const createEvents = useMutation({
		...createEventMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllEventsQueryKey() });
			setOpen(false);
			setSubmitEnabled(true);
		},
		onError: () => {
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
				location: values.location,
				max_event_users: values.max_event_users,
				priorities: values.priorities as EventCreate["priorities"],
				all_day: values.all_day,
				signup_not_opened_yet: values.signup_not_opened_yet,
				recurring: values.recurring,
				drink: values.drink,
				food: values.food,
				cash: values.cash,
				closed: values.closed,
				can_signup: values.can_signup,
				drink_package: values.drink_package,
				is_nollning_event: values.is_nollning_event,
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
				{t("admin:events.create_event")}
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="min-w-fit lg:max-w-7xl">
					<DialogHeader>
						<DialogTitle>{t("admin:events.create_event")}</DialogTitle>
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
										<FormLabel>{t("admin:events.title_sv")}</FormLabel>
										<FormControl>
											<Input placeholder={t("admin:events.title_sv")} {...field} />
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={eventsForm.control}
								name="title_en"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("admin:events.title_en")}</FormLabel>
										<FormControl>
											<Input placeholder={t("admin:events.title_en")} {...field} />
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={eventsForm.control}
								name="council_id"
								render={({ field }) => (
									<FormItem className="lg:col-span-2">
										<FormLabel>{t("admin:events.council")}</FormLabel>
										<AdminChooseCouncil
											value={field.value}
											onChange={field.onChange}
										/>
									</FormItem>
								)}
							/>

							{/* Priorities */}
							<FormField
								control={eventsForm.control}
								name="priorities"
								render={({ field }) => (
									<FormItem className="lg:col-span-2 w-full">
										<FormLabel>{t("admin:events.priorities")}</FormLabel>
										<AdminChoosePriorities
											value={field.value as string[] ?? []}
											onChange={(value) => field.onChange(value)}
											className="text-sm"
										/>
									</FormItem>
								)}
							/>
							

							<FormField
								control={eventsForm.control}
								name="starts_at"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("admin:events.start_time")}</FormLabel>
										<AdminChooseDates
											value={field.value}
											onChange={field.onChange}
										/>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={eventsForm.control}
								name="ends_at"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("admin:events.end_time")}</FormLabel>
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
										<FormLabel>{t("admin:events.signup_start")}</FormLabel>
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
										<FormLabel>{t("admin:events.signup_end")}</FormLabel>
										<AdminChooseDates
											value={field.value}
											onChange={field.onChange}
										/>
									</FormItem>
								)}
							/>

							{/* Description (sv) */}
							<FormField
								control={eventsForm.control}
								name="description_sv"
								render={({ field }) => (
									<FormItem className="lg:col-span-2">
										<FormLabel>{t("admin:events.description_sv")}</FormLabel>
										<FormControl>
											<Textarea
												placeholder={t("admin:events.description_sv")}
												className="max-h-36"
												{...field}
												value={field.value as string}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							{/* Description (en) */}
							<FormField
								control={eventsForm.control}
								name="description_en"
								render={({ field }) => (
									<FormItem className="lg:col-span-2">
										<FormLabel>{t("admin:events.description_en")}</FormLabel>
										<FormControl>
											<Textarea
												placeholder={t("admin:events.description_en")}
												className="max-h-36"
												{...field}
												value={field.value as string}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							{/* Location */}
							<FormField
								control={eventsForm.control}
								name="location"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("admin:events.location")}</FormLabel>
										<FormControl>
											<Input placeholder={t("admin:events.location")} {...field} />
										</FormControl>
									</FormItem>
								)}
							/>

							{/* Max event users */}
							<FormField
								control={eventsForm.control}
								name="max_event_users"
								render={({ field }) => (	
									<FormItem>
										<FormLabel>{t("admin:events.max_event_users")}</FormLabel>
										<FormControl>
											<Input
												type="number"
												placeholder={t("admin:events.max_event_users")}
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							{/* Checkbox fields */}
							{checkboxFields.map((fieldName) => (
								<FormField
									key={fieldName}
									control={eventsForm.control}
									name={fieldName}
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t(`admin:events.${fieldName}`)}</FormLabel>
											<FormControl>
												<Checkbox
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
							))}

							<div className="space-x-2 lg:col-span-2 lg:grid-cols-subgrid">
								<Button variant="outline" className="w-32 min-w-fit">
									{t("admin:preview")}
								</Button>
								<Button
									type="submit"
									disabled={!submitEnabled}
									className="w-32 min-w-fit"
								>
									{t("admin:submit")}
								</Button>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
