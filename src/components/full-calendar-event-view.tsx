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
	const { t, i18n } = useTranslation("calendar");

	return (
		<>
			<AlertDialog open={eventViewOpen}>
				<AlertDialogContent>
					<AlertDialogDescription className="sr-only">
						A popup dialog showing details about an event of some kind.
					</AlertDialogDescription>
					<AlertDialogHeader>
						<AlertDialogTitle className="flex flex-row justify-between items-center">
							{i18n.language === "en" && event?.title_en
								? (event?.title_en as string)
								: (event?.title_sv as string)}
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
										<td>
											{(() => {
												const raw =
													i18n.language === "en"
														? event?.description_en
														: event?.description_sv;
												const desc = typeof raw === "string" ? raw : "";
												// truncate if too long
												return desc.length > 30 ? `${desc.slice(0, 30)}…` : desc;
											})()}
										</td>
									</tr>
								)}
								{(event && event?.all_day as boolean && enableAllDay) && (
									<tr>
										<th>{t("view.all_day")}</th>
										<td>{event.all_day ? t("yes") : t("no")}</td>
									</tr>
								)}
								{(event && enableTrueEventProperties) && (
									<> 
										{/* These are all temporary and should be changed at some point */}
										<tr>
											{/* TODO: Change this to actually display the proper text pls */}
											<th>{t("view.council_id")}</th> 
											<td>{event.council_id as number}</td>
										</tr>
										<tr>
											<th>{t("view.location")}</th>
											<td>{event.location as string}</td>
										</tr>
										<tr>
											<th>{t("view.max_event_users")}</th>
											<td>{event.max_event_users as number}</td>
										</tr>
										<tr>
											<th>{t("view.signup_start")}</th>
											<td>{(event.signup_start as Date).toLocaleString()}</td>
										</tr>
										<tr>
											<th>{t("view.signup_end")}</th>
											<td>{(event.signup_end as Date).toLocaleString()}</td>
										</tr>
										<tr>
											<th>{t("view.signup_not_opened_yet")}</th>
											<td>{event.signup_not_opened_yet as boolean ? t("yes") : t("no")}</td>
										</tr>
										<tr>
											<th>{t("view.closed")}</th>
											<td>{event.closed as boolean ? t("yes") : t("no")}</td>
										</tr>
										<tr>
											<th>{t("view.can_signup")}</th>
											<td>{event.can_signup as boolean ? t("yes") : t("no")}</td>
										</tr>
										<tr>
											<th>{t("view.drink")}</th>
											<td>{event.drink as boolean ? t("yes") : t("no")}</td>
										</tr>
										<tr>
											<th>{t("view.food")}</th>
											<td>{event.food as boolean ? t("yes") : t("no")}</td>
										</tr>
										<tr>
											<th>{t("view.cash")}</th>
											<td>{event.cash as boolean ? t("yes") : t("no")}</td>
										</tr>
										<tr>
											<th>{t("view.drink_package")}</th>
											<td>{event.drink_package as boolean ? t("yes") : t("no")}</td>
										</tr>
										<tr>
											<th>{t("view.is_nollning_event")}</th>
											<td>{event.is_nollning_event as boolean ? t("yes") : t("no")}</td>
										</tr>
									</>
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
