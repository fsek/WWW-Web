import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import {
	Form,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	createMultipleShiftsMutation,
	viewAllShiftsQueryKey,
} from "@/api/@tanstack/react-query.gen";
import { useTranslation } from "react-i18next";
import { AdminChooseDates } from "@/widgets/AdminChooseDates";
import { toast } from "sonner";

// Helper: returns week number, and the Monday (week start) for a given Date
function getISOWeekInfo(date: Date) {
	// work in UTC to avoid timezone edge cases
	const tmp = new Date(
		Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
	);
	// Move to Thursday in current week (ISO week determination)
	const day = tmp.getUTCDay() || 7; // Mon=1..Sun=7
	tmp.setUTCDate(tmp.getUTCDate() + 4 - day); // now tmp is the Thursday of the ISO week
	const weekYear = tmp.getUTCFullYear();
	const yearStart = new Date(Date.UTC(weekYear, 0, 1));
	const weekNo = Math.ceil(
		((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
	);
	// get Monday (start of ISO week)
	const weekStart = new Date(tmp);
	weekStart.setUTCDate(tmp.getUTCDate() - 3); // Thursday - 3 days = Monday
	// normalize time to midnight UTC for weekStart
	weekStart.setUTCHours(0, 0, 0, 0);
	return { week: weekNo, weekStart };
}

const shiftsSchema = z
	.object({
		start: z.date(),
		end: z.date(), // this is inclusive
		configuration: z.enum(["full", "morning", "afternoon"]).default("full"),
	})
	.refine(
		(data) => {
			const startInfo = getISOWeekInfo(data.start);
			const endInfo = getISOWeekInfo(data.end);

			// end must not be before start (by weeks)
			const weeksBetween = Math.round(
				(endInfo.weekStart.getTime() - startInfo.weekStart.getTime()) /
					(7 * 24 * 60 * 60 * 1000),
			);
			if (weeksBetween < 0) {
				return false;
			}

			// allow up to 4 weeks inclusive
			if (weeksBetween > 3) {
				return false;
			}
			return true;
		},
		{
			message: "You can only add 4 weeks of shifts at a time",
			path: ["start"],
		},
	);

export type ShiftsFormValues = z.infer<typeof shiftsSchema>;

export default function MultiShiftsAddForm() {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const [submitEnabled, setSubmitEnabled] = useState(true);

	const shiftsForm = useForm<z.infer<typeof shiftsSchema>>({
		resolver: zodResolver(shiftsSchema),
		defaultValues: {
			start: new Date(Date.now()),
			end: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 1 week later
			configuration: "full",
		},
	});

	const queryClient = useQueryClient();

	const createShifts = useMutation({
		...createMultipleShiftsMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: viewAllShiftsQueryKey() });
			setOpen(false);
			setSubmitEnabled(true);
			toast.success(t("admin:cafe_shifts.multi.success_create_shifts"));
		},
		onError: (err) => {
			setOpen(false);
			setSubmitEnabled(true);
			toast.error(t("admin:cafe_shifts.multi.error_create_shifts"));
		},
	});

	function onSubmit(values: z.infer<typeof shiftsSchema>) {
		setSubmitEnabled(false);
		// minimal handling: consume new configuration value and close dialog
		// integrate with createShift.mutate(...) as needed by backend shape
		console.log("Create shifts:", values);

		const startWeekStart = getISOWeekInfo(values.start).weekStart;
		const endWeekStart = getISOWeekInfo(values.end).weekStart;

		createShifts.mutate({
			body: {
				startWeekStart: startWeekStart,
				endWeekStart: endWeekStart,
				configuration: values.configuration,
			},
		});

		// let mutation callbacks control UX; avoid duplicate toasts here
	}

	return (
		<div className="p-3">
			<Button
				onClick={() => {
					shiftsForm.reset();
					setOpen(true);
					setSubmitEnabled(true);
				}}
			>
				{t("admin:cafe_shifts.multi.create_shifts")}
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="min-w-fit lg:max-w-7xl max-h-[80vh]">
					<DialogHeader>
						<DialogTitle className="text-2xl">
							{t("admin:cafe_shifts.multi.title")}
						</DialogTitle>
						<DialogDescription>
							{t("admin:cafe_shifts.multi.description")}
						</DialogDescription>
					</DialogHeader>
					<hr />
					<Form {...shiftsForm}>
						<form onSubmit={shiftsForm.handleSubmit(onSubmit)}>
							<div className="w-full grid gap-x-4 gap-y-3 lg:grid-cols-2 mt-4">
								<FormField
									control={shiftsForm.control}
									name={"start"}
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												{t("admin:cafe_shifts.multi.start")}
											</FormLabel>
											<div className="flex items-center gap-4">
												<div className="flex-1">
													<AdminChooseDates
														value={field.value as Date}
														onChange={field.onChange}
													/>
												</div>
												<div className="ml-2 w-10 flex-shrink-0 text-sm text-muted-foreground">
													{field.value instanceof Date
														? `V.${getISOWeekInfo(field.value).week}`
														: ""}
												</div>
											</div>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={shiftsForm.control}
									name={"end"}
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("admin:cafe_shifts.multi.end")}</FormLabel>
											<div className="flex items-center gap-4">
												<div className="flex-1">
													<AdminChooseDates
														value={field.value as Date}
														onChange={field.onChange}
													/>
												</div>
												<div className="ml-2 w-10 flex-shrink-0 text-sm text-muted-foreground">
													{field.value instanceof Date
														? `V.${getISOWeekInfo(field.value).week}`
														: ""}
												</div>
											</div>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* New: configuration radio buttons spanning both columns */}
								<FormField
									control={shiftsForm.control}
									name={"configuration"}
									render={({ field }) => (
										<FormItem className="lg:col-span-2">
											<FormLabel>
												{t("admin:cafe_shifts.multi.configuration")}
											</FormLabel>
											<div className="flex gap-4 mt-2">
												<label className="flex items-center gap-2">
													<input
														type="radio"
														name={field.name}
														value="full"
														checked={field.value === "full"}
														onChange={(e) => field.onChange(e.target.value)}
													/>
													<span>{t("admin:cafe_shifts.multi.full")}</span>
												</label>

												<label className="flex items-center gap-2">
													<input
														type="radio"
														name={field.name}
														value="morning"
														checked={field.value === "morning"}
														onChange={(e) => field.onChange(e.target.value)}
													/>
													<span>{t("admin:cafe_shifts.multi.morning")}</span>
												</label>

												<label className="flex items-center gap-2">
													<input
														type="radio"
														name={field.name}
														value="afternoon"
														checked={field.value === "afternoon"}
														onChange={(e) => field.onChange(e.target.value)}
													/>
													<span>{t("admin:cafe_shifts.multi.afternoon")}</span>
												</label>
											</div>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="space-x-2 mt-6 flex justify-end">
								<Button
									type="submit"
									disabled={!submitEnabled}
									className="w-32 min-w-fit"
								>
									{t("admin:cafe_shifts.multi.create_shifts")}
								</Button>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
