"use client";

import React, { useCallback, useEffect } from "react";
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
import { PlusIcon } from "lucide-react";
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
import { useTranslation } from "react-i18next";
import { AdminChooseCouncil } from "@/widgets/AdminChooseCouncil";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import EventFormFields from "@/app/admin/events/EventFormFields";

interface EventAddFormProps {
	start: Date;
	end: Date;
	editDescription: boolean;
	showButton?: boolean;
	enableAllDay?: boolean;
	enableTrueEventProperties?: boolean;
	enableCarProperties?: boolean;
}

export function EventAddForm({
	start,
	end,
	editDescription,
	showButton = true,
	enableAllDay = true,
	enableTrueEventProperties = false,
	enableCarProperties = false,
}: EventAddFormProps) {
	const { t } = useTranslation("calendar");

	const eventAddFormSchema = z
		.object({
			description_sv: editDescription
				? z
						.string({ required_error: t("add.error_description") })
						.min(1, { message: t("add.error_description") })
						.max(1000)
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
			...(!enableCarProperties
				? {
						title_sv: z
							.string({ required_error: t("add.error_title") })
							.min(1, { message: t("add.error_title") }),
					}
				: {}),
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
						lottery: z.boolean().default(false),
					}
				: {}),
			...(enableCarProperties
				? {
						personal: z.boolean().default(true),
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
				if (enableTrueEventProperties) {
					// Check if event is in the past
					if (data.start.getTime() < Date.now()) {
						return false;
					}
				}
				return true;
			},
			{
				message: t("error_past_event"),
				path: ["start"],
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

	const checkboxFields = [
		...(enableAllDay ? ["all_day"] : []),
		...(enableTrueEventProperties
			? [
					"recurring",
					"food",
					"closed",
					"can_signup",
					"drink_package",
					"is_nollning_event",
					"lottery",
				]
			: []),
		...(enableCarProperties ? ["personal"] : []),
	] as const;

	type EventAddFormValues = z.infer<typeof eventAddFormSchema>;
	const { events, addEvent } = useEvents();
	const { eventAddOpen, setEventAddOpen } = useEvents();

	const { toast } = useToast();

	const form = useForm<z.infer<typeof eventAddFormSchema>>({
		resolver: zodResolver(eventAddFormSchema),
		defaultValues: {
			// Not sure these are used
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
			lottery: false,
			personal: true,
		},
	});

	useEffect(() => {
		form.reset({
			title_sv: "",
			title_en: "",
			description_sv: "",
			description_en: "",
			start: start,
			end: end,
			all_day: false,
			color: "#76c7ef",
			...(enableTrueEventProperties
				? {
						council_id: 1,
						signup_start: new Date(Date.now() + 1000 * 60 * 60 * 1), // 1 hour later
						signup_end: new Date(Date.now() + 1000 * 60 * 60 * 3), // 3 hours later
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
						lottery: false,
					}
				: {}),
			...(enableCarProperties
				? {
						personal: true,
						council_id: 1,
					}
				: {}),
		});
	}, [form, start, end, enableTrueEventProperties, enableCarProperties]);

	const onSubmit = useCallback(
		async (data: EventAddFormValues) => {
			const newEvent = {
				id: String(events.length + 1),
				title_sv: data.title_sv ? (data.title_sv as string) : "",
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
							recurring: data.recurring,
							food: data.food,
							closed: data.closed,
							can_signup: data.can_signup,
							drink_package: data.drink_package,
							is_nollning_event: data.is_nollning_event,
							priorities: data.priorities ?? [],
							alcohol_event_type: data.alcohol_event_type,
							dress_code: data.dress_code,
							price: data.price,
							dot: data.dot,
							lottery: data.lottery,
						}
					: {}),
				...(enableCarProperties
					? {
							personal: data.personal,
							council_id: data.council_id,
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
		[
			events,
			addEvent,
			setEventAddOpen,
			toast,
			editDescription,
			t,
			enableTrueEventProperties,
			enableCarProperties,
		],
	);

	return (
		<AlertDialog open={eventAddOpen}>
			{showButton && (
				<AlertDialogTrigger className="flex" asChild>
					<Button
						className="w-fit text-xs md:text-sm"
						variant="default"
						onClick={() => setEventAddOpen(true)}
					>
						<PlusIcon className="md:h-5 md:w-5 h-3 w-3" />
						<p>{t("add.button")}</p>
					</Button>
				</AlertDialogTrigger>
			)}
			<AlertDialogContent className="min-w-fit lg:max-w-7xl max-2xl:top-0 max-2xl:translate-y-0">
				<AlertDialogDescription className="sr-only">
					A popup dialog to add a new event of some kind.
				</AlertDialogDescription>
				<AlertDialogHeader>
					<AlertDialogTitle>{t("add.add")}</AlertDialogTitle>
				</AlertDialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						{/* Only use EventFormFields if we have event properties */}
						{enableTrueEventProperties ? (
							<EventFormFields
								eventsForm={form as any}
								checkboxFields={
									checkboxFields
								}
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
														placeholder={t("add.placeholder.title")}
														{...field}
														value={field.value as string}
													/>
												</FormControl>
											</FormItem>
										)}
									/>
								)}

								{/* Title (en) */}
								{enableTrueEventProperties && (
									<FormField
										control={form.control}
										name="title_en"
										render={({ field }) => (
											<FormItem>
												<FormLabel>{t("admin:events.title_en")}</FormLabel>
												<FormControl>
													<Input
														placeholder={t("add.placeholder.title")}
														{...field}
														value={field.value as string}
													/>
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
													<FormLabel>
														{t("admin:events.description_sv")}
													</FormLabel>
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
														<FormLabel>
															{t("admin:events.description_en")}
														</FormLabel>
														<FormControl>
															<Textarea
																placeholder={t("add.placeholder.description")}
																className="max-h-36"
																{...field}
																value={field.value as string}
															/>
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
											<FormLabel htmlFor="datetime">
												{t("admin:events.start_time")}
											</FormLabel>
											<FormControl>
												<AdminChooseDates
													value={field.value as Date}
													onChange={(value) => {
														field.onChange(value);
														if (form.watch<"end">("end") < value) {
															const newEnd = new Date(
																value.getTime() + 1000 * 60 * 60 * 1,
															);
															form.setValue<"end">("end", newEnd, {
																shouldValidate: true,
																shouldDirty: true,
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
								{enableTrueEventProperties && (
									<>
										<FormField
											control={form.control}
											name="signup_start"
											render={({ field }) => (
												<FormItem className="flex flex-col">
													<FormLabel htmlFor="datetime">
														{t("admin:events.signup_start")}
													</FormLabel>
													<FormControl>
														<AdminChooseDates
															value={field.value as Date}
															onChange={(newSignupStart: Date) => {
																field.onChange(newSignupStart);
																const signupEnd = form.getValues(
																	"signup_end",
																) as Date;
																if (
																	signupEnd &&
																	signupEnd.getTime() < newSignupStart.getTime()
																) {
																	const newSignupEnd = new Date(
																		newSignupStart.getTime() + 60 * 60 * 1000,
																	);
																	form.setValue<"signup_end">(
																		"signup_end",
																		newSignupEnd,
																		{
																			shouldDirty: true,
																			shouldValidate: true,
																		},
																	);
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
											name="signup_end"
											render={({ field }) => (
												<FormItem className="flex flex-col">
													<FormLabel htmlFor="datetime">
														{t("admin:events.signup_end")}
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
									</>
								)}

								{/* Council */}
								{(enableTrueEventProperties || enableCarProperties) && (
									<FormField
										control={form.control}
										name="council_id"
										render={({ field }) => {
											const personalChecked = enableCarProperties
												? form.watch("personal")
												: false;
											return (
												<FormItem
													className={
														enableTrueEventProperties ? "lg:col-span-2" : ""
													}
												>
													<FormLabel>{t("admin:events.council")}</FormLabel>
													{enableCarProperties && personalChecked ? (
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
										name={fieldName as string}
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
							<AlertDialogCancel onClick={() => setEventAddOpen(false)}>
								{t("cancel")}
							</AlertDialogCancel>
							<AlertDialogAction type="submit">
								{t("add.add")}
							</AlertDialogAction>
						</AlertDialogFooter>
					</form>
				</Form>
			</AlertDialogContent>
		</AlertDialog>
	);
}
