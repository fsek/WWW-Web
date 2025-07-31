import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import { AdminChooseDates } from "@/widgets/AdminChooseDates";
import { AdminChooseCouncil } from "@/widgets/AdminChooseCouncil";
import {
	getAllCarBookingsQueryKey,
	updateCarBookingMutation,
	removeCarBookingMutation,
} from "@/api/@tanstack/react-query.gen";
import type { CarBookingRead, CarBookingUpdate } from "../../../api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/ui/ConfirmDeleteDialog";
import { Save } from "lucide-react";

interface CarEditFormProps {
	open: boolean;
	onClose: () => void;
	selectedBooking: CarBookingRead;
}

export default function CarEditForm({
	open,
	onClose,
	selectedBooking,
}: CarEditFormProps) {
	const { t } = useTranslation();

	const carEditSchema = z
		.object({
			booking_id: z.number(),
			description: z.string().min(1),
			start_time: z.date(),
			end_time: z.date(),
			confirmed: z.boolean().default(false),
			personal: z.boolean().default(true),
			council_id: z.number().int().positive(),
		})
		.refine(
			(data) => {
				// Check if start time equals end time
				if (data.start_time.getTime() === data.end_time.getTime()) {
					return false;
				}

				// Check if start time is after end time
				if (data.start_time.getTime() > data.end_time.getTime()) {
					return false;
				}

				return true;
			},
			{
				message: t("admin:car.error_start_end"),
				path: ["end_time"], // Shows the error on the end time field
			},
		)
		.refine(
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

	type CarEditFormType = z.infer<typeof carEditSchema>;

	const form = useForm<CarEditFormType>({
		resolver: zodResolver(carEditSchema),
		defaultValues: {
			description: "",
			start_time: new Date(Date.now()),
			end_time: new Date(Date.now() + 60 * 60 * 1000),
			confirmed: false,
			personal: true,
			council_id: 1,
		},
	});

	useEffect(() => {
		if (open && selectedBooking) {
			form.reset({
				...selectedBooking,
				booking_id: selectedBooking.booking_id,
				start_time: new Date(selectedBooking.start_time),
				end_time: new Date(selectedBooking.end_time),
				confirmed: selectedBooking.confirmed ?? false,
				personal: selectedBooking.personal ?? true,
				council_id: selectedBooking.council_id ?? 1,
			});
		}
	}, [selectedBooking, form, open]);

	const queryClient = useQueryClient();

	const updateBooking = useMutation({
		...updateCarBookingMutation(),
		throwOnError: false,
		onSuccess: () => {
			toast.success(t("admin:car.success_edit"));
			queryClient.invalidateQueries({ queryKey: getAllCarBookingsQueryKey() });
		},
		onError: (error) => {
			toast.error(
				t("admin:car.error_edit") + (error?.detail ? `: ${error.detail}` : ""),
			);
			onClose();
		},
	});

	const removeBooking = useMutation({
		...removeCarBookingMutation(),
		throwOnError: false,
		onSuccess: () => {
			toast.success(t("admin:car.success_delete"));
			queryClient.invalidateQueries({ queryKey: getAllCarBookingsQueryKey() });
		},
		onError: (error) => {
			toast.error(
				t("admin:car.error_delete") +
					(error?.detail ? `: ${error.detail}` : ""),
			);
			onClose();
		},
	});

	function handleFormSubmit(values: CarEditFormType) {
		const updatedBooking: CarBookingUpdate = {
			description: values.description,
			start_time: new Date(values.start_time),
			end_time: new Date(values.end_time),
			confirmed: values.confirmed,
			personal: values.personal,
			council_id: values.council_id,
		};

		updateBooking.mutate(
			{
				path: { booking_id: values.booking_id },
				body: updatedBooking,
			},
			{
				onSuccess: () => {
					onClose();
				},
			},
		);
	}

	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	function handleRemoveSubmit() {
		const bookingId = form.getValues("booking_id");
		if (bookingId) {
			removeBooking.mutate(
				{ path: { booking_id: bookingId } },
				{
					onSuccess: () => {
						onClose();
					},
				},
			);
		} else {
			toast.error(t("admin:car.error_missing_id"));
		}
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
			<DialogContent className="min-w-fit lg:max-w-7xl max-2xl:top-0 max-2xl:translate-y-0 max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{t("admin:car.edit_booking")}</DialogTitle>
				</DialogHeader>
				<hr />
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleFormSubmit)}
						className="grid gap-x-4 gap-y-3 lg:grid-cols-4"
					>
						{/* Description Field */}
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("admin:description")}</FormLabel>
									<FormControl>
										<Input placeholder={t("admin:description")} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Start Time Field */}
						<FormField
							control={form.control}
							name="start_time"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("admin:car.start_time")}</FormLabel>
									<AdminChooseDates
										value={new Date(field.value)}
										onChange={(newStart: Date) => {
											field.onChange(newStart);
											const end = form.getValues("end_time");
											if (end && new Date(end).getTime() < newStart.getTime()) {
												const newEnd = new Date(
													newStart.getTime() + 60 * 60 * 1000,
												);
												form.setValue("end_time", newEnd, {
													shouldDirty: true,
													shouldValidate: true,
												});
											}
										}}
									/>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* End Time Field */}
						<FormField
							control={form.control}
							name="end_time"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("admin:car.end_time")}</FormLabel>
									<AdminChooseDates
										value={new Date(field.value)}
										onChange={field.onChange}
									/>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Confirmed Field */}
						<FormField
							control={form.control}
							name="confirmed"
							render={({ field }) => (
								<Label className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-muted-foreground has-[[aria-checked=true]]:bg-accent">
									<Checkbox
										checked={field.value}
										onCheckedChange={field.onChange}
										className="data-[state=checked]:border-[var(--wavelength-612-color-light)] data-[state=checked]:bg-[var(--wavelength-612-color-light)] data-[state=checked]:text-white"
									/>
									<div className="grid gap-1.5 font-normal">
										<p className="text-sm leading-none font-medium">
											{t("admin:car.confirmed")}
										</p>
									</div>
								</Label>
							)}
						/>

						{/* Personal Field */}
						<FormField
							control={form.control}
							name="personal"
							render={({ field }) => (
								<Label className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-muted-foreground has-[[aria-checked=true]]:bg-accent">
									<Checkbox
										checked={field.value}
										onCheckedChange={field.onChange}
										className="data-[state=checked]:border-[var(--wavelength-612-color-light)] data-[state=checked]:bg-[var(--wavelength-612-color-light)] data-[state=checked]:text-white"
									/>
									<div className="grid gap-1.5 font-normal">
										<p className="text-sm leading-none font-medium">
											{t("admin:car.personal")}
										</p>
									</div>
								</Label>
							)}
						/>

						{/* Council */}
						<FormField
							control={form.control}
							name="council_id"
							render={({ field }) => {
								const personalChecked = form.watch("personal");
								return (
									<FormItem>
										<FormLabel>{t("admin:events.council")}</FormLabel>
										{personalChecked ? (
											<div className="text-muted-foreground text-sm py-2">
												{t("admin:car.no_council_needed")}
											</div>
										) : (
											<AdminChooseCouncil
												value={field.value as number}
												onChange={(value: number) => field.onChange(value)}
											/>
										)}
										<FormMessage />
									</FormItem>
								);
							}}
						/>

						{/* Button Section */}
						<div className="space-x-2 lg:col-span-2 lg:grid-cols-subgrid">
							<ConfirmDeleteDialog
								open={deleteDialogOpen}
								onOpenChange={setDeleteDialogOpen}
								onConfirm={handleRemoveSubmit}
								triggerText={t("admin:remove")}
								title={t("admin:car.delete_confirm_title")}
								description={t("admin:car.delete_confirm_text")}
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
