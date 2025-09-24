import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import {
	Form,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogTitle } from "@radix-ui/react-dialog";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	createRoomBookingMutation,
	getAllRoomBookingsQueryKey,
} from "@/api/@tanstack/react-query.gen";
import { useTranslation } from "react-i18next";
import RoomBookingFormFields from "./RoomBookingFormFields";
import { room, room as RoomEnum } from "@/api";

const roomBookingSchema = z
	.object({
		room: z.nativeEnum(RoomEnum),
		start_time: z.date(),
		end_time: z.date(),
		description_sv: z.string().min(1).max(1000),
		council_id: z.number().int().positive(),
		recur_interval_days: z.number().int().nonnegative().optional(),
		recur_until: z.date().optional(),
	})
	.refine(
		(data) => {
			// Check if booking is in the past
			if (data.start_time.getTime() < Date.now()) {
				return false;
			}
			return true;
		},
		{
			message: "Booking start time cannot be in the past",
			path: ["start_time"],
		},
	)
	.refine(
		(data) => {
			// Check if end time is after start time
			if (data.end_time.getTime() <= data.start_time.getTime()) {
				return false;
			}
			return true;
		},
		{
			message: "End time must be after start time",
			path: ["end_time"],
		},
	);

// export form values type for use in RoomBookingFormFields.tsx
export type RoomBookingFormValues = z.infer<typeof roomBookingSchema>;

export default function RoomBookingForm({
	defaultRoom,
}: {
	defaultRoom: `${room}`;
}) {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const [submitEnabled, setSubmitEnabled] = useState(true);

	const roomBookingForm = useForm<z.infer<typeof roomBookingSchema>>({
		resolver: zodResolver(roomBookingSchema),
		defaultValues: {
			room: defaultRoom as RoomEnum,
			start_time: new Date(Date.now() + 1000 * 60 * 60 * 1), // 1 hour later
			end_time: new Date(Date.now() + 1000 * 60 * 60 * 3), // 3 hours later
			description_sv: "",
			council_id: 0,
			recur_interval_days: undefined,
			recur_until: undefined,
		},
	});

	// Reset form values when defaultRoom changes and dialog is opened
	useEffect(() => {
		if (open) {
			roomBookingForm.reset({
				room: defaultRoom as RoomEnum,
				start_time: new Date(Date.now() + 1000 * 60 * 60 * 1),
				end_time: new Date(Date.now() + 1000 * 60 * 60 * 3),
				description_sv: "",
				council_id: 0,
				recur_interval_days: undefined,
				recur_until: undefined,
			});
		}
	}, [defaultRoom, open]);

	const checkboxFields = [] as const;

	const queryClient = useQueryClient();

	const createRoomBooking = useMutation({
		...createRoomBookingMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllRoomBookingsQueryKey() });
			setOpen(false);
			setSubmitEnabled(true);
		},
		onError: () => {
			setOpen(false);
			setSubmitEnabled(true);
		},
	});

	function onSubmit(values: z.infer<typeof roomBookingSchema>) {
		setSubmitEnabled(false);
		createRoomBooking.mutate({
			body: {
				room: values.room,
				start_time: values.start_time,
				end_time: values.end_time,
				description: values.description_sv,
				council_id: values.council_id,
				recur_interval_days: values.recur_interval_days,
				recur_until: values.recur_until,
			},
		});
	}

	return (
		<div className="p-3">
			<Button
				onClick={() => {
					roomBookingForm.reset();
					setOpen(true);
					setSubmitEnabled(true);
				}}
			>
				{t("admin:room_bookings.create_booking")}
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="min-w-fit lg:max-w-7xl">
					<DialogHeader>
						<DialogTitle>{t("admin:room_bookings.create_booking")}</DialogTitle>
					</DialogHeader>
					<hr />
					<Form {...roomBookingForm}>
						<form onSubmit={roomBookingForm.handleSubmit(onSubmit)}>
							<RoomBookingFormFields
								roomBookingForm={roomBookingForm}
								checkboxFields={checkboxFields}
							/>

							<div className="space-x-2 mt-6 flex justify-end">
								<Button variant="outline" className="w-32 min-w-fit">
									{t("admin:preview")}
								</Button>
								<Button
									type="submit"
									disabled={!submitEnabled}
									className="w-32 min-w-fit"
								>
									{t("admin:submit")}
								</Button>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
}