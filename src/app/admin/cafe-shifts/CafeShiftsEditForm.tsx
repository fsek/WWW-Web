import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import {
	updateShiftMutation,
	deleteShiftMutation,
	viewAllShiftsQueryKey,
} from "@/api/@tanstack/react-query.gen";
import type { CafeShiftRead, CafeShiftUpdate } from "@/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import CafeShiftFormFields from "./CafeShiftsFormFields";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { Save } from "lucide-react";
import { toast } from "sonner";

const shiftsEditSchema = z.object({
	id: z.number(),
	starts_at: z.date(),
	ends_at: z.date(),
	user_id: z.number().nullable().optional(),
	user_name: z.string().nullable().optional(),
});

export type ShiftsEditFormValues = z.infer<typeof shiftsEditSchema>;

interface ShiftsEditFormProps {
	open: boolean;
	onClose: () => void;
	selectedShift: CafeShiftRead;
}

export default function CafeShiftsEditForm({
	open,
	onClose,
	selectedShift,
}: ShiftsEditFormProps) {
	const { t } = useTranslation();

	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	const form = useForm<ShiftsEditFormValues>({
		resolver: zodResolver(shiftsEditSchema),
		defaultValues: {
			id: selectedShift?.id ?? 0,
			starts_at: new Date(Date.now() + 1000 * 60 * 60 * 3), // 3 hours later
			ends_at: new Date(Date.now() + 1000 * 60 * 60 * 5), // 5 hours later
			user_id: null,
			user_name: null,
		},
	});

	useEffect(() => {
		if (open && selectedShift) {
			form.reset({
				...selectedShift,
				id: selectedShift.id,
				starts_at: new Date(selectedShift.starts_at),
				ends_at: new Date(selectedShift.ends_at),
				user_id: selectedShift.user ? selectedShift.user.id : null,
				user_name: selectedShift.user
					? `${selectedShift.user.first_name} ${selectedShift.user.last_name}`
					: null,
			});
		}
	}, [selectedShift, form, open]);

	const queryClient = useQueryClient();

	const updateShift = useMutation({
		...updateShiftMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: viewAllShiftsQueryKey() });
			toast.success(t("admin:cafe_shifts.success_edit"));
		},
		onError: (err) => {
			onClose();
			toast.error(t("admin:cafe_shifts.error_edit"));
		},
	});

	const removeShift = useMutation({
		...deleteShiftMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: viewAllShiftsQueryKey() });
			toast.success(t("admin:cafe_shifts.success_delete"));
		},
		onError: (err) => {
			onClose();
			toast.error(t("admin:cafe_shifts.error_delete"));
		},
	});

	function handleFormSubmit(values: ShiftsEditFormValues) {
		const updatedShift: CafeShiftUpdate = {
			starts_at: values.starts_at,
			ends_at: values.ends_at,
			user_id: values.user_id,
		};

		updateShift.mutate(
			{
				path: { shift_id: values.id },
				body: updatedShift,
			},
			{
				onSuccess: () => {
					onClose();
				},
			},
		);
	}

	function handleRemoveSubmit() {
		removeShift.mutate(
			{ path: { shift_id: form.getValues("id") } },
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
			<DialogContent className="min-w-fit lg:max-w-7xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{t("admin:cafe_shifts.edit_shift")}</DialogTitle>
				</DialogHeader>
				<hr />
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleFormSubmit)}>
						<CafeShiftFormFields shiftsForm={form} />

						<div className="space-x-2 mt-6 flex justify-end">
							<ConfirmDeleteDialog
								open={deleteDialogOpen}
								onOpenChange={setDeleteDialogOpen}
								onConfirm={handleRemoveSubmit}
								triggerText={t("admin:remove")}
								title={t("admin:cafe_shifts.confirm_remove")}
								description={t("admin:cafe_shifts.confirm_remove_text")}
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
