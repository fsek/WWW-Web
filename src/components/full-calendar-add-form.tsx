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
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DateTimePicker } from "./full-calendar-date-picker";
import { useEvents } from "@/context/full-calendar-event-context";
import { ToastAction } from "./ui/toast";

const eventAddFormSchema = z.object({
	title: z
		.string({ required_error: "Please enter a title." })
		.min(1, { message: "Must provide a title for this event." }),
	description: z
		.string({ required_error: "Please enter a description." })
		.min(1, { message: "Must provide a description for this event." }),
	start: z.date({
		required_error: "Please select a start time",
		invalid_type_error: "That's not a date!",
	}),
	end: z.date({
		required_error: "Please select an end time",
		invalid_type_error: "That's not a date!",
	}),
	color: z
		.string({ required_error: "Please select an event color." })
		.min(1, { message: "Must provide a title for this event." }),
});

type EventAddFormValues = z.infer<typeof eventAddFormSchema>;

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

	const onSubmit = useCallback(async (data: EventAddFormValues) => {
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
			title: "Event added!",
			action: (
				<ToastAction altText={"Click here to dismiss notification"}>
					Dismiss
				</ToastAction>
			),
		});
	}, [events, addEvent, setEventAddOpen, toast]);


	return (
		<AlertDialog open={eventAddOpen}>
			<AlertDialogTrigger className="flex" asChild>
				<Button
					className="w-24 md:w-28 text-xs md:text-sm"
					variant="default"
					onClick={() => setEventAddOpen(true)}
				>
					<PlusIcon className="md:h-5 md:w-5 h-3 w-3" />
					<p>Add Event</p>
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Add Event</AlertDialogTitle>
				</AlertDialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2.5">
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Title</FormLabel>
									<FormControl>
										<Input placeholder="Standup Meeting" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						{(showDescription) && (
							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Daily session"
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
									<FormLabel htmlFor="datetime">Start</FormLabel>
									<FormControl>
										<DateTimePicker
											value={field.value}
											onChange={field.onChange}
											hourCycle={12}
											granularity="minute"
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
									<FormLabel htmlFor="datetime">End</FormLabel>
									<FormControl>
										<DateTimePicker
											value={field.value}
											onChange={field.onChange}
											hourCycle={12}
											granularity="minute"
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
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction type="submit">Add Event</AlertDialogAction>
						</AlertDialogFooter>
					</form>
				</Form>
			</AlertDialogContent>
		</AlertDialog>
	);
}
