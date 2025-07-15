import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogTitle } from "@radix-ui/react-dialog";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	createBookingMutation,
	getAllBookingQueryKey,
} from "@/api/@tanstack/react-query.gen";

import { AdminChooseDates } from "@/widgets/AdminChooseDates";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AdminChooseCouncil } from "@/widgets/AdminChooseCouncil";

export default function CarForm({ toast }: { toast: (msg: string) => void }) {
	const { t } = useTranslation();

	const carSchema = z
		.object({
			description: z.string().min(1),
			start_time: z.date(),
			end_time: z.date(),
			personal: z.boolean().default(true),
			council_id: z.number().int().positive(),
		})
		.refine(
			(data) => {
				// Check if start time equals end time
				if (
					new Date(data.start_time).getTime() ===
					new Date(data.end_time).getTime()
				) {
					return false;
				}

				// Check if start time is after end time
				if (
					new Date(data.start_time).getTime() >
					new Date(data.end_time).getTime()
				) {
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

	const [open, setOpen] = useState(false);
	const [submitEnabled, setSubmitEnabled] = useState(true);

	const carForm = useForm<z.infer<typeof carSchema>>({
		resolver: zodResolver(carSchema),
		defaultValues: {
			description: t("admin:car.default_description"),
			start_time: new Date(Date.now() + 1000 * 60),
			end_time: new Date(Date.now() + 1000 * 60 * 60 * 3),
			personal: true,
			council_id: 1,
		},
	});

	// https://next.jqueryscript.net/shadcn-ui/full-calendar-component-shadcn-ui/

	const queryClient = useQueryClient();

	const createBookings = useMutation({
		...createBookingMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllBookingQueryKey() });
			setOpen(false);
			setSubmitEnabled(true);
		},
		onError: (error) => {
			toast(
				t("admin:car.error_add") + (error?.detail ? `: ${error.detail}` : ""),
			);
			setSubmitEnabled(true);
		},
	});

	function onSubmit(values: z.infer<typeof carSchema>) {
		setSubmitEnabled(false);
		createBookings.mutate({
			body: {
				description: values.description,
				start_time: values.start_time,
				end_time: values.end_time,
				personal: values.personal,
				council_id: values.council_id,
			},
		});
	}

	return (
		<div className="p-3">
			<Button
				onClick={() => {
					carForm.reset();
					setOpen(true);
					setSubmitEnabled(true);
				}}
			>
				{t("admin:car.create_booking")}
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="min-w-fit lg:max-w-7xl">
					<DialogHeader>
						<DialogTitle>{t("admin:car.create_booking")}</DialogTitle>
					</DialogHeader>
					<hr />
					<Form {...carForm}>
						<form
							onSubmit={carForm.handleSubmit(onSubmit)}
							className="grid gap-x-4 gap-y-3 lg:grid-cols-4"
						>
							<FormField
								control={carForm.control}
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

							<FormField
								control={carForm.control}
								name="start_time"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("admin:car.start_time")}</FormLabel>
										<AdminChooseDates
											value={field.value}
											onChange={field.onChange}
										/>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={carForm.control}
								name="end_time"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("admin:car.end_time")}</FormLabel>
										<AdminChooseDates
											value={field.value}
											onChange={field.onChange}
										/>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={carForm.control}
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
								control={carForm.control}
								name="council_id"
								render={({ field }) => {
									const personalChecked = carForm.watch("personal");
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

							<div className="space-x-2 lg:col-span-2 lg:grid-cols-subgrid">
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
