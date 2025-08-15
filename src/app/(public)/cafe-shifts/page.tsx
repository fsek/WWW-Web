"use client";

import { useQuery } from "@tanstack/react-query";
import {
	viewAllShiftsOptions,
	getMeOptions,
} from "@/api/@tanstack/react-query.gen";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { EventsProvider } from "@/utils/full-calendar-event-context";
import Calendar from "@/components/full-calendar";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import type {
	CalendarEvent,
	CustomEventData,
} from "@/utils/full-calendar-seed";
import type { CafeShiftRead } from "@/api/types.gen";
import TwoColumnLayout from "@/components/TwoColumnLayout";
import CustomTitle from "@/components/CustomTitle";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Trans } from "react-i18next";

export default function CafeShifts() {
	const router = useRouter();
	const { t } = useTranslation("cafe");
	const { data, error, isFetching } = useQuery({
		...viewAllShiftsOptions(),
	});
	const {
		data: userData,
		error: userError,
		isFetching: userIsFetching,
		isLoading: userIsLoading,
	} = useQuery({
		...getMeOptions(),
		staleTime: 30 * 60 * 1000,
	});

	if (isFetching || userIsLoading) return <LoadingErrorCard />;
	if (error || userError)
		return <LoadingErrorCard error={error || userError || ""} />;

	interface CustomShiftData extends CustomEventData {
		user_id: number | null;
		user_name: string | null;
	}

	const events: CalendarEvent<CustomShiftData>[] =
		(data as CafeShiftRead[])?.map((shift) => {
			const isCurrentUser = userData && shift.user?.id === userData.id;
			const backgroundColor = isCurrentUser
				? "#e68a00" // Orange for current user's shifts
				: shift.user
					? "#66cc00" // Green for taken shifts
					: "#72bcd4"; // Blue for available shifts
			return {
				id: shift.id.toString(),
				title_sv: shift.user
					? `${shift.user.first_name} ${shift.user.last_name}`
					: "Ledigt pass",
				title_en: shift.user
					? `${shift.user.first_name} ${shift.user.last_name}`
					: "Available shift",
				start: shift.starts_at,
				end: shift.ends_at,
				user_id: shift.user?.id ?? null,
				user_name: shift.user
					? `${shift.user.first_name} ${shift.user.last_name}`
					: null,
				description_sv: shift.user
					? `Cafépass för ${shift.user.first_name}`
					: "Ledigt cafépass",
				description_en: shift.user
					? `Cafe shift for ${shift.user.first_name}`
					: "Available cafe shift",
				backgroundColor,
			};
		}) ?? [];

	return (
		<div className="px-8 space-x-4 py-10 h-full flex flex-col">
			<TwoColumnLayout
				leftColumnContent={
					<div className="h-[80vh] flex flex-col">
						<div className="flex flex-col h-full">
							<CustomTitle
								text={t("cafe_shifts.title")}
								className="mt-4"
								size={4}
							/>
							<EventsProvider
								initialCalendarEvents={events}
								eventColor="#f6ad55"
							>
								<Calendar
									showDescription={false}
									editDescription={false}
									handleOpenDetails={(shift) => {
										if (shift) {
											router.push(`/cafe-shifts/${shift.id}`);
										}
									}}
									disableEdit
									enableAllDay={false}
									enableCafeShiftProperties
									zoomWorkHours={true}
									mini={false}
								/>
							</EventsProvider>
						</div>
					</div>
				}
				rightColumnContent={
					<>
						<CustomTitle
							text={t("cafe_shifts.description_title")}
							className="mt-4"
							size={3}
							fullUnderline
						/>
						<p>{t("cafe_shifts.description_long_text")}</p>
						<CustomTitle
							text={t("cafe_shifts.faq.title")}
							className="mt-4"
							size={2}
							fullUnderline
						/>
						<Accordion type="single" collapsible>
							<AccordionItem value="item-1">
								<AccordionTrigger>{t("cafe_shifts.faq.q1")}</AccordionTrigger>
								<AccordionContent>{t("cafe_shifts.faq.a1")}</AccordionContent>
							</AccordionItem>
							<AccordionItem value="item-2">
								<AccordionTrigger>{t("cafe_shifts.faq.q2")}</AccordionTrigger>
								<AccordionContent>{t("cafe_shifts.faq.a2")}</AccordionContent>
							</AccordionItem>
							<AccordionItem value="item-3">
								<AccordionTrigger>{t("cafe_shifts.faq.q3")}</AccordionTrigger>
								<AccordionContent>{t("cafe_shifts.faq.a3")}</AccordionContent>
							</AccordionItem>
						</Accordion>
					</>
				}
			/>
		</div>
	);
}
