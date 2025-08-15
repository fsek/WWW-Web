import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogTitle } from "@radix-ui/react-dialog";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	createShiftMutation,
	viewAllShiftsQueryKey,
} from "@/api/@tanstack/react-query.gen";

import { useTranslation } from "react-i18next";
import CafeShiftFormFields from "./CafeShiftsFormFields";
import { toast } from "sonner";

const shiftsSchema = z
	.object({
		starts_at: z.date(),
		ends_at: z.date(),
		user_id: z.number().nullable().optional(),
	})
	.refine(
		(data) => {
			// Check if shift is in the past
			if (data.starts_at.getTime() < Date.now()) {
				return false;
			}
			return true;
		},
		{
			message: "Shift start time cannot be in the past",
			path: ["starts_at"],
		},
	)
	.refine(
		(data) => {
			// Check if end time is after start time
			if (data.ends_at.getTime() <= data.starts_at.getTime()) {
				return false;
			}
			return true;
		},
		{
			message: "End time must be after start time",
			path: ["ends_at"],
		},
	);

export type ShiftsFormValues = z.infer<typeof shiftsSchema>;

export default function CafeShiftsForm() {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const [submitEnabled, setSubmitEnabled] = useState(true);

	const shiftsForm = useForm<z.infer<typeof shiftsSchema>>({
		resolver: zodResolver(shiftsSchema),
		defaultValues: {
			starts_at: new Date(Date.now() + 1000 * 60 * 60 * 3), // 3 hours later
			ends_at: new Date(Date.now() + 1000 * 60 * 60 * 5), // 5 hours later
			user_id: null,
		},
	});

	const queryClient = useQueryClient();

	const createShift = useMutation({
		...createShiftMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: viewAllShiftsQueryKey() });
			setOpen(false);
			setSubmitEnabled(true);
			toast.success(t("admin:cafe_shifts.success_add"));
		},
		onError: (err) => {
			setOpen(false);
			setSubmitEnabled(true);
			toast.error(t("admin:cafe_shifts.error_add"));
		},
	});

	function onSubmit(values: z.infer<typeof shiftsSchema>) {
		setSubmitEnabled(false);
		createShift.mutate({
			body: {
				starts_at: values.starts_at,
				ends_at: values.ends_at,
			},
		});
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
				{t("admin:cafe_shifts.create_shift")}
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="min-w-fit lg:max-w-7xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>{t("admin:cafe_shifts.create_shift")}</DialogTitle>
					</DialogHeader>
					<hr />
					<Form {...shiftsForm}>
						<form onSubmit={shiftsForm.handleSubmit(onSubmit)}>
							<CafeShiftFormFields
								shiftsForm={shiftsForm}
								disabledFields={["user_id"]}
							/>

							<div className="space-x-2 mt-6 flex justify-end">
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
