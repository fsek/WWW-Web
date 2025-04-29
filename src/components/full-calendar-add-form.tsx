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

interface EventAddFormProps {
	start: Date;
	end: Date;
	showDescription: boolean;
}

export function EventAddForm({
	start,
	end,
	showDescription,
}: EventAddFormProps) {
	const { t } = useTranslation("calendar");

	const eventAddFormSchema = z.object({
		title: z
			.string({ required_error: t("add.error_title") })
			.min(1, { message: t("add.error_title") }),
		description: z
			.string({ required_error: t("add.error_description") })
			.min(1, { message: t("add.error_description") }),
		start: z.date({
			required_error: t("add.error_start_time"),
			invalid_type_error: t("add.error_not_date"),
		}),
		end: z.date({
			required_error: t("add.error_end_time"),
			invalid_type_error: t("add.error_not_date"),
		}),
		color: z
			.string({ required_error: "Please select an event color." })
			.min(1, { message: "Must provide a title for this event." }),
	});

	type EventAddFormValues = z.infer<typeof eventAddFormSchema>;
	const { events, addEvent } = useEvents();
	const { eventAddOpen, setEventAddOpen } = useEvents();

	const { toast } = useToast();

	const form = useForm<z.infer<typeof eventAddFormSchema>>({
		resolver: zodResolver(eventAddFormSchema),
	});

	const effectRun = useRef(false);

	useEffect(() => {
		if (!effectRun.current) {
			form.reset({
				title: "",
				description: "",
				start: start,
				end: end,
				color: "#76c7ef",
			});
			effectRun.current = true;
		}
	}, [form, start, end]);

	const onSubmit = useCallback(
		async (data: EventAddFormValues) => {
			const newEvent = {
				id: String(events.length + 1),
				title: data.title,
				description: data.description,
				start: data.start,
				end: data.end,
				color: data.color,
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
		[events, addEvent, setEventAddOpen, toast],
	);

	return (
		<AlertDialog open={eventAddOpen}>
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
			<AlertDialogContent>
				<AlertDialogDescription className="sr-only">
					A popup dialog to add a new event of some kind.
				</AlertDialogDescription>
				<AlertDialogHeader>
					<AlertDialogTitle>{t("add.add")}</AlertDialogTitle>
				</AlertDialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2.5">
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("add.title")}</FormLabel>
									<FormControl>
										<Input placeholder={t("add.placeholder.title")} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						{showDescription && (
							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("add.description")}</FormLabel>
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
						)}
						<FormField
							control={form.control}
							name="start"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel htmlFor="datetime">{t("add.start_time")}</FormLabel>
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
									<FormLabel htmlFor="datetime">{t("add.end_time")}</FormLabel>
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
