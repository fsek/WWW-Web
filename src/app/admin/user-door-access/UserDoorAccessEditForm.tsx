import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	updateUserAccessMutation,
	getAllUserAccessesQueryKey,
	deleteUserAccessMutation,
} from "@/api/@tanstack/react-query.gen";
import { useTranslation } from "react-i18next";
import { AdminChooseDates } from "@/widgets/AdminChooseDates";
import { toast } from "sonner";
import type { UserAccessRead } from "@/api";
import { ConfirmDeleteDialog } from "@/components/ui/ConfirmDeleteDialog";
import { Save } from "lucide-react";
import { door } from "@/api";

const doorAccessSchema = z.object({
	door: z.nativeEnum(door),
	starttime: z.date().nullable(),
	endtime: z.date().nullable(),
});

interface DoorAccessEditFormProps {
	open: boolean;
	onClose: () => void;
	selectedAccess: UserAccessRead;
}

export default function UserDoorAccessEditForm({
	open,
	onClose,
	selectedAccess,
}: DoorAccessEditFormProps) {
	const [submitEnabled, setSubmitEnabled] = useState(true);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const doorAccessEditForm = useForm<z.infer<typeof doorAccessSchema>>({
		resolver: zodResolver(doorAccessSchema),
	});
	const { t } = useTranslation("admin");

	const queryClient = useQueryClient();

	// Initialize form with existing access data
	useEffect(() => {
		if (selectedAccess) {
			doorAccessEditForm.reset({
				door: selectedAccess.door as door,
				starttime: selectedAccess.starttime
					? new Date(selectedAccess.starttime)
					: null,
				endtime: selectedAccess.endtime
					? new Date(selectedAccess.endtime)
					: null,
			});
		}
	}, [selectedAccess, doorAccessEditForm]);

	const updateAccess = useMutation({
		...updateUserAccessMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllUserAccessesQueryKey() });
			onClose();
			setSubmitEnabled(true);
			toast.success(t("door_access.success_edit"));
		},
		onError: () => {
			toast.error(t("door_access.error_edit"));
			setSubmitEnabled(true);
		},
	});

	const deleteAccess = useMutation({
		...deleteUserAccessMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllUserAccessesQueryKey() });
			onClose();
			toast.success(t("door_access.success_delete"));
		},
		onError: () => {
			toast.error(t("door_access.error_delete"));
		},
	});

	function onSubmit(values: z.infer<typeof doorAccessSchema>) {
		setSubmitEnabled(false);
		updateAccess.mutate({
			path: {
				access_id: selectedAccess.user_access_id,
			},
			body: {
				door: values.door,
				starttime: values.starttime,
				endtime: values.endtime,
			},
		});
	}

	function handleRemoveAccess() {
		deleteAccess.mutate({
			path: {
				access_id: selectedAccess.user_access_id,
			},
		});
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
					<DialogTitle>
						{t("door_access.edit_access")} {selectedAccess?.user?.first_name}{" "}
						{selectedAccess?.user?.last_name}
					</DialogTitle>
				</DialogHeader>
				<hr />
				<Form {...doorAccessEditForm}>
					<form
						onSubmit={doorAccessEditForm.handleSubmit(onSubmit)}
						className="grid gap-x-4 gap-y-3 lg:grid-cols-2"
					>
						<FormField
							control={doorAccessEditForm.control}
							name="door"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("door_access.door")}</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue
													placeholder={t("door_access.select_door")}
												/>
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{Object.values(door).map((doorValue) => (
												<SelectItem key={doorValue} value={doorValue}>
													{doorValue}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="hidden lg:block" />
						<FormField
							control={doorAccessEditForm.control}
							name="starttime"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("door_access.starttime")}</FormLabel>
									<AdminChooseDates
										value={field.value ?? undefined}
										onChange={field.onChange}
									/>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={doorAccessEditForm.control}
							name="endtime"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("door_access.endtime")}</FormLabel>
									<AdminChooseDates
										value={field.value ?? undefined}
										onChange={field.onChange}
									/>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="space-x-2 lg:col-span-2 lg:grid-cols-subgrid flex flex-row items-center">
							<Button
								type="submit"
								disabled={!submitEnabled}
								className="w-32 min-w-fit"
							>
								<Save />
								{t("save")}
							</Button>
							<ConfirmDeleteDialog
								open={confirmOpen}
								onOpenChange={setConfirmOpen}
								onConfirm={handleRemoveAccess}
								triggerText={t("remove")}
								title={t("door_access.confirm_remove")}
								description={t("door_access.confirm_remove_text")}
								confirmText={t("remove")}
								cancelText={t("cancel")}
							/>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
