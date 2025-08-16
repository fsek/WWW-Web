import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogTitle } from "@radix-ui/react-dialog";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	createEventMutation,
	getAllEventsQueryKey,
} from "@/api/@tanstack/react-query.gen";

import { useTranslation } from "react-i18next";
import type { EventCreate } from "@/api/types.gen";
import EventFormFields from "./EventFormFields";

const eventsSchema = z
	.object({
		title_sv: z.string().min(2),
		title_en: z.string().min(2),
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
		lottery: z.boolean().default(false),
	})
	.refine(
		(data) => {
			// Check if event is in the past
			if (data.starts_at.getTime() < Date.now()) {
				return false;
			}
			return true;
		},
		{
			message: "Event start time cannot be in the past",
			path: ["starts_at"],
		},
	);

// export form values type for use in EventFormFields.tsx
export type EventsFormValues = z.infer<typeof eventsSchema>;

export default function EventsForm() {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const [submitEnabled, setSubmitEnabled] = useState(true);

	const eventsForm = useForm<z.infer<typeof eventsSchema>>({
		resolver: zodResolver(eventsSchema),
		defaultValues: {
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
			lottery: false,
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
		"lottery",
	] as const;

	const queryClient = useQueryClient();

	const createEvents = useMutation({
		...createEventMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllEventsQueryKey() });
			setOpen(false);
			setSubmitEnabled(true);
		},
		onError: () => {
			setOpen(false);
			setSubmitEnabled(true);
		},
	});

	function onSubmit(values: z.infer<typeof eventsSchema>) {
		setSubmitEnabled(false);
		createEvents.mutate({
			body: {
				title_sv: values.title_sv,
				title_en: values.title_en,
				council_id: values.council_id,
				starts_at: values.starts_at,
				ends_at: values.ends_at,
				signup_start: values.signup_start,
				signup_end: values.signup_end,
				description_sv: values.description_sv,
				description_en: values.description_en,
				location: values.location,
				max_event_users: values.max_event_users,
				priorities: values.priorities as EventCreate["priorities"],
				all_day: values.all_day,
				recurring: values.recurring,
				food: values.food,
				closed: values.closed,
				can_signup: values.can_signup,
				drink_package: values.drink_package,
				is_nollning_event: values.is_nollning_event,
				alcohol_event_type: values.alcohol_event_type,
				dress_code: values.dress_code,
				price: values.price,
				dot: values.dot,
				lottery: values.lottery,
			},
		});
	}

	return (
		<div className="p-3">
			<Button
				onClick={() => {
					eventsForm.reset();
					setOpen(true);
					setSubmitEnabled(true);
				}}
			>
				{t("admin:events.create_event")}
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="min-w-fit lg:max-w-7xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>{t("admin:events.create_event")}</DialogTitle>
					</DialogHeader>
					<hr />
					<Form {...eventsForm}>
						<form onSubmit={eventsForm.handleSubmit(onSubmit)}>
							<EventFormFields
								eventsForm={eventsForm}
								checkboxFields={checkboxFields}
							/>

							<div className="space-x-2 mt-6 flex justify-end">
								<Button
									type="submit"
									disabled={!submitEnabled}
									className="w-32 min-w-fit"
								>
									{t("admin:submit")}
								</Button>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
