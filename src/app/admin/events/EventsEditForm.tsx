import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AdminChooseCouncil } from "@/widgets/AdminChooseCouncil";
import { AdminChooseDates } from "@/widgets/AdminChooseDates";
import {
	getAllEventsQueryKey,
	eventUpdateMutation,
	eventRemoveMutation,
} from "@/api/@tanstack/react-query.gen";
import type { EventRead, EventUpdate } from "@/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@/components/ui/checkbox";
import AdminChoosePriorities from "@/widgets/AdminChoosePriorities";

const eventsEditSchema = z.object({
	id: z.number(),
	title_sv: z.string().min(1),
	title_en: z.string().min(1),
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
});

type EventsEditFormType = z.infer<typeof eventsEditSchema>;

interface EventsEditFormProps {
	open: boolean;
	onClose: () => void;
	selectedEvent: EventRead;
}

export default function EventsEditForm({
	open,
	onClose,
	selectedEvent,
}: EventsEditFormProps) {
	const { t } = useTranslation();

	const form = useForm<EventsEditFormType>({
		resolver: zodResolver(eventsEditSchema),
		defaultValues: { // Values for when no event is selected
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

	useEffect(() => {
		if (open && selectedEvent) {
			form.reset({
				...selectedEvent,
				starts_at: new Date(selectedEvent.starts_at),
				ends_at: new Date(selectedEvent.ends_at),
				signup_start: new Date(selectedEvent.signup_start),
				signup_end: new Date(selectedEvent.signup_end),
				priorities: selectedEvent.priorities.map((i) => i.priority),
			});
		}
	}, [selectedEvent, form, open]);

	const queryClient = useQueryClient();

	const updateEvent = useMutation({
		...eventUpdateMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllEventsQueryKey() });
		},
		onError: () => {
			onClose();
		},
	});

	const removeEvent = useMutation({
		...eventRemoveMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllEventsQueryKey() });
		},
		onError: () => {
			onClose();
		},
	});

	function handleFormSubmit(values: EventsEditFormType) {
		const updatedEvent: EventUpdate = {
			...values,
			priorities: values.priorities as EventUpdate["priorities"],
		};

		updateEvent.mutate(
			{
				path: { event_id: values.id },
				body: updatedEvent,
			},
			{
				onSuccess: () => {
					onClose();
				},
			},
		);
	}

	function handleRemoveSubmit() {
		removeEvent.mutate(
			{ path: { event_id: form.getValues("id") } },
			{
				onSuccess: () => {
					onClose();
				},
			},
		);
	}

	// TODO: Fix how this entire form is created in code. Way too much code duplication.
	return (
		<Dialog
			open={open}
			onOpenChange={(isOpen) => {
				if (!isOpen) {
					onClose();
				}
			}}
		>
			{" "}
			<DialogContent className="min-w-fit lg:max-w-7xl">
				<DialogHeader>
					<DialogTitle>{t("admin:events.edit_booking")}</DialogTitle>
				</DialogHeader>
				<hr />
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleFormSubmit)}
						className="grid gap-x-4 gap-y-3 lg:grid-cols-4"
					>
						{/* Title (sv) */}
						<FormField
							control={form.control}
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

						{/* Title (en) */}
						<FormField
							control={form.control}
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

						{/* Council */}
						<FormField
							control={form.control}
							name="council_id"
							render={({ field }) => (
								<FormItem className="lg:col-span-2">
									<FormLabel>{t("admin:events.council")}</FormLabel>
									<AdminChooseCouncil
										value={field.value}
										onChange={
											(value: number) => {
												console.log("Council ID:", value);
												field.onChange(value);
											}
										}
									/>
								</FormItem>
							)}
						/>

						{/* Priorities */}
						<FormField
							control={form.control}
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

						{/* Starts at */}
						<FormField
							control={form.control}
							name="starts_at"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("admin:events.start_time")}</FormLabel>
									<AdminChooseDates
										value={field.value}
										onChange={field.onChange}
									/>
								</FormItem>
							)}
						/>

						{/* Ends at */}
						<FormField
							control={form.control}
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

						{/* Signup start */}
						<FormField
							control={form.control}
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

						{/* Signup end */}
						<FormField
							control={form.control}
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
							control={form.control}
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
							control={form.control}
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
							control={form.control}
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
							control={form.control}
							name="max_event_users"
							render={({ field }) => (	
								<FormItem>
									<FormLabel>{t("admin:events.max_event_users")}</FormLabel>
									<FormControl>
										<Input
											type="number"
											placeholder={t("admin:events.max_event_users")}
											{...field}
          						// value={Number(field.value)}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						{/* Checkbox fields */}
						{checkboxFields.map((fieldName) => (
							<FormField
								key={fieldName}
								control={form.control}
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
							<Button
								variant="outline"
								className="w-32 min-w-fit"
								onClick={() => console.log("Preview clicked")}
							>
								{t("admin:preview")}
							</Button>

							<Button
								variant="destructive"
								type="button"
								className="w-32 min-w-fit"
								onClick={handleRemoveSubmit}
							>
								{t("admin:remove")}
							</Button>

							<Button type="submit" className="w-32 min-w-fit">
								{t("admin:save")}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
