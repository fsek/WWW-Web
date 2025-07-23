"use client";

// Now using: https://github.com/robskinney/shadcn-ui-fullcalendar-example

import { useState } from "react";
import type { CarBookingRead } from "@/api/index";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createBookingMutation,
	getAllBookingOptions,
} from "@/api/@tanstack/react-query.gen";
import Calendar from "@/components/full-calendar";
import { EventsProvider } from "@/utils/full-calendar-event-context";
import {
	removeBookingMutation,
	getAllBookingQueryKey,
	updateBookingMutation,
} from "@/api/@tanstack/react-query.gen";
import type {
	CalendarEvent,
	CustomEventData,
} from "@/utils/full-calendar-seed";
import { Trans, useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import CustomTitle from "@/components/CustomTitle";
import Link from "next/link";
import TwoColumnLayout from "@/components/TwoColumnLayout";
import { getMeOptions } from "@/api/@tanstack/react-query.gen";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

export default function Car() {
	const router = useRouter();
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const [, setOpen] = useState(false);
	const [, setSubmitEnabled] = useState(true);

	const {
		data: bookingData,
		error,
		isFetching,
		isLoading,
	} = useQuery({
		...getAllBookingOptions(),
	});

	const {
		data: userData,
		error: userError,
		isFetching: userIsFetching,
		isLoading: userIsLoading,
	} = useQuery({
		...getMeOptions(),
		staleTime: 30 * 60 * 1000, // Don't refetch for 30 minutes
	});

	const handleEventAdd = useMutation({
		...createBookingMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllBookingQueryKey() });
			setOpen(false);
			setSubmitEnabled(true);
		},
	});

	const handleEventDelete = useMutation({
		...removeBookingMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllBookingQueryKey() });
			setOpen(false);
			setSubmitEnabled(true);
		},
	});

	const handleEventEdit = useMutation({
		...updateBookingMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllBookingQueryKey() });
			setOpen(false);
			setSubmitEnabled(true);
		},
	});

	// only show full‐page loading on initial mount
	if (isLoading || userIsLoading) {
		return <LoadingErrorCard />;
	}

	if (error || userError) {
		return <LoadingErrorCard error={error || userError || undefined} />;
	}

	interface CustomEventData_ extends CustomEventData {
		council_id?: number;
		personal: boolean;
		confirmed: boolean;
		council_name?: string;
		user_id: number;
	}

	// Transform the fetched data into CalendarEvent type
	const events: CalendarEvent<CustomEventData_>[] =
		(bookingData as CarBookingRead[])?.map((car) => {
			const userName =
				car.user_first_name && car.user_last_name
					? `${car.user_first_name} ${car.user_last_name}`
					: `User ${car.user_id}`;
			const backgroundColor = (userData ? userData.id === car.user_id : false)
				? car.confirmed
					? "#e68a00" // TODO: Use tailwind for this somehow
					: "#ffd699"
				: // Use a different color for the current user's bookings
					car.confirmed
					? "#66cc00"
					: "#e6e600"; // Green for confirmed, yellow for unconfirmed
			return {
				id: car.booking_id.toString(),
				title_sv: userName,
				start: car.start_time,
				end: car.end_time,
				all_day: false,
				description_sv: car.description,
				council_name: car.council?.name ?? undefined,
				confirmed: car.confirmed,
				personal: car.personal,
				council_id: car.council_id ?? undefined,
				user_id: car.user_id,
				backgroundColor: backgroundColor,
			};
		}) ?? [];

	return (
		<div className="px-8 space-x-4 py-10 h-full flex flex-col">
			{/* Make sure height is properly defined at this level and propagates down */}

			<TwoColumnLayout
				leftColumnContent={
					<div className="h-[80vh] flex flex-col">
						<div className="flex flex-col h-full">
							<CustomTitle
								text={t("main:car-booking.title")}
								className="mt-4"
								size={4}
							/>
							{!isFetching && !userIsFetching ? (
								<EventsProvider
									initialCalendarEvents={events}
									eventColor="#f6ad55" // TODO: use tailwind
									carEvents={true}
									handleAdd={(event) => {
										handleEventAdd.mutate(
											{
												body: {
													description: event.description_sv,
													start_time: event.start,
													end_time: event.end,
													personal: (event.personal as boolean) ?? true,
													council_id: event.council_id
														? (event.council_id as number)
														: undefined,
												},
											},
											{
												onError: (error) => {
													toast.error(
														t("admin:car.error_add") +
															(error?.detail ? `: ${error.detail}` : ""),
													);
												},
												onSuccess: () => {
													toast.success(t("admin:car.success_add"));
												},
											},
										);
									}}
									handleDelete={(id) => {
										handleEventDelete.mutate(
											{ path: { booking_id: Number(id) } },
											{
												onError: (error) => {
													toast.error(
														t("admin:car.error_delete") +
															(error?.detail ? `: ${error.detail}` : ""),
													);
												},
												onSuccess: () => {
													toast.success(t("admin:car.success_delete"));
												},
											},
										);
									}}
									handleEdit={(event) => {
										if (!event.id) {
											toast.error(t("admin:car.error_missing_id"));
											return;
										}

										if (!event.title_sv) {
											const msg = "Missing title";
											toast.error(msg);
											throw new Error(msg);
										}

										handleEventEdit.mutate(
											{
												path: { booking_id: Number(event.id) },
												body: {
													description: event.description_sv,
													start_time: event.start,
													end_time: event.end,
													personal: (event.personal as boolean) ?? true,
													council_id: event.council_id
														? (event.council_id as number)
														: undefined,
													confirmed: (event.confirmed as boolean) ?? false,
												},
											},
											{
												onError: (error) => {
													toast.error(
														t("admin:car.error_edit") +
															(error?.detail ? `: ${error.detail}` : ""),
													);
												},
												onSuccess: () => {
													toast.success(t("admin:car.success_edit"));
												},
											},
										);
									}}
								>
									<div className="flex-1 flex flex-col h-full">
										<Calendar
											showDescription={true}
											editDescription={true}
											handleOpenDetails={(event) => {
												if (event) {
													router.push(`/car/booking-details?id=${event.id}`);
												}
											}}
											disableEdit={false} // Also disables delete, add and dragging
											enableAllDay={false}
											enableCarProperties={true}
											disableConfirmField={true}
											disableEditOfOthers={true} // Disable editing of other users' bookings
											zoomWorkHours={true}
											mini={false}
										/>
									</div>
								</EventsProvider>
							) : (
								<LoadingErrorCard />
							)}
						</div>
					</div>
				}
				rightColumnContent={
					<>
						<CustomTitle
							text={t("main:car-booking.description-title")}
							className="mt-4"
							size={3}
							fullUnderline
						/>
						<Trans i18nKey="main:car-booking.description">
							<Link
								className="text-blue-500 hover:text-blue-700 underline mr-0"
								href="/admin/car"
							/>
							<Link
								className="text-blue-500 hover:text-blue-700 underline mr-0"
								href="https://old.fsektionen.se/dokument/276"
							/>
						</Trans>
						<CustomTitle
							text={t("main:car-booking.faq.title")}
							className="mt-4"
							size={2}
							fullUnderline
						/>
						{/* Horrible way to do this */}
						<Accordion type="single" collapsible>
							<AccordionItem value="item-1">
								<AccordionTrigger>
									{t("main:car-booking.faq.q1")}
								</AccordionTrigger>
								<AccordionContent>
									{t("main:car-booking.faq.a1")}
								</AccordionContent>
							</AccordionItem>
							<AccordionItem value="item-2">
								<AccordionTrigger>
									{t("main:car-booking.faq.q2")}
								</AccordionTrigger>
								<AccordionContent>
									{t("main:car-booking.faq.a2")}
								</AccordionContent>
							</AccordionItem>
							<AccordionItem value="item-3">
								<AccordionTrigger>
									{t("main:car-booking.faq.q3")}
								</AccordionTrigger>
								<AccordionContent>
									{t("main:car-booking.faq.a3")}
								</AccordionContent>
							</AccordionItem>
							<AccordionItem value="item-4">
								<AccordionTrigger>
									{t("main:car-booking.faq.q4")}
								</AccordionTrigger>
								<AccordionContent>
									{t("main:car-booking.faq.a4")}
								</AccordionContent>
							</AccordionItem>
							<AccordionItem value="item-5">
								<AccordionTrigger>
									{t("main:car-booking.faq.q5")}
								</AccordionTrigger>
								<AccordionContent>
									{t("main:car-booking.faq.a5")}
								</AccordionContent>
							</AccordionItem>
							<AccordionItem value="item-6">
								<AccordionTrigger>
									{t("main:car-booking.faq.q6")}
								</AccordionTrigger>
								<AccordionContent className="whitespace-pre-line">
									{t("main:car-booking.faq.a6")}
								</AccordionContent>
							</AccordionItem>
							<AccordionItem value="item-7">
								<AccordionTrigger className="font-bold">
									{t("main:car-booking.faq.q7")}
								</AccordionTrigger>
								<AccordionContent>
									<Trans i18nKey="main:car-booking.faq.a7">
										<Link
											className="text-blue-500 hover:text-blue-700 underline mr-0"
											href="/contact"
										/>
									</Trans>
								</AccordionContent>
							</AccordionItem>
						</Accordion>
					</>
				}
			/>

			<Toaster position="top-center" richColors />
		</div>
	);
}
