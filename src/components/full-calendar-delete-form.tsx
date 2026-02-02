"use client";

import React from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useEvents } from "@/utils/full-calendar-event-context";
import { ToastAction } from "./ui/toast";
import { useTranslation } from "react-i18next";

interface EventDeleteFormProps {
	id?: string;
	title_sv?: string;
}

export function EventDeleteForm({ id, title_sv }: EventDeleteFormProps) {
	const { t } = useTranslation("calendar");
	const { deleteEvent } = useEvents();
	const { eventDeleteOpen, setEventDeleteOpen, setEventViewOpen } = useEvents();

	const { toast } = useToast();

	function onSubmit() {
		if (!id) throw new Error("EventDeleteForm requires a non-null id prop.");

		deleteEvent(id);
		setEventDeleteOpen(false);
		setEventViewOpen(false);
		toast({
			title: t("delete.toast.title"),
			action: (
				<ToastAction altText={t("delete.toast.dismiss_alt")}>
					{t("delete.toast.dismiss")}
				</ToastAction>
			),
		});
	}

	return (
		<AlertDialog open={eventDeleteOpen}>
			<AlertDialogTrigger asChild>
				<Button variant="destructive" onClick={() => setEventDeleteOpen(true)}>
					{t("delete.button")}
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogDescription className="sr-only">
					A popup dialog confirming the deletion of an event.
				</AlertDialogDescription>
				<AlertDialogHeader>
					<AlertDialogTitle className="flex flex-row justify-between items-center">
						{t("delete.delete")} "{title_sv}"
					</AlertDialogTitle>
					{t("delete.are_you_sure")}
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={() => setEventDeleteOpen(false)}>
						{t("cancel")}
					</AlertDialogCancel>
					<Button variant="destructive" onClick={() => onSubmit()}>
						{t("delete.delete")}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
