"use client";

// Now using: https://github.com/robskinney/shadcn-ui-fullcalendar-example

import { useState } from "react";
import type { CarRead } from "@/api/index";
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
	} = useQuery({
		...getAllBookingOptions(),
	});

	const {
		data: userData,
		error: userError,
		isFetching: userIsFetching,
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

	if (isFetching || userIsFetching) {
		return <p> {t("admin:loading")}</p>;
	}

	if (error || userError) {
		return <p> {t("admin:error")}</p>;
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
		(bookingData as CarRead[])?.map((car) => {
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
					: "#e6e600"; // Example: green for confirmed, red for unconfirmed
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
											console.error(t("admin:car.error_add"), error);
										},
									},
								);
							}}
							handleDelete={(id) => {
								handleEventDelete.mutate(
									{ path: { booking_id: Number(id) } },
									{
										onError: (error) => {
											console.error(`${t("admin:car.error_add")} ${id}`, error);
											// TODO: Show error message to user
										},
									},
								);
							}}
							handleEdit={(event) => {
								if (!event.id) {
									console.error(t("admin:car.error_missing_id"), event);
									return;
								}

								if (!event.title_sv) {
									throw new Error("Missing title");
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
											console.error(
												`${t("admin:car.error_edit")} ${event.id}`,
												error,
											);
											// TODO: Show error message to user
										},
									},
								);
							}}
						>
							<div className="flex flex-col h-full">
								<CustomTitle
									text={t("main:car-booking.title")}
									className="mt-4"
									size={4}
								/>
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
							</div>
						</EventsProvider>
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
								href="/car/rules"
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
								<AccordionContent>
									{t("main:car-booking.faq.a6")}
								</AccordionContent>
							</AccordionItem>
						</Accordion>
					</>
				}
			/>
		</div>
	);
}
