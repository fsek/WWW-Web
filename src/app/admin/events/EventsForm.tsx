import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogTitle } from "@radix-ui/react-dialog";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	createEventMutation,
	getAllEventsQueryKey,
} from "@/api/@tanstack/react-query.gen";

import { AdminChooseCouncil } from "@/widgets/AdminChooseCouncil";
import { AdminChooseDates } from "@/widgets/AdminChooseDates";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "react-i18next";
import { AdminChoosePriorities } from "@/widgets/AdminChoosePriorities";
import type { EventCreate } from "@/api/types.gen";
import { SelectFromOptions } from "@/widgets/SelectFromOptions";
import { Label } from "@/components/ui/label";

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
				<DialogContent className="min-w-fit lg:max-w-7xl">
					<DialogHeader>
						<DialogTitle>{t("admin:events.create_event")}</DialogTitle>
					</DialogHeader>
					<hr />
					<Form {...eventsForm}>
						<form
							onSubmit={eventsForm.handleSubmit(onSubmit)}
							className="grid gap-x-4 gap-y-3 lg:grid-cols-4"
						>
							<FormField
								control={eventsForm.control}
								name="title_sv"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("admin:events.title_sv")}</FormLabel>
										<FormControl>
											<Input
												placeholder={t("admin:events.title_sv")}
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={eventsForm.control}
								name="title_en"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("admin:events.title_en")}</FormLabel>
										<FormControl>
											<Input
												placeholder={t("admin:events.title_en")}
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={eventsForm.control}
								name="council_id"
								render={({ field }) => (
									<FormItem className="w-full">
										<FormLabel>{t("admin:events.council")}</FormLabel>
										<AdminChooseCouncil
											value={field.value}
											onChange={field.onChange}
										/>
									</FormItem>
								)}
							/>

							{/* Priorities */}
							<FormField
								control={eventsForm.control}
								name="priorities"
								render={({ field }) => (
									<FormItem className="lg:col-span-2 w-full">
										<FormLabel>{t("admin:events.priorities")}</FormLabel>
										<AdminChoosePriorities
											value={(field.value as string[]) ?? []}
											onChange={(value) => field.onChange(value)}
											className="text-sm"
										/>
									</FormItem>
								)}
							/>

							<FormField
								control={eventsForm.control}
								name="starts_at"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("admin:events.start_time")}</FormLabel>
										<AdminChooseDates
											value={field.value}
											onChange={(newStart: Date) => {
												field.onChange(newStart);
												const end = eventsForm.getValues("ends_at");
												if (
													end &&
													new Date(end).getTime() < newStart.getTime()
												) {
													const newEnd = new Date(
														newStart.getTime() + 60 * 60 * 1000,
													);
													eventsForm.setValue("ends_at", newEnd, {
														shouldDirty: true,
														shouldValidate: true,
													});
												}
											}}
										/>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={eventsForm.control}
								name="ends_at"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("admin:events.end_time")}</FormLabel>
										<AdminChooseDates
											value={field.value}
											onChange={field.onChange}
										/>
									</FormItem>
								)}
							/>

							<FormField
								control={eventsForm.control}
								name="signup_start"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("admin:events.signup_start")}</FormLabel>
										<AdminChooseDates
											value={field.value}
											onChange={(newSignupStart: Date) => {
												field.onChange(newSignupStart);
												const signupEnd = eventsForm.getValues("signup_end");
												if (
													signupEnd &&
													new Date(signupEnd).getTime() <
														newSignupStart.getTime()
												) {
													const newSignupEnd = new Date(
														newSignupStart.getTime() + 60 * 60 * 1000,
													);
													eventsForm.setValue("signup_end", newSignupEnd, {
														shouldDirty: true,
														shouldValidate: true,
													});
												}
											}}
										/>
									</FormItem>
								)}
							/>

							<FormField
								control={eventsForm.control}
								name="signup_end"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("admin:events.signup_end")}</FormLabel>
										<AdminChooseDates
											value={field.value}
											onChange={field.onChange}
										/>
									</FormItem>
								)}
							/>

							{/* Description (sv) */}
							<FormField
								control={eventsForm.control}
								name="description_sv"
								render={({ field }) => (
									<FormItem className="lg:col-span-2">
										<FormLabel>{t("admin:events.description_sv")}</FormLabel>
										<FormControl>
											<Textarea
												placeholder={t("admin:events.description_sv")}
												className="max-h-36"
												{...field}
												value={field.value as string}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							{/* Description (en) */}
							<FormField
								control={eventsForm.control}
								name="description_en"
								render={({ field }) => (
									<FormItem className="lg:col-span-2">
										<FormLabel>{t("admin:events.description_en")}</FormLabel>
										<FormControl>
											<Textarea
												placeholder={t("admin:events.description_en")}
												className="max-h-36"
												{...field}
												value={field.value as string}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							{/* Location */}
							<FormField
								control={eventsForm.control}
								name="location"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("admin:events.location")}</FormLabel>
										<FormControl>
											<Input
												placeholder={t("admin:events.location")}
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							{/* Max event users */}
							<FormField
								control={eventsForm.control}
								name="max_event_users"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("admin:events.max_event_users")}</FormLabel>
										<FormControl>
											<Input
												type="number"
												placeholder={t("admin:events.max_event_users")}
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							{/* Alcohol event type */}
							<FormField
								control={eventsForm.control}
								name="alcohol_event_type"
								render={({ field }) => {
									const options = [
										{ value: "Alcohol", label: t("admin:events.alcohol") },
										{
											value: "Alcohol-Served",
											label: t("admin:events.alcohol_served"),
										},
										{ value: "None", label: t("admin:events.alcohol_none") },
									];
									const selectedOption =
										options.find((opt) => opt.value === field.value) ??
										options[2];
									return (
										<FormItem>
											<FormLabel>
												{t("admin:events.alcohol_event_type")}
											</FormLabel>
											<SelectFromOptions
												options={options}
												value={selectedOption.value}
												onChange={(value) => field.onChange(value)}
												placeholder={t(
													"admin:events.select_alcohol_event_type",
												)}
											/>
										</FormItem>
									);
								}}
							/>

							{/* Dress code */}
							<FormField
								control={eventsForm.control}
								name="dress_code"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("admin:events.dress_code")}</FormLabel>
										<FormControl>
											<Input {...field} value={field.value as string} />
										</FormControl>
									</FormItem>
								)}
							/>

							{/* Price */}
							<FormField
								control={eventsForm.control}
								name="price"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("admin:events.price")}</FormLabel>
										<FormControl>
											<Input
												type="number"
												{...field}
												value={field.value as number}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							{/* Dot */}
							<FormField
								control={eventsForm.control}
								name="dot"
								render={({ field }) => {
									const options = [
										{ value: "None", label: t("admin:events.dot_none") },
										{ value: "Single", label: t("admin:events.dot_single") },
										{ value: "Double", label: t("admin:events.dot_double") },
									];
									const selectedOption =
										options.find((opt) => opt.value === field.value) ??
										options[0];
									return (
										<FormItem>
											<FormLabel>{t("admin:events.select_dot")}</FormLabel>
											<SelectFromOptions
												options={options}
												value={selectedOption.value}
												onChange={(value) => field.onChange(value)}
											/>
										</FormItem>
									);
								}}
							/>

							{/* Checkbox fields */}
							{checkboxFields.map((fieldName) => (
								<FormField
									key={fieldName}
									control={eventsForm.control}
									name={fieldName}
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

							<div className="space-x-2 lg:col-span-2 lg:grid-cols-subgrid">
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
