"use client";

// Now using: https://github.com/robskinney/shadcn-ui-fullcalendar-example

import { useState } from "react";
import type { RoomBookingRead } from "@/api/index";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createRoomBookingMutation,
	getAllRoomBookingsOptions,
} from "@/api/@tanstack/react-query.gen";
import Calendar from "@/components/full-calendar";
import { EventsProvider } from "@/utils/full-calendar-event-context";
import {
	removeRoomBookingMutation,
	getAllRoomBookingsQueryKey,
	updateRoomBookingMutation,
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
import { toast } from "sonner";

export default function RoomBookings() {
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
		...getAllRoomBookingsOptions(),
		refetchOnWindowFocus: false,
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
		...createRoomBookingMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllRoomBookingsQueryKey() });
			setOpen(false);
			setSubmitEnabled(true);
		},
	});

	const handleEventDelete = useMutation({
		...removeRoomBookingMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllRoomBookingsQueryKey() });
			setOpen(false);
			setSubmitEnabled(true);
		},
	});

	const handleEventEdit = useMutation({
		...updateRoomBookingMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllRoomBookingsQueryKey() });
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

	interface CustomRoomEventData extends CustomEventData {
		room: string;
		council_id?: number;
		personal: boolean;
		council_name_sv?: string;
		council_name_en?: string;
		user_id: number;
	}

	// Transform the fetched data into CalendarEvent type
	const events: CalendarEvent<CustomRoomEventData>[] =
		(bookingData as RoomBookingRead[])?.map((booking) => {
			const userName =
				booking.user.first_name && booking.user.last_name
					? `${booking.user.first_name} ${booking.user.last_name}`
					: `User ${booking.user.id}`;
			const backgroundColor = (userData ? userData.id === booking.user.id : false)
				? "#e68a00" // User's own bookings
				: "#66cc00"; // Other users' bookings
			return {
				id: booking.id.toString(),
				title_sv: `${booking.user.first_name} ${booking.user.last_name}`,
				title_en: `${booking.user.first_name} ${booking.user.last_name}`,
				start: booking.start_time,
				end: booking.end_time,
				all_day: false,
				description_sv: booking.description,
				room: booking.room,
				council_name_sv: booking.council?.name_sv ?? undefined,
				council_name_en: booking.council?.name_en ?? undefined,
				personal: booking.personal ?? true,
				council_id: booking.council?.id ?? undefined,
				user_id: booking.user.id,
				backgroundColor: backgroundColor,
			};
		}) ?? [];

	return (
		<div className="px-8 space-x-4 py-10 h-full flex flex-col">
			<TwoColumnLayout
				leftColumnContent={
					<div className="h-[80vh] flex flex-col">
						<div className="flex flex-col h-full">
							<CustomTitle
								text={t("main:room-booking.title")}
								className="mt-4"
								size={4}
							/>
							{!isFetching && !userIsFetching ? (
								<EventsProvider
									initialCalendarEvents={events}
									eventColor="#f6ad55"
									carEvents={false}
									handleAdd={(event) => {
										handleEventAdd.mutate(
											{
												body: {
													room: event.room as "LC" | "Alumni" | "SK",
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
														t("admin:room_bookings.error_add") +
														(error?.detail ? `: ${error.detail}` : ""),
													);
												},
												onSuccess: () => {
													toast.success(t("admin:room_bookings.success_add"));
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
														t("admin:room_bookings.error_delete") +
														(error?.detail ? `: ${error.detail}` : ""),
													);
												},
												onSuccess: () => {
													toast.success(t("admin:room_bookings.success_delete"));
												},
											},
										);
									}}
									handleEdit={(event) => {
										if (!event.id) {
											toast.error(t("admin:room_bookings.error_missing_id"));
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
												},
											},
											{
												onError: (error) => {
													toast.error(
														t("admin:room_bookings.error_edit") +
														(error?.detail ? `: ${error.detail}` : ""),
													);
												},
												onSuccess: () => {
													toast.success(t("admin:room_bookings.success_edit"));
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
													router.push(`/room-bookings/details?id=${event.id}`);
												}
											}}
											disableEdit={false}
											enableAllDay={false}
											enableRoomBookingProperties={true}
											disableEditOfOthers={true}
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
							text={t("main:room-booking.description-title")}
							className="mt-4"
							size={3}
							fullUnderline
						/>
						<Trans i18nKey="main:room-booking.description">
							<Link
								className="text-blue-500 hover:text-blue-700 underline mr-0"
								href="/admin/room-bookings"
							/>
						</Trans>
						<CustomTitle
							text={t("main:room-booking.faq.title")}
							className="mt-4"
							size={2}
							fullUnderline
						/>
						<Accordion type="single" collapsible>
							<AccordionItem value="item-1">
								<AccordionTrigger>
									{t("main:room-booking.faq.q1")}
								</AccordionTrigger>
								<AccordionContent>
									{t("main:room-booking.faq.a1")}
								</AccordionContent>
							</AccordionItem>
							<AccordionItem value="item-2">
								<AccordionTrigger>
									{t("main:room-booking.faq.q2")}
								</AccordionTrigger>
								<AccordionContent>
									{t("main:room-booking.faq.a2")}
								</AccordionContent>
							</AccordionItem>
							<AccordionItem value="item-3">
								<AccordionTrigger>
									{t("main:room-booking.faq.q3")}
								</AccordionTrigger>
								<AccordionContent>
									{t("main:room-booking.faq.a3")}
								</AccordionContent>
							</AccordionItem>
						</Accordion>
					</>
				}
			/>
		</div>
	);
}
