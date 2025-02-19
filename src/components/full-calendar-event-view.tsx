import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { CalendarEvent } from "@/utils/full-calendar-seed";
import { EventDeleteForm } from "./full-calendar-delete-form";
import { EventEditForm } from "./full-calendar-edit-form";
import { useEvents } from "@/context/full-calendar-event-context";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { isNull } from "util";

interface EventViewProps {
	event?: CalendarEvent;
	showDescription: boolean;
	handleOpenDetails?: (event?: CalendarEvent) => void;
	disableEdit: boolean;
}

export function EventView({ event, showDescription, handleOpenDetails, disableEdit }: EventViewProps) {
	const { eventViewOpen, setEventViewOpen } = useEvents();

	return (
		<>
			<AlertDialog open={eventViewOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="flex flex-row justify-between items-center">
							<h1>{event?.title}</h1>
							<AlertDialogCancel onClick={() => {setEventViewOpen(false)}}>
								<X className="h-5 w-5" />
							</AlertDialogCancel>
						</AlertDialogTitle>
						<table>
							<tr>
								<th>Time:</th>
								<td>{`${event?.start.toLocaleTimeString()} - ${event?.end.toLocaleTimeString()}`}</td>
							</tr>
							{(showDescription) && (
								<tr>
									<th>Description:</th>
									<td>{event?.description}</td>
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
						</table>
					</AlertDialogHeader>
					<AlertDialogFooter>
						{(handleOpenDetails != null) && (
							<Button variant="outline" onClick={() => handleOpenDetails(event)}>
								Details
							</Button>)
						}
						{(!disableEdit) && (
						<EventDeleteForm id={event?.id} title={event?.title}/>
						)}
						<EventEditForm
							oldEvent={event}
							event={event}
							isDrag={false}
							displayButton={!disableEdit}
							showDescription={showDescription}
						/>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
