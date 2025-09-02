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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	deleteElectionMutation,
	getAllElectionsQueryKey,
	updateElectionMutation,
} from "@/api/@tanstack/react-query.gen";
import type { ElectionRead, ElectionCreate } from "@/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { Save } from "lucide-react";

const electionEditSchema = z.object({
	id: z.number(),
	title: z.string().min(2),
	start_time: z.string().min(1),
	end_time: z.string().min(1),
	description: z.string().nullable().optional(),
});

type ElectionEditFormType = z.infer<typeof electionEditSchema>;

interface ElectionsEditFormProps {
	open: boolean;
	onClose: () => void;
	selectedElection: ElectionRead;
}

function toInputDateString(d?: Date | string | null) {
	if (!d) return "";
	const date = typeof d === "string" ? new Date(d) : d;
	return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
		.toISOString()
		.slice(0, 16);
}

export default function ElectionsEditForm({
	open,
	onClose,
	selectedElection,
}: ElectionsEditFormProps) {
	const { t } = useTranslation("admin");
	const form = useForm<ElectionEditFormType>({
		resolver: zodResolver(electionEditSchema),
		defaultValues: {
			id: 0,
			title: "",
			start_time: "",
			end_time: "",
			description: "",
		},
	});

	useEffect(() => {
		if (open && selectedElection) {
			form.reset({
				id: selectedElection.election_id,
				title: selectedElection.title,
				start_time: toInputDateString(selectedElection.start_time),
				end_time: toInputDateString(selectedElection.end_time),
				description: selectedElection.description ?? "",
			});
		}
	}, [selectedElection, form, open]);

	const queryClient = useQueryClient();

	const updateElection = useMutation({
		...updateElectionMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllElectionsQueryKey() });
			toast.success(t("elections.edit_success"));
		},
		onError: (error) => {
			toast.error(
				typeof error?.detail === "string"
					? error.detail
					: t("elections.edit_error"),
			);
			onClose();
		},
	});

	const removeElection = useMutation({
		...deleteElectionMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllElectionsQueryKey() });
			toast.success(t("elections.remove_success"));
		},
		onError: (error) => {
			toast.error(
				typeof error?.detail === "string"
					? error.detail
					: t("elections.remove_error"),
			);
			onClose();
		},
	});

	function handleFormSubmit(values: ElectionEditFormType) {
		const updatedElection: ElectionCreate = {
			title: values.title,
			start_time: new Date(values.start_time),
			end_time: new Date(values.end_time),
			description: values.description ?? "",
		};

		updateElection.mutate(
			{
				path: { election_id: values.id },
				body: updatedElection,
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
		removeElection.mutate(
			{ path: { election_id: form.getValues("id") } },
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
					<DialogTitle>{t("elections.edit_election")}</DialogTitle>
				</DialogHeader>
				<hr />
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleFormSubmit)}
						className="grid gap-x-4 gap-y-3 lg:grid-cols-4"
					>
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("elections.title")}</FormLabel>
									<FormControl>
										<Input
											placeholder={t("elections.title_placeholder")}
											{...field}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="start_time"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("elections.start_time")}</FormLabel>
									<FormControl>
										<input type="datetime-local" {...field} />
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="end_time"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("elections.end_time")}</FormLabel>
									<FormControl>
										<input
											type="datetime-local"
											{...field}
											value={field.value ?? ""}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("elections.description")}</FormLabel>
									<FormControl>
										<Textarea
											placeholder={t("elections.description")}
											{...field}
											value={field.value ?? ""}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						<div className="space-x-2 lg:col-span-4 lg:grid-cols-subgrid">
							<ConfirmDeleteDialog
								open={deleteDialogOpen}
								onOpenChange={setDeleteDialogOpen}
								onConfirm={handleRemoveSubmit}
								triggerText={t("elections.remove_election")}
								title={t("elections.confirm_remove")}
								description={t("elections.confirm_remove_text")}
								confirmText={t("elections.remove_election")}
								cancelText={t("admin:cancel")}
							/>
							<Button type="submit" className="w-32 min-w-fit">
								<Save />
								{t("save")}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
