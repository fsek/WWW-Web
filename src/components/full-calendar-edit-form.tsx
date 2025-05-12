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
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
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
//import { DateTimePicker } from "./full-calendar-date-picker";
import { AdminChooseDates } from "@/widgets/AdminChooseDates";
import { useEvents } from "@/utils/full-calendar-event-context";
import { ToastAction } from "./ui/toast";
import type { CalendarEvent } from "@/utils/full-calendar-seed";
import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";


interface EventEditFormProps {
	oldEvent?: CalendarEvent;
	event?: CalendarEvent;
	isDrag: boolean;
	editDescription: boolean;
	showButton?: boolean;
	enableAllDay?: boolean;
}

export function EventEditForm({
	oldEvent,
	event,
	isDrag,
	editDescription,
	showButton = true,
	enableAllDay = true,
}: EventEditFormProps) {
	const { t } = useTranslation("calendar");

	const eventEditFormSchema = z.object({
		id: z.string(),
		title_sv: z
			.string({ required_error: t("edit.error_title") })
			.min(1, { message: t("edit.error_title") }),
		description_sv: z
			.string({ required_error: t("edit.error_description") })
			.min(1, { message: t("edit.error_description") }),
		start: z.date({
			required_error: t("edit.error_start_time"),
			invalid_type_error: t("edit.error_not_date"),
		}),
		end: z.date({
			required_error: t("edit.error_end_time"),
			invalid_type_error: t("edit.error_not_date"),
		}),
		allDay: z.boolean().default(false),
		color: z
			.string({ required_error: "Please select an event color." })
			.min(1, { message: "Must provide a title for this event." }),
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

	type EventEditFormValues = z.infer<typeof eventEditFormSchema>;

	const { editEvent } = useEvents();
	const { eventEditOpen, setEventEditOpen } = useEvents();

	const { toast } = useToast();

	const form = useForm<z.infer<typeof eventEditFormSchema>>({
		resolver: zodResolver(eventEditFormSchema),
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
				allDay: oldEvent.allDay,
				color: oldEvent.backgroundColor!,
			};

			// deleteEvent(oldEvent.id);
			// addEvent(resetEvent);

			editEvent(resetEvent);
		}
		setEventEditOpen(false);
	};

	useEffect(() => {
		form.reset({
			id: event?.id,
			title_sv: event?.title_sv,
			description_sv: event?.description_sv,
			start: event?.start as Date,
			end: event?.end as Date,
			allDay: event?.allDay,
			color: event?.backgroundColor,
		});
	}, [form, event]);

	async function onSubmit(data: EventEditFormValues) {
		const newEvent = {
			id: oldEvent ? oldEvent.id : data.id,
			title_sv: data.title_sv,
			description_sv: data.description_sv,
			start: data.start,
			end: data.end,
			allDay: data.allDay ?? false,
			color: data.color,
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

			<AlertDialogContent>
				<AlertDialogDescription className="sr-only">
					A popup dialog to edit an event.
				</AlertDialogDescription>
				<AlertDialogHeader>
					<AlertDialogTitle>{t("edit.edit")} "{event?.title_sv}"</AlertDialogTitle>
				</AlertDialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2.5">
						<FormField
							control={form.control}
							name="title_sv"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("edit.title")}</FormLabel>
									<FormControl>
										<Input placeholder={t("edit.placeholder.title")} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						{editDescription && (
							<FormField
								control={form.control}
								name="description_sv"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("edit.description")}</FormLabel>
										<FormControl>
											<Textarea
												placeholder={t("edit.placeholder.description")}
												className="resize-none"
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
									<FormLabel htmlFor="datetime">{t("edit.start_time")}</FormLabel>
									<FormControl>
										<AdminChooseDates
											value={field.value}
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
											value={field.value}
											onChange={field.onChange}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						{enableAllDay && (
							<FormField
								control={form.control}
								name="allDay"
								render={({ field }) => (
									<FormItem className="flex flex-row items-center space-x-2">
										<FormControl>
											<input
												type="checkbox"
												className="cursor-pointer"
												checked={field.value}
												onChange={(e) => field.onChange(e.target.checked)}
											/>
										</FormControl>
										<FormLabel>{t("edit.all_day")}</FormLabel>
									</FormItem>
								)}
							/>
						)}
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
