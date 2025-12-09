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
import type { ElectionRead, ElectionUpdate } from "@/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { Save } from "lucide-react";
import AdminChooseMultPosts from "@/widgets/AdminChooseMultPosts";
import { AdminChooseDates } from "@/widgets/AdminChooseDates";
import { ClearableAdminChooseDates } from "@/widgets/ClearableAdminChooseDates";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import getErrorMessage from "@/help_functions/getErrorMessage";

const electionEditSchema = z.object({
	id: z.number(),
	title_sv: z.string().min(1),
	title_en: z.string().min(1),
	start_time: z.date(),
	description_sv: z.string().nullable().optional(),
	description_en: z.string().nullable().optional(),
	visible: z.boolean().optional(),
});

type ElectionEditFormType = z.infer<typeof electionEditSchema>;

interface ElectionsEditFormProps {
	open: boolean;
	onClose: () => void;
	selectedElection: ElectionRead;
}

function toDateOrUndefined(d?: string | Date | null) {
	if (!d) return undefined;
	return typeof d === "string" ? new Date(d) : d;
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
			title_sv: "",
			title_en: "",
			start_time: new Date(),
			description_sv: "",
			description_en: "",
			visible: true,
		},
	});

	useEffect(() => {
		if (open && selectedElection) {
			form.reset({
				id: selectedElection.election_id,
				title_sv: selectedElection.title_sv ?? "",
				title_en: selectedElection.title_en ?? "",
				start_time:
					toDateOrUndefined(selectedElection.start_time) ?? new Date(),
				description_sv: selectedElection.description_sv ?? "",
				description_en: selectedElection.description_en ?? "",
				visible: selectedElection.visible ?? false,
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
			toast.error(`${t("elections.edit_error")} ${getErrorMessage(error, t)}`);
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
				`${t("elections.remove_error")} ${getErrorMessage(error, t)}`,
			);
			onClose();
		},
	});

	function handleFormSubmit(values: ElectionEditFormType) {
		const updatedElection: ElectionUpdate = {
			title_sv: values.title_sv,
			title_en: values.title_en,
			start_time: new Date(values.start_time),
			description_sv: values.description_sv ?? "",
			description_en: values.description_en ?? "",
			visible: values.visible ?? false,
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
						{/* title_sv */}
						<FormField
							control={form.control}
							name="title_sv"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("elections.title_sv")}</FormLabel>
									<FormControl>
										<Input
											placeholder={t("elections.title_placeholder")}
											{...field}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						{/* title_en */}
						<FormField
							control={form.control}
							name="title_en"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("elections.title_en")}</FormLabel>
									<FormControl>
										<Input
											placeholder={t("elections.title_placeholder")}
											{...field}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						{/* start_time */}
						<FormField
							control={form.control}
							name="start_time"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("elections.start_time")}</FormLabel>
									<FormControl>
										<AdminChooseDates
											value={field.value as Date}
											onChange={field.onChange}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						{/* visible */}
						<FormField
							control={form.control}
							name="visible"
							render={({ field }) => (
								<FormItem className="text-center justify-center">
									<Label className="hover:bg-accent/50 flex gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-muted-foreground has-[[aria-checked=true]]:bg-accent">
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
											className="data-[state=checked]:border-[var(--wavelength-612-color-light)] data-[state=checked]:bg-[var(--wavelength-612-color-light)] data-[state=checked]:text-white"
										/>
										<div className="grid gap-1.5 font-normal">
											<p className="text-sm leading-none font-medium">
												{t("admin:elections.visible_explanation")}
											</p>
										</div>
									</Label>
								</FormItem>
							)}
						/>
						{/* description_sv */}
						<FormField
							control={form.control}
							name="description_sv"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("description_sv")}</FormLabel>
									<FormControl>
										<Textarea
											placeholder={t("description")}
											{...field}
											value={field.value ?? ""}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						{/* description_en */}
						<FormField
							control={form.control}
							name="description_en"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("description_en")}</FormLabel>
									<FormControl>
										<Textarea
											placeholder={t("description")}
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
								confirmByTyping
								confirmByTypingText={t("elections.type_remove")}
								confirmByTypingKey={selectedElection?.title_sv ?? "Error"}
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
