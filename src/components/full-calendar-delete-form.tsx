"use client";

import React from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
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
	title?: string;
}

export function EventDeleteForm({ id, title }: EventDeleteFormProps) {
	const { t } = useTranslation("calendar");
	const { deleteEvent } = useEvents();
	const { eventDeleteOpen, setEventDeleteOpen, setEventViewOpen } = useEvents();

	const { toast } = useToast();

	function onSubmit() {
		deleteEvent(id!);
		setEventDeleteOpen(false);
		setEventViewOpen(false);
		toast({
			title: t("delete.toast.title"),
			action: (
				<ToastAction altText={t("delete.toast.dismiss_alt")}>{t("delete.toast.dismiss")}</ToastAction>
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
				<AlertDialogHeader>
					<AlertDialogTitle className="flex flex-row justify-between items-center">
						{t("delete.delete")} "{title}"
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
