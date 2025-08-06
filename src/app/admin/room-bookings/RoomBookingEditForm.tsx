import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import {
	getAllRoomBookingsQueryKey,
	updateRoomBookingMutation,
	removeRoomBookingMutation,
} from "@/api/@tanstack/react-query.gen";
import type { RoomBookingRead, RoomBookingUpdate } from "@/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import RoomBookingFormFields from "./RoomBookingFormFields";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { Save } from "lucide-react";
import { room as RoomEnum } from "@/api";

const roomBookingEditSchema = z.object({
	id: z.number(),
	room: z.nativeEnum(RoomEnum),
	start_time: z.date(),
	end_time: z.date(),
	description_sv: z.string().min(1).max(1000),
	council_id: z.number().int().positive(),
});

export type RoomBookingEditFormValues = z.infer<typeof roomBookingEditSchema>;

interface RoomBookingEditFormProps {
	open: boolean;
	onClose: () => void;
	selectedRoomBooking: RoomBookingRead;
}

export default function RoomBookingEditForm({
	open,
	onClose,
	selectedRoomBooking,
}: RoomBookingEditFormProps) {
	const { t } = useTranslation();

	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	const form = useForm<RoomBookingEditFormValues>({
		resolver: zodResolver(roomBookingEditSchema),
		defaultValues: {
			// Values for when no booking is selected
			room: "LC" as RoomEnum,
			start_time: new Date(Date.now() + 1000 * 60 * 60 * 1), // 1 hour later
			end_time: new Date(Date.now() + 1000 * 60 * 60 * 3), // 3 hours later
			description_sv: "",
			council_id: 0,
		},
	});

	const checkboxFields = [] as const;

	useEffect(() => {
		if (open && selectedRoomBooking) {
			form.reset({
				...selectedRoomBooking,
				description_sv: selectedRoomBooking.description,
				start_time: new Date(selectedRoomBooking.start_time),
				end_time: new Date(selectedRoomBooking.end_time),
				council_id: selectedRoomBooking.council.id,
				room: selectedRoomBooking.room as RoomEnum,
			});
		}
	}, [selectedRoomBooking, form, open]);

	const queryClient = useQueryClient();

	const updateRoomBooking = useMutation({
		...updateRoomBookingMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllRoomBookingsQueryKey() });
		},
		onError: () => {
			onClose();
		},
	});

	const removeRoomBooking = useMutation({
		...removeRoomBookingMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllRoomBookingsQueryKey() });
		},
		onError: () => {
			onClose();
		},
	});

	function handleFormSubmit(values: RoomBookingEditFormValues) {
		const updatedRoomBooking: RoomBookingUpdate = {
			start_time: values.start_time,
			end_time: values.end_time,
			description: values.description_sv,
		};

		updateRoomBooking.mutate(
			{
				path: { booking_id: values.id },
				body: updatedRoomBooking,
			},
			{
				onSuccess: () => {
					onClose();
				},
			},
		);
	}

	function handleRemoveSubmit() {
		removeRoomBooking.mutate(
			{ path: { booking_id: form.getValues("id") } },
			{
				onSuccess: () => {
					onClose();
				},
			},
		);
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(isOpen) => {
				if (!isOpen) {
					onClose();
				}
			}}
		>
			<DialogContent className="min-w-fit lg:max-w-7xl">
				<DialogHeader>
					<DialogTitle>{t("admin:room_bookings.edit_booking")}</DialogTitle>
				</DialogHeader>
				<hr />
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleFormSubmit)}>
						<RoomBookingFormFields
							roomBookingForm={form}
							checkboxFields={checkboxFields}
							disabled_fields={[
								"room",
								"council_id",
								"recur_interval_days",
								"recur_until",
							]}
						/>

						<div className="space-x-2 mt-6 flex justify-end">
							<ConfirmDeleteDialog
								open={deleteDialogOpen}
								onOpenChange={setDeleteDialogOpen}
								onConfirm={handleRemoveSubmit}
								triggerText={t("admin:remove")}
								title={t("admin:room_bookings.confirm_remove")}
								description={t("admin:room_bookings.confirm_remove_text")}
								confirmText={t("admin:remove")}
								cancelText={t("admin:cancel")}
							/>
							<Button type="submit" className="w-32 min-w-fit">
								<Save />
								{t("admin:save")}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
