"use client";

// Now using: https://github.com/robskinney/shadcn-ui-fullcalendar-example

import { useState } from "react";
import type { RoomBookingRead } from "@/api/index";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllRoomBookingsOptions } from "@/api/@tanstack/react-query.gen";
import Calendar from "@/components/full-calendar";
import { EventsProvider } from "@/utils/full-calendar-event-context";
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
import { SelectFromOptions } from "@/widgets/SelectFromOptions";
import type { RoomEnum } from "@/api";

export default function RoomBookings() {
	const router = useRouter();
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const [selectedRoom, setSelectedRoom] = useState<RoomEnum | "All">("All");

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

	// only show full‐page loading on initial mount
	if (isLoading || userIsLoading) {
		return <LoadingErrorCard />;
	}

	if (error || userError) {
		return <LoadingErrorCard error={error || userError || undefined} />;
	}

	interface CustomRoomEventData extends CustomEventData {
		room: string;
		council_id: number;
		council_name_sv: string;
		council_name_en: string;
		user_id: number;
	}

	// Transform the fetched data into CalendarEvent type
	const events: CalendarEvent<CustomRoomEventData>[] =
		(bookingData as RoomBookingRead[])
			?.filter((booking) =>
				selectedRoom === "All" ? true : booking.room === selectedRoom,
			)
			.map((booking) => {
				const userName =
					booking.user.first_name && booking.user.last_name
						? `${booking.user.first_name} ${booking.user.last_name}`
						: `User ${booking.user.id}`;
				return {
					id: booking.id.toString(),
					title_sv: `${booking.room} - ${userName}`,
					title_en: `${booking.room} - ${userName}`,
					start: booking.start_time,
					end: booking.end_time,
					all_day: false,
					description_sv: booking.description,
					room: booking.room,
					council_name_sv: booking.council?.name_sv ?? undefined,
					council_name_en: booking.council?.name_en ?? undefined,
					council_id: booking.council?.id ?? undefined,
					user_id: booking.user.id,
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
							<div className="py-2 w-64">
								<SelectFromOptions
									placeholder={
										t("admin:room_bookings.select_room") || "Välj rum"
									}
									options={[
										{ value: "LC", label: "LC" },
										{ value: "Alumni", label: "Alumni" },
										{ value: "SK", label: "SK" },
										{ value: "Hilbert Cafe", label: "Hilbert Cafe" },
										{ value: "All", label: t("admin:room_bookings.all_rooms") },
									]}
									value={selectedRoom}
									onChange={(value) =>
										setSelectedRoom(value as RoomEnum | "All")
									}
								/>
							</div>
							{!isFetching && !userIsFetching ? (
								<EventsProvider
									key={selectedRoom}
									initialCalendarEvents={events}
									eventColor="#f6ad55"
									carEvents={false}
									handleAdd={() => {}}
									handleDelete={() => {}}
									handleEdit={() => {}}
								>
									<div className="flex-1 flex flex-col h-full">
										<Calendar
											showDescription={true}
											editDescription={false}
											handleOpenDetails={(event) => {
												if (event) {
													router.push(`/room-bookings/details?id=${event.id}`);
												}
											}}
											disableEdit={true}
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
						</Accordion>
					</>
				}
			/>
		</div>
	);
}
