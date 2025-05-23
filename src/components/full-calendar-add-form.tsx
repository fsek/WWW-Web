"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
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
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { PlusIcon } from "lucide-react";
import { HexColorPicker } from "react-colorful";
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
// import { DateTimePicker } from "./full-calendar-date-picker";
import { AdminChooseDates } from "@/widgets/AdminChooseDates";
import { useEvents } from "@/utils/full-calendar-event-context";
import { ToastAction } from "./ui/toast";
import { useTranslation } from "react-i18next";
import { AdminChooseCouncil } from "@/widgets/AdminChooseCouncil";
import { Checkbox } from "./ui/checkbox";

interface EventAddFormProps {
	start: Date;
	end: Date;
	editDescription: boolean;
	showButton?: boolean;
	enableAllDay?: boolean;
	enableTrueEventProperties?: boolean;
}

export function EventAddForm({
	start,
	end,
	editDescription,
	showButton = true,
	enableAllDay = true,
	enableTrueEventProperties = false,
}: EventAddFormProps) {
	const { t } = useTranslation("calendar");

	const eventAddFormSchema = z.object({
		title_sv: z
			.string({ required_error: t("add.error_title") })
			.min(1, { message: t("add.error_title") }),
		description_sv: editDescription 
			? z.string({ required_error: t("add.error_description") })
				.min(1, { message: t("add.error_description") })
			: z.string().optional().default(""),
		start: z.date({
			required_error: t("add.error_start_time"),
			invalid_type_error: t("add.error_not_date"),
		}),
		end: z.date({
			required_error: t("add.error_end_time"),
			invalid_type_error: t("add.error_not_date"),
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
					description_en: z.string().max(1000),
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

	type EventAddFormValues = z.infer<typeof eventAddFormSchema>;
	const { events, addEvent } = useEvents();
	const { eventAddOpen, setEventAddOpen } = useEvents();

	const { toast } = useToast();

	const form = useForm<z.infer<typeof eventAddFormSchema>>({
		resolver: zodResolver(eventAddFormSchema),
		defaultValues: { // Not sure these are used
			title_sv: "",
			title_en: "",
			description_sv: "",
			description_en: "",
			start: start as Date,
			end: end as Date,
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
		},
	});

	useEffect(() => {
		form.reset({
      title_sv: "",
      description_sv: "",
      start: start,
      end: end,
			all_day: false,
      color: "#76c7ef",
			...(enableTrueEventProperties ? {
				council_id: 1,
				signup_start: new Date(Date.now() + 1000 * 60 * 60 * 1), // 1 hour later
				signup_end: new Date(Date.now() + 1000 * 60 * 60 * 3), // 3 hours later
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
			} : {}),
    });
	}, [form, start, end, enableTrueEventProperties]);

	const onSubmit = useCallback(
		async (data: EventAddFormValues) => {
			const newEvent = {
				id: String(events.length + 1),
				title_sv: data.title_sv,
				description_sv: editDescription ? data.description_sv : "",
				start: data.start,
				end: data.end,
				all_day: data.all_day,
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
						priorities: []
				  }
				: {}),
			};
			addEvent(newEvent);
			setEventAddOpen(false);
			toast({
				title: t("add.toast.title"),
				action: (
					<ToastAction altText={t("add.toast.dismiss_alt")}>
						{t("add.toast.dismiss")}
					</ToastAction>
				),
			});
		},
		[events, addEvent, setEventAddOpen, toast, editDescription, t, enableTrueEventProperties],
	);

	return (
		<AlertDialog open={eventAddOpen}>
			{showButton && (
				<AlertDialogTrigger className="flex" asChild>
					<Button
						className="w-24 md:w-28 text-xs md:text-sm"
						variant="default"
						onClick={() => setEventAddOpen(true)}
					>
						<PlusIcon className="md:h-5 md:w-5 h-3 w-3" />
						<p>{t("add.button")}</p>
					</Button>
				</AlertDialogTrigger>
			)}
			<AlertDialogContent className="min-w-fit lg:max-w-7xl">
				<AlertDialogDescription className="sr-only">
					A popup dialog to add a new event of some kind.
				</AlertDialogDescription>
				<AlertDialogHeader>
					<AlertDialogTitle>{t("add.add")}</AlertDialogTitle>
				</AlertDialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-x-4 gap-y-3 lg:grid-cols-4">
						<FormField
							control={form.control}
							name="title_sv"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("add.title_sv")}</FormLabel>
									<FormControl>
										<Input placeholder={t("add.placeholder.title")} {...field} />
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
										<FormLabel>{t("add.title_en")}</FormLabel>
										<FormControl>
											<Input placeholder={t("add.placeholder.title")} {...field} value={field.value as string} />
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
										<FormItem>
											<FormLabel>{t("add.description_sv")}</FormLabel>
											<FormControl>
												<Textarea
													placeholder={t("add.placeholder.description")}
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
											<FormItem>
												<FormLabel>{t("add.description_en")}</FormLabel>
												<FormControl>
													<Input placeholder={t("add.placeholder.description")} {...field} value={field.value as string} />
												</FormControl>
												<FormMessage />
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
									<FormLabel htmlFor="datetime">{t("add.start_time")}</FormLabel>
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
									<FormLabel htmlFor="datetime">{t("add.end_time")}</FormLabel>
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
											<FormLabel htmlFor="datetime">{t("add.signup_start")}</FormLabel>
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
											<FormLabel htmlFor="datetime">{t("add.signup_end")}</FormLabel>
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
										<FormLabel>{t("add.council")}</FormLabel>
										<AdminChooseCouncil
											value={field.value as number}
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
						)}

						{/* Location */}
						{enableTrueEventProperties && (
							<FormField
								control={form.control}
								name="location"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("add.location")}</FormLabel>
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
										<FormLabel>{t("add.max_event_users")}</FormLabel>
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
										<FormLabel>{t(`add.${fieldName}`)}</FormLabel>
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
									<FormLabel>Color</FormLabel>
									<FormControl>
										<Popover>
											<PopoverTrigger asChild className="cursor-pointer">
												<div className="flex flex-row w-full items-center space-x-2 pl-2">
													<div
														className={`w-5 h-5 rounded-full cursor-pointer`}
														style={{ backgroundColor: field.value }}
													></div>
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
							<AlertDialogCancel onClick={() => setEventAddOpen(false)}>
								{t("cancel")}
							</AlertDialogCancel>
							<AlertDialogAction type="submit">{t("add.add")}</AlertDialogAction>
						</AlertDialogFooter>
					</form>
				</Form>
			</AlertDialogContent>
		</AlertDialog>
	);
}
