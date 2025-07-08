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
import {
	X,
	Calendar,
	Repeat,
	Star,
	Utensils,
	Beer,
	CreditCard,
	Lock
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useTranslation } from "react-i18next";

interface EventViewProps {
	event?: CalendarEvent;
	showDescription: boolean;
	editDescription: boolean;
	handleOpenDetails?: ((event?: CalendarEvent) => void) | null;
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

	const featureDivClassName = "flex items-center gap-1";
	const featureClassName = "h-3 w-3";

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
										<th>{t("admin:events.description")}</th>
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
								{(event && enableTrueEventProperties) && (
									<tr>
										<th>{t("admin:events.features")}</th>
										<td>
											{!(
												event.all_day ||
												event.recurring ||
												event.is_nollning_event ||
												event.food ||
												event.drink_package ||
												event.closed ||
												event.price !== 0
											) ? (
												<p className="text-muted-foreground text-sm">
													{t("admin:events.no_features")}
												</p>
											) : (
												<div className="flex flex-wrap gap-2">
													{event.all_day === true && enableAllDay && (
														<Badge variant="secondary" className={featureDivClassName}>
															<Calendar className={featureClassName} />
															{t("admin:events.all_day")}
														</Badge>
													)}
													{event.recurring === true && (
														<Badge variant="secondary" className={featureDivClassName}>
															<Repeat className={featureClassName} />
															{t("admin:events.recurring")}
														</Badge>
													)}
													{event.is_nollning_event === true && (
														<Badge variant="secondary" className={featureDivClassName}>
															<Star className={featureClassName} />
															{t("admin:events.is_nollning_event")}
														</Badge>
													)}
													{event.food === true && (
														<Badge variant="outline" className={featureDivClassName}>
															<Utensils className={featureClassName} />
															{t("admin:events.food")}
														</Badge>
													)}
													{event.drink_package === true && (
														<Badge variant="outline" className={featureDivClassName}>
															<Beer className={featureClassName} />
															{t("admin:events.drink_package")}
														</Badge>
													)}
													{event.price !== 0 && (
														<Badge variant="outline" className={featureDivClassName}>
															<CreditCard className={featureClassName} />
															{t("admin:events.costs_money")}
														</Badge>
													)}
													{event.closed === true && (
														<Badge variant="destructive" className={featureDivClassName}>
															<Lock className={featureClassName} />
															{t("admin:events.closed")}
														</Badge>
													)}
												</div>
											)}
										</td>
									</tr>
								)}
								{(event && enableTrueEventProperties) && (
									<>
										{/* These are all temporary and should be changed at some point */}
										<tr>
											<th>{t("admin:events.council")}</th>
											<td>{event.council_name as string}</td>
										</tr>
										<tr>
											<th>{t("admin:events.location")}</th>
											<td>
												{!(event.location as string) ? (
													<span className="text-muted-foreground text-sm">
														{t("admin:events.no_location")}
													</span>
												) : (
													<>
														{event.location as string}
													</>
												)}
											</td>
										</tr>
										<tr>
											<th>{t("admin:events.dress_code")}</th>
											<td>
												{!(event.dress_code as string) ? (
													<span className="text-muted-foreground text-sm">
														{t("admin:events.no_dress_code")}
													</span>
												) : (
													<>
														{event.dress_code as string}
													</>
												)}
											</td>
										</tr>
										<tr>
											<th>{t("admin:events.max_event_users")}</th>
											<td>{event.max_event_users as number}</td>
										</tr>
										<tr>
											<th>{t("admin:events.price")}</th>
											<td>
												{event.price !== 0 ? (
													<>
														{event.price as number} {"kr"}
													</>
												) : (
													<span className="text-muted-foreground text-sm">
														{t("admin:events.free")}
													</span>
												)}
											</td>
										</tr>
									</>
								)}
							</tbody>
						</table>
						{(event && enableTrueEventProperties) && (
							<div className="flex flex-wrap gap-2 m-2 flex-row">
								{event.can_signup === true && (
									<Badge variant="default" className="text-sm">
										{t("admin:events.can_signup")}
									</Badge>
								)}
							</div>
						)}
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
