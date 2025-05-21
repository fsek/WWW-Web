"use client";

import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { CalendarEvent } from "@/utils/full-calendar-seed";
import { EventDeleteForm } from "./full-calendar-delete-form";
import { EventEditForm } from "./full-calendar-edit-form";
import { useEvents } from "@/utils/full-calendar-event-context";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";

interface EventViewProps {
	event?: CalendarEvent;
	showDescription: boolean;
	editDescription: boolean;
	handleOpenDetails?: (event?: CalendarEvent) => void;
	disableEdit: boolean;
	enableAllDay?: boolean;
	enableTrueEventProperties?: boolean;
}

export function EventView({
	event,
	showDescription,
	editDescription,
	handleOpenDetails,
	disableEdit,
	enableAllDay = true,
	enableTrueEventProperties = false,
}: EventViewProps) {
	const { eventViewOpen, setEventViewOpen } = useEvents();
	const { t } = useTranslation("calendar");

	return (
		<>
			<AlertDialog open={eventViewOpen}>
				<AlertDialogContent>
					<AlertDialogDescription className="sr-only">
						A popup dialog showing details about an event of some kind.
					</AlertDialogDescription>
					<AlertDialogHeader>
						<AlertDialogTitle className="flex flex-row justify-between items-center">
							{event?.title_sv}
							<AlertDialogCancel
								onClick={() => {
									setEventViewOpen(false);
								}}
							>
								<X className="h-5 w-5" />
							</AlertDialogCancel>
						</AlertDialogTitle>
						<table>
							<tbody>
								<tr>
									<th>{t("view.time")}</th>
									<td>{`${event?.start.toLocaleTimeString()} - ${event?.end.toLocaleTimeString()}`}</td>
								</tr>
								{showDescription && (
									<tr>
										<th>{t("view.description")}</th>
										<td>{event?.description_sv}</td>
									</tr>
								)}
								{(event?.all_day && enableAllDay) && (
									<tr>
										<th>{t("view.all_day")}</th>
										<td>{event.all_day ? t("yes") : t("no")}</td>
									</tr>
								)}
								{/* Not used
								<tr>
									<th>Color:</th>
									<td>
										<div
											className="rounded-full w-5 h-5"
											style={{ backgroundColor: event?.backgroundColor }}
										></div>
									</td>
								</tr>
								*/}
							</tbody>
						</table>
					</AlertDialogHeader>
					<AlertDialogFooter>
						{handleOpenDetails != null && (
							<Button
								variant="outline"
								onClick={() => handleOpenDetails(event)}
							>
								{t("details")}
							</Button>
						)}
						{!disableEdit && (
							<EventDeleteForm id={event?.id} title_sv={event?.title_sv} />
						)}
						{!disableEdit && (
							<EventEditForm
								oldEvent={event}
								event={event}
								isDrag={false}
								editDescription={editDescription}
								enableAllDay={enableAllDay}
								enableTrueEventProperties={enableTrueEventProperties}
							/>
						)}
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
