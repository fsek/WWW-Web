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

import { AdminChooseCouncil } from "@/widgets/AdminChooseCouncil";
import { AdminChooseDates } from "@/widgets/AdminChooseDates";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getAllEventsQueryKey,
	removeMutation,
	updateMutation,
} from "@/api/@tanstack/react-query.gen";
import type { EventRead, EventUpdate } from "../../../api";

const eventsEditSchema = z.object({
	id: z.number(),
	title_sv: z.string().min(2),
	title_en: z.string().min(2),
	council_id: z.number().int(),
	starts_at: z.string(),
	ends_at: z.string(),
	signup_start: z.string(),
	signup_end: z.string(),
	description_sv: z.string().max(1000).optional(),
	description_en: z.string().max(1000).optional(),
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
	const form = useForm<EventsEditFormType>({
		resolver: zodResolver(eventsEditSchema),
		defaultValues: {
			title_sv: "",
			title_en: "",
			starts_at: "",
			ends_at: "",
			signup_start: "",
			signup_end: "",
			description_sv: "",
			description_en: "",
		},
	});

	useEffect(() => {
		if (open && selectedEvent) {
			form.reset({
				...selectedEvent,
				starts_at: new Date(selectedEvent.starts_at).toLocaleString(),
				ends_at: new Date(selectedEvent.ends_at).toLocaleString(),
				signup_start: new Date(selectedEvent.signup_start).toLocaleString(),
				signup_end: new Date(selectedEvent.signup_end).toLocaleString(),
			});
		}
	}, [selectedEvent, form, open]);

	const queryClient = useQueryClient();

	const updateEvent = useMutation({
		...updateMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllEventsQueryKey() });
		},
		onError: () => {
			onClose();
		},
	});

	const removeEvent = useMutation({
		...removeMutation(),
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
			title_sv: values.title_sv,
			title_en: values.title_en,
			description_sv: values.description_sv,
			description_en: values.description_en,
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
					<DialogTitle>Redigera event</DialogTitle>
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
									<FormLabel>Titel (sv)</FormLabel>
									<FormControl>
										<Input placeholder="Titel" {...field} />
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
									<FormLabel>Titel (en)</FormLabel>
									<FormControl>
										<Input placeholder="Title" {...field} />
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
									<FormLabel>Council</FormLabel>
									<AdminChooseCouncil
										value={field.value}
										onChange={field.onChange}
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
									<FormLabel>Start time</FormLabel>
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
									<FormLabel>End time</FormLabel>
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
									<FormLabel>Signup start</FormLabel>
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
									<FormLabel>Signup end</FormLabel>
									<AdminChooseDates
										value={field.value}
										onChange={field.onChange}
									/>
								</FormItem>
							)}
						/>

						<div className="space-x-2 lg:col-span-2 lg:grid-cols-subgrid">
							<Button
								variant="outline"
								className="w-32 min-w-fit"
								onClick={() => console.log("Preview clicked")}
							>
								Förhandsgranska
							</Button>

							<Button
								variant="destructive"
								type="button"
								className="w-32 min-w-fit"
								onClick={handleRemoveSubmit}
							>
								Remove event
							</Button>

							<Button type="submit" className="w-32 min-w-fit">
								Spara
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
