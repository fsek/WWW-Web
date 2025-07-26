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
import { AdminChooseDates } from "@/widgets/AdminChooseDates";
import { useEvents } from "@/utils/full-calendar-event-context";
import { ToastAction } from "./ui/toast";
import type { CalendarEvent } from "@/utils/full-calendar-seed";
import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";
import { Checkbox } from "./ui/checkbox";
import { AdminChooseCouncil } from "@/widgets/AdminChooseCouncil";
import { Label } from "./ui/label";
import EventFormFields from "@/app/admin/events/EventFormFields";
import { Save } from "lucide-react";

interface EventEditFormProps {
	oldEvent?: CalendarEvent;
	event?: CalendarEvent;
	isDrag: boolean;
	editDescription: boolean;
	showButton?: boolean;
	enableAllDay?: boolean;
	enableTrueEventProperties?: boolean; // This is cursed
	enableCarProperties?: boolean;
	disableConfirmField?: boolean;
}

export function EventEditForm({
	oldEvent,
	event,
	isDrag,
	editDescription,
	showButton = true,
	enableAllDay = true,
	enableTrueEventProperties = false,
	enableCarProperties = false,
	disableConfirmField = false,
}: EventEditFormProps) {
	const { t } = useTranslation("calendar");

	const eventEditFormSchema = z
		.object({
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
							? z
									.string({ required_error: t("add.error_description") })
									.min(1, { message: t("add.error_description") })
									.max(1000)
							: z.string().optional().default(""),
						location: z.string().max(100),
						max_event_users: z.coerce.number().nonnegative(),
						recurring: z.boolean(),
						food: z.boolean(),
						closed: z.boolean(),
						can_signup: z.boolean(),
						drink_package: z.boolean(),
						is_nollning_event: z.boolean(),
						priorities: z.array(z.string()).optional().default([]),
						alcohol_event_type: z
							.enum(["Alcohol", "Alcohol-Served", "None"])
							.default("None"),
						dress_code: z.string().max(100).optional().default(""),
						price: z.coerce.number().nonnegative().optional().default(0),
						dot: z.enum(["None", "Single", "Double"]).default("None"),
					}
				: {}),
			...(enableCarProperties
				? {
						personal: z.boolean().default(true),
						confirmed: z.boolean().default(false),
						council_id: z.number().int().positive(),
					}
				: {}),
		})
		.refine(
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
				path: ["end"], // Shows the error on the end time field
			},
		)
		.refine(
			(data) => {
				if (enableCarProperties) {
					// Check if personal is false and council_id is not set
					if (data.personal === false && !data.council_id) {
						return false;
					}
				}
				return true;
			},
			{
				message: t("error_missing_council"),
				path: ["council_id"],
			},
		);

	const checkboxFields: readonly string[] = [
		...(enableAllDay ? ["all_day"] : []),
		...(enableTrueEventProperties
			? [
					"recurring",
					"food",
					"closed",
					"can_signup",
					"drink_package",
					"is_nollning_event",
				]
			: []),
		...(enableCarProperties && !disableConfirmField ? ["confirmed"] : []),
		...(enableCarProperties ? ["personal"] : []),
	];

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
			recurring: false,
			food: false,
			closed: false,
			can_signup: false,
			drink_package: false,
			is_nollning_event: false,
			priorities: [],
			alcohol_event_type: "None",
			dress_code: "",
			price: 0,
			dot: "None",
			personal: true,
			confirmed: false,
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
				color: oldEvent.backgroundColor,
				...(enableTrueEventProperties
					? {
							council_id: oldEvent.council_id,
							signup_start: oldEvent.signup_start,
							signup_end: oldEvent.signup_end,
							title_en: oldEvent.title_en,
							description_en: oldEvent.description_en,
							location: oldEvent.location,
							max_event_users: oldEvent.max_event_users,
							recurring: oldEvent.recurring,
							food: oldEvent.food,
							closed: oldEvent.closed,
							can_signup: oldEvent.can_signup,
							drink_package: oldEvent.drink_package,
							is_nollning_event: oldEvent.is_nollning_event,
							priorities: oldEvent.priorities,
							alcohol_event_type: oldEvent.alcohol_event_type,
							dress_code: oldEvent.dress_code,
							price: oldEvent.price,
							dot: oldEvent.dot,
						}
					: {}),
				...(enableCarProperties
					? {
							personal: oldEvent.personal,
							council_id: oldEvent.council_id,
							confirmed: oldEvent.confirmed,
							council_name_sv: oldEvent.council_name_sv,
							council_name_en: oldEvent.council_name_en,
							user_id: oldEvent.user_id,
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
						signup_start:
							event?.signup_start || new Date(Date.now() + 1000 * 60 * 60 * 1), // 1 hour later
						signup_end:
							event?.signup_end || new Date(Date.now() + 1000 * 60 * 60 * 3), // 3 hours later
						title_en: event?.title_en || "",
						description_en: event?.description_en || "",
						location: event?.location || "",
						max_event_users: event?.max_event_users || 0,
						recurring: event?.recurring || false,
						food: event?.food || false,
						closed: event?.closed || false,
						can_signup: event?.can_signup || false,
						drink_package: event?.drink_package || false,
						is_nollning_event: event?.is_nollning_event || false,
						priorities: event?.priorities || [],
						alcohol_event_type: event?.alcohol_event_type || "None",
						dress_code: event?.dress_code || "",
						price: event?.price || 0,
						dot: event?.dot || "None",
					}
				: {}),
			...(enableCarProperties
				? {
						personal: event?.personal ?? true,
						council_id: event?.council_id || 1,
						confirmed: event?.confirmed ?? false,
						council_name_sv: event?.council_name_sv || "",
						council_name_en: event?.council_name_en || "",
						user_id: event?.user_id ?? undefined,
					}
				: {}),
		});
	}, [form, event, enableTrueEventProperties, enableCarProperties]);

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
						recurring: data.recurring,
						food: data.food,
						closed: data.closed,
						can_signup: data.can_signup,
						drink_package: data.drink_package,
						is_nollning_event: data.is_nollning_event,
						priorities: data.priorities,
						alcohol_event_type: data.alcohol_event_type,
						dress_code: data.dress_code,
						price: data.price,
						dot: data.dot,
					}
				: {}),
			...(enableCarProperties
				? {
						personal: data.personal,
						council_id: data.council_id,
						confirmed: data.confirmed,
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

			<AlertDialogContent className="min-w-fit lg:max-w-7xl max-2xl:top-0 max-2xl:translate-y-0">
				<AlertDialogDescription className="sr-only">
					A popup dialog to edit an event.
				</AlertDialogDescription>
				<AlertDialogHeader>
					<AlertDialogTitle>
						{t("edit.edit")} "{event?.title_sv}"
					</AlertDialogTitle>
				</AlertDialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						{/* Only use EventFormFields if we have event properties */}
						{enableTrueEventProperties ? (
							<EventFormFields
								eventsForm={form as any}
								checkboxFields={checkboxFields}
							/>
						) : (
							<div className="grid gap-x-4 gap-y-3 lg:grid-cols-4">
								{/* Title (sv) */}
								{!enableCarProperties && (
									<FormField
										control={form.control}
										name="title_sv"
										render={({ field }) => (
											<FormItem>
												<FormLabel>{t("admin:events.title_sv")}</FormLabel>
												<FormControl>
													<Input
														placeholder={t("edit.placeholder.title")}
														{...field}
														value={field.value as string}
													/>
												</FormControl>
											</FormItem>
										)}
									/>
								)}

								{editDescription && (
									<FormField
										control={form.control}
										name="description_sv"
										render={({ field }) => (
											<FormItem className="">
												<FormLabel>
													{t("admin:events.description_sv")}
												</FormLabel>
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
								)}

								<FormField
									control={form.control}
									name="start"
									render={({ field }) => (
										<FormItem className="flex flex-col">
											<FormLabel htmlFor="datetime">
												{t("admin:events.start_time")}
											</FormLabel>
											<FormControl>
												<AdminChooseDates
													value={field.value as Date}
													onChange={(newStart: Date) => {
														field.onChange(newStart);
														const end = form.getValues("end") as Date;
														if (end && end.getTime() < newStart.getTime()) {
															const newEnd = new Date(
																newStart.getTime() + 60 * 60 * 1000,
															);
															form.setValue<"end">("end", newEnd, {
																shouldDirty: true,
																shouldValidate: true,
															});
														}
													}}
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
											<FormLabel htmlFor="datetime">
												{t("admin:events.end_time")}
											</FormLabel>
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

								{/* Car specific fields */}
								{enableCarProperties && (
									<FormField
										control={form.control}
										name="council_id"
										render={({ field }) => {
											const personalChecked = form.watch("personal");
											return (
												<FormItem>
													<FormLabel>{t("admin:events.council")}</FormLabel>
													{personalChecked ? (
														<div className="text-muted-foreground text-sm py-2">
															{t("admin:car.no_council_needed")}
														</div>
													) : (
														<AdminChooseCouncil
															value={field.value as number}
															onChange={(value: number) =>
																field.onChange(value)
															}
														/>
													)}
													<FormMessage />
												</FormItem>
											);
										}}
									/>
								)}

								{/* Checkbox fields */}
								{checkboxFields.map((fieldName) => (
									<FormField
										key={fieldName}
										control={form.control}
										name={fieldName as any}
										render={({ field }) => (
											<Label className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-muted-foreground has-[[aria-checked=true]]:bg-accent">
												<Checkbox
													checked={field.value}
													onCheckedChange={field.onChange}
													className="data-[state=checked]:border-[var(--wavelength-612-color-light)] data-[state=checked]:bg-[var(--wavelength-612-color-light)] data-[state=checked]:text-white"
												/>
												<div className="grid gap-1.5 font-normal">
													<p className="text-sm leading-none font-medium">
														{t(`admin:events.${fieldName}`)}
													</p>
												</div>
											</Label>
										)}
									/>
								))}
							</div>
						)}

						<AlertDialogFooter className="pt-2">
							<AlertDialogCancel onClick={() => handleEditCancellation()}>
								{t("cancel")}
							</AlertDialogCancel>
							<AlertDialogAction type="submit">
								<Save />
								{t("save")}
							</AlertDialogAction>
						</AlertDialogFooter>
					</form>
				</Form>
			</AlertDialogContent>
		</AlertDialog>
	);
}