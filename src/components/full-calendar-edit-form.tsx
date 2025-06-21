"use client";

import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "./ui/textarea";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
//import { DateTimePicker } from "./full-calendar-date-picker";
import { AdminChooseDates } from "@/widgets/AdminChooseDates";
import { useEvents } from "@/utils/full-calendar-event-context";
import { ToastAction } from "./ui/toast";
import type { CalendarEvent } from "@/utils/full-calendar-seed";
import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";
import { Checkbox } from "./ui/checkbox";
import { AdminChooseCouncil } from "@/widgets/AdminChooseCouncil";
import { AdminChoosePriorities } from "@/widgets/AdminChoosePriorities";


interface EventEditFormProps {
	oldEvent?: CalendarEvent;
	event?: CalendarEvent;
	isDrag: boolean;
	editDescription: boolean;
	showButton?: boolean;
	enableAllDay?: boolean;
	enableTrueEventProperties?: boolean; // This is cursed
}

export function EventEditForm({
	oldEvent,
	event,
	isDrag,
	editDescription,
	showButton = true,
	enableAllDay = true,
	enableTrueEventProperties = false,
}: EventEditFormProps) {
	const { t } = useTranslation("calendar");

	const eventEditFormSchema = z.object({
		id: z.string(),
		title_sv: z
			.string({ required_error: t("edit.error_title") })
			.min(1, { message: t("edit.error_title") }),
		description_sv: z
			.string({ required_error: t("edit.error_description") })
			.min(1, { message: t("edit.error_description") })
			.max(1000),
		start: z.date({
			required_error: t("edit.error_start_time"),
			invalid_type_error: t("edit.error_not_date"),
		}),
		end: z.date({
			required_error: t("edit.error_end_time"),
			invalid_type_error: t("edit.error_not_date"),
		}),
		all_day: z.boolean().default(false),
		color: z
			.string({ required_error: "Please select an event color." })
			.min(1, { message: "Must provide a title for this event." }),
		...(enableTrueEventProperties
			? {
					council_id: z.number().int().positive(),
					signup_start: z.date(),
					signup_end: z.date(),
					title_en: z.string().min(1),
					description_en: editDescription 
						? z.string({ required_error: t("add.error_description") })
							.min(1, { message: t("add.error_description") })
							.max(1000)
						: z.string().optional().default(""),
					location: z.string().max(100),
					max_event_users: z.coerce.number().nonnegative(),
					signup_not_opened_yet: z.boolean(),
					recurring: z.boolean(),
					drink: z.boolean(),
					food: z.boolean(),
					cash: z.boolean(),
					closed: z.boolean(),
					can_signup: z.boolean(),
					drink_package: z.boolean(),
					is_nollning_event: z.boolean(),
					priorities: z.array(z.string()).optional().default([]),
				}
			: {}),
	}).refine(
		(data) => {
			// Check if start time equals end time
			if (data.start.getTime() === data.end.getTime()) {
				return false;
			}

			// Check if start time is after end time
			if (data.start.getTime() > data.end.getTime()) {
				return false;
			}

			return true;
		},
		{
			message: t("error_start_end"),
			path: ["end"] // Shows the error on the end time field
		}
	);

	const checkboxFields = [
		...enableAllDay ? ["all_day"] : [],
		...enableTrueEventProperties ? [
			"signup_not_opened_yet",
			"recurring",
			"drink",
			"food",
			"cash",
			"closed",
			"can_signup",
			"drink_package",
			"is_nollning_event"
		] : [],
	] as const;

	type EventEditFormValues = z.infer<typeof eventEditFormSchema>;

	const { editEvent } = useEvents();
	const { eventEditOpen, setEventEditOpen } = useEvents();

	const { toast } = useToast();

	const form = useForm<z.infer<typeof eventEditFormSchema>>({
		resolver: zodResolver(eventEditFormSchema),
		defaultValues: {
			title_sv: "",
			title_en: "",
			description_sv: "",
			description_en: "",
			start: new Date(Date.now() + 1000 * 60 * 60 * 3), // 3 hours later 
			end: new Date(Date.now() + 1000 * 60 * 60 * 5), // 5 hours later
			signup_start: new Date(Date.now() + 1000 * 60 * 60 * 1), // 1 hour later 
			signup_end: new Date(Date.now() + 1000 * 60 * 60 * 3), // 3 hours later
			all_day: false,
			color: "#76c7ef",
			council_id: 1,
			location: "",
			max_event_users: 0,
			signup_not_opened_yet: false,
			recurring: false,
			drink: false,
			food: false,
			cash: false,
			closed: false,
			can_signup: false,
			drink_package: false,
			is_nollning_event: false,
			priorities: [],
		},
	});

	const handleEditCancellation = () => {
		// I think this code resets the event to its original state if it was dragged, and the editing was canceled. 
		if (isDrag && oldEvent) {
			const resetEvent = {
				id: oldEvent.id,
				title_sv: oldEvent.title_sv,
				description_sv: oldEvent.description_sv,
				start: oldEvent.start,
				end: oldEvent.end,
				all_day: oldEvent.all_day,
				color: oldEvent.backgroundColor!,
				...(enableTrueEventProperties
					? {
							council_id: oldEvent.council_id,
							signup_start: oldEvent.signup_start,
							signup_end: oldEvent.signup_end,
							title_en: oldEvent.title_en,
							description_en: oldEvent.description_en,
							location: oldEvent.location,
							max_event_users: oldEvent.max_event_users,
							signup_not_opened_yet: oldEvent.signup_not_opened_yet,
							recurring: oldEvent.recurring,
							drink: oldEvent.drink,
							food: oldEvent.food,
							cash: oldEvent.cash,
							closed: oldEvent.closed,
							can_signup: oldEvent.can_signup,
							drink_package: oldEvent.drink_package,
							is_nollning_event: oldEvent.is_nollning_event,
							priorities: oldEvent.priorities,
					  }
					: {}),
			};

			// deleteEvent(oldEvent.id);
			// addEvent(resetEvent);

			editEvent(resetEvent);
		}
		setEventEditOpen(false);
	};

	useEffect(() => {
		if (!event) return;
		form.reset({
			id: event?.id,
			title_sv: event?.title_sv,
			description_sv: event?.description_sv,
			start: event?.start as Date,
			end: event?.end as Date,
			all_day: event?.all_day as boolean,
			color: event?.backgroundColor,
			...(enableTrueEventProperties
				? {
						council_id: event?.council_id || 1,
						signup_start: event?.signup_start || new Date(Date.now() + 1000 * 60 * 60 * 1), // 1 hour later
						signup_end: event?.signup_end || new Date(Date.now() + 1000 * 60 * 60 * 3), // 3 hours later
						title_en: event?.title_en || "",
						description_en: event?.description_en || "",
						location: event?.location || "",
						max_event_users: event?.max_event_users || 0,
						signup_not_opened_yet: event?.signup_not_opened_yet || false,
						recurring: event?.recurring || false,
						drink: event?.drink || false,
						food: event?.food || false,
						cash: event?.cash || false,
						closed: event?.closed || false,
						can_signup: event?.can_signup || false,
						drink_package: event?.drink_package || false,
						is_nollning_event: event?.is_nollning_event || false,
						priorities: event?.priorities || [],
				  }
				: {}),
		});
	}, [form, event, enableTrueEventProperties]);

	async function onSubmit(data: EventEditFormValues) {
		const newEvent = {
			id: oldEvent ? oldEvent.id : data.id,
			title_sv: data.title_sv,
			description_sv: data.description_sv,
			start: data.start,
			end: data.end,
			all_day: data.all_day ?? false,
			color: data.color,
			...(enableTrueEventProperties
				? {
						council_id: data.council_id,
						signup_start: data.signup_start,
						signup_end: data.signup_end,
						title_en: data.title_en,
						description_en: data.description_en,
						location: data.location,
						max_event_users: data.max_event_users,
						signup_not_opened_yet: data.signup_not_opened_yet,
						recurring: data.recurring,
						drink: data.drink,
						food: data.food,
						cash: data.cash,
						closed: data.closed,
						can_signup: data.can_signup,
						drink_package: data.drink_package,
						is_nollning_event: data.is_nollning_event,
						priorities: data.priorities,
				  }
				: {}),
		};
		editEvent(newEvent);
		setEventEditOpen(false);

		toast({ 
			title: t("edit.toast.title"),
			action: (
				<ToastAction altText={t("edit.toast.dismiss_alt")}>
					{t("edit.toast.dismiss")}
				</ToastAction>
			),
		});
	}

	return (
		<AlertDialog open={eventEditOpen}>
			{showButton && (
				<AlertDialogTrigger asChild>
					<Button
						className="w-full sm:w-24 text-xs md:text-sm mb-1"
						variant="default"
						onClick={() => {
							setEventEditOpen(true);
						}}
					>
						{t("edit.button")}
					</Button>
				</AlertDialogTrigger>
			)}

			<AlertDialogContent className="min-w-fit lg:max-w-7xl">
				<AlertDialogDescription className="sr-only">
					A popup dialog to edit an event.
				</AlertDialogDescription>
				<AlertDialogHeader>
					<AlertDialogTitle>{t("edit.edit")} "{event?.title_sv}"</AlertDialogTitle>
				</AlertDialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-x-4 gap-y-3 lg:grid-cols-4">

						<FormField
							control={form.control}
							name="title_sv"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("edit.title_sv")}</FormLabel>
									<FormControl>
										<Input placeholder={t("edit.placeholder.title")} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Title (en) */}
						{enableTrueEventProperties && (
							<FormField
								control={form.control}
								name="title_en"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("edit.title_en")}</FormLabel>
										<FormControl>
											<Input placeholder={t("edit:placeholder.title")} {...field} value={field.value as string} />
										</FormControl>
									</FormItem>
								)}
							/>
						)}

						{editDescription && (
							<>
								<FormField
									control={form.control}
									name="description_sv"
									render={({ field }) => (
										<FormItem className="">
											<FormLabel>{t("edit.description_sv")}</FormLabel>
											<FormControl>
												<Textarea
													placeholder={t("edit.placeholder.description")}
													className="max-h-36"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{enableTrueEventProperties && (
									<FormField
										control={form.control}
										name="description_en"
										render={({ field }) => (
											<FormItem className="">
												<FormLabel>{t("edit.description_en")}</FormLabel>
												<FormControl>
													<Textarea
														placeholder={t("edit.placeholder.description")}
														className="max-h-36"
														{...field}
														value={field.value as string}
													/>
												</FormControl>
											</FormItem>
										)}
									/>
								)}
							</>
						)}

						<FormField
							control={form.control}
							name="start"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel htmlFor="datetime">{t("edit.start_time")}</FormLabel>
									<FormControl>
										<AdminChooseDates
											value={field.value as Date}
											onChange={field.onChange}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="end"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel htmlFor="datetime">{t("edit.end_time")}</FormLabel>
									<FormControl>
										<AdminChooseDates
											value={field.value as Date}
											onChange={field.onChange}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{enableTrueEventProperties && (
							<>
								<FormField
									control={form.control}
									name="signup_start"
									render={({ field }) => (
										<FormItem className="flex flex-col">
											<FormLabel htmlFor="datetime">{t("edit.signup_start")}</FormLabel>
											<FormControl>
												<AdminChooseDates
													value={field.value as Date}
													onChange={field.onChange}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="signup_end"
									render={({ field }) => (
										<FormItem className="flex flex-col">
											<FormLabel htmlFor="datetime">{t("edit.signup_end")}</FormLabel>
											<FormControl>
												<AdminChooseDates
													value={field.value as Date}
													onChange={field.onChange}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</>
						)}

						{/* Council */}
						{enableTrueEventProperties && (
							<FormField
								control={form.control}
								name="council_id"
								render={({ field }) => (
									<FormItem className="lg:col-span-2">
										<FormLabel>{t("edit.council")}</FormLabel>
										<AdminChooseCouncil
											value={field.value as number}
											onChange={
												(value: number) => {
													field.onChange(value);
												}
											}
										/>
									</FormItem>
								)}
							/>
						)}

						{/* Priorities */}
						{enableTrueEventProperties && (
							<FormField
								control={form.control}
								name="priorities"
								render={({ field }) => (
									<FormItem className="lg:col-span-2 w-full">
										<FormLabel>{t("edit.priorities")}</FormLabel>
										<AdminChoosePriorities
											value={field.value as string[] ?? []}
											onChange={(value) => field.onChange(value)}
											className="text-sm"
										/>
									</FormItem>
								)}
							/>
						)}

						{/* Location */}
						{enableTrueEventProperties && (
							<FormField
								control={form.control}
								name="location"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("edit.location")}</FormLabel>
										<FormControl>
											<Input {...field} value={field.value as string} />
										</FormControl>
									</FormItem>
								)}
							/>
						)}

						{/* Max event users */}
						{enableTrueEventProperties && (
							<FormField
								control={form.control}
								name="max_event_users"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("edit.max_event_users")}</FormLabel>
										<FormControl>
											<Input type="number" {...field} value={field.value as number} />
										</FormControl>
									</FormItem>
								)}
							/>
						)}

						{/* Checkbox fields */}
						{checkboxFields.map((fieldName) => (
							<FormField
								key={fieldName}
								control={form.control}
								name={fieldName}
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t(`edit.${fieldName}`)}</FormLabel>
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

						{/* Not used
						<FormField
							control={form.control}
							name="color"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Color (ignored)</FormLabel>
									<FormControl>
										<Popover>
											<PopoverTrigger asChild className="cursor-pointer">
												<div className="flex flex-row w-full items-center space-x-2 pl-2">
													<div
														className={`w-5 h-5 rounded-full cursor-pointer`}
														style={{ backgroundColor: field.value }}
													/>
													<Input {...field} />
												</div>
											</PopoverTrigger>
											<PopoverContent className="flex mx-auto items-center justify-center">
												<HexColorPicker
													className="flex"
													color={field.value}
													onChange={field.onChange}
												/>
											</PopoverContent>
										</Popover>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						*/}
						<AlertDialogFooter className="pt-2">
							<AlertDialogCancel onClick={() => handleEditCancellation()}>
								{t("cancel")}
							</AlertDialogCancel>
							<AlertDialogAction type="submit">{t("save")}</AlertDialogAction>
						</AlertDialogFooter>
					</form>
				</Form>
			</AlertDialogContent>
		</AlertDialog>
	);
}
