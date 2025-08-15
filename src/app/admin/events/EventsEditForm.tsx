import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import {
	getAllEventsQueryKey,
	eventUpdateMutation,
	eventRemoveMutation,
} from "@/api/@tanstack/react-query.gen";
import type { EventRead, EventUpdate } from "@/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import EventFormFields from "./EventFormFields";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { Save } from "lucide-react";

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
	recurring: z.boolean(),
	food: z.boolean(),
	closed: z.boolean(),
	can_signup: z.boolean(),
	drink_package: z.boolean(),
	is_nollning_event: z.boolean(),
	alcohol_event_type: z
		.enum(["Alcohol", "Alcohol-Served", "None"])
		.default("None"),
	dress_code: z.string().max(100).optional().default(""),
	price: z.coerce.number().nonnegative().optional().default(0),
	dot: z.enum(["None", "Single", "Double"]).default("None"),
});

export type EventsEditFormValues = z.infer<typeof eventsEditSchema>;

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

	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	const form = useForm<EventsEditFormValues>({
		resolver: zodResolver(eventsEditSchema),
		defaultValues: {
			// Values for when no event is selected
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
			recurring: false,
			food: false,
			closed: false,
			can_signup: false,
			drink_package: false,
			is_nollning_event: false,
			alcohol_event_type: "None",
			dress_code: "",
			price: 0,
			dot: "None",
		},
	});

	const checkboxFields = [
		"all_day",
		"recurring",
		"food",
		"closed",
		"can_signup",
		"drink_package",
		"is_nollning_event",
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
				// Selected event has been created with safe values, the code below should always work
				alcohol_event_type: selectedEvent.alcohol_event_type as
					| "Alcohol"
					| "Alcohol-Served"
					| "None",
				dot: selectedEvent.dot as "None" | "Single" | "Double",
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

	function handleFormSubmit(values: EventsEditFormValues) {
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
			<DialogContent className="min-w-fit lg:max-w-7xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{t("admin:events.edit_booking")}</DialogTitle>
				</DialogHeader>
				<hr />
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleFormSubmit)}>
						<EventFormFields
							eventsForm={form}
							checkboxFields={checkboxFields}
						/>

						<div className="space-x-2 mt-6 flex justify-end">
							<ConfirmDeleteDialog
								open={deleteDialogOpen}
								onOpenChange={setDeleteDialogOpen}
								onConfirm={handleRemoveSubmit}
								triggerText={t("admin:remove")}
								title={t("admin:events.confirm_remove")}
								description={t("admin:events.confirm_remove_text")}
								confirmText={t("admin:remove")}
								cancelText={t("admin:cancel")}
							/>
							<Button type="submit" className="w-32 min-w-fit">
								<Save />
								{t("admin:save")}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
