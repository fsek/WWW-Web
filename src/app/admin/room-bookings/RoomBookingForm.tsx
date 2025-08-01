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
import { room as RoomEnum } from "@/api";


export default function RoomBookingForm({
	defaultRoom,
}: {
	defaultRoom: "LC" | "Alumni" | "SK";
}) {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const [submitEnabled, setSubmitEnabled] = useState(true);

	const roomBookingSchema = z
		.object({
			room: z.nativeEnum(RoomEnum),
			start_time: z.date(),
			end_time: z.date(),
			description_sv: z.string().min(1).max(1000),
			council_id: z.number().int().positive().optional(),
			personal: z.boolean(),
		})
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
		).refine(
			(data) => {
				// Check if personal is false and council_id is not set
				if (data.personal === false && !data.council_id) {
					return false;
				}
				return true;
			},
			{
				message: t("calendar:error_missing_council"),
				path: ["council_id"],
			},
		);
	// export form values type for use in RoomBookingFormFields.tsx
	type RoomBookingFormValues = z.infer<typeof roomBookingSchema>;

	const roomBookingForm = useForm<RoomBookingFormValues>({
		resolver: zodResolver(roomBookingSchema),
		defaultValues: {
			room: defaultRoom as RoomEnum,
			start_time: new Date(Date.now() + 1000 * 60 * 60 * 1), // 1 hour later
			end_time: new Date(Date.now() + 1000 * 60 * 60 * 3), // 3 hours later
			description_sv: "",
			council_id: 0,
			personal: true,
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
				personal: true,
			});
		}
	}, [defaultRoom, open]);

	const checkboxFields = ["personal"] as const;

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
				personal: values.personal,
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