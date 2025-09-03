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
import AdminChooseMultPosts from "@/widgets/AdminChooseMultPosts";
import { AdminChooseDates } from "@/widgets/AdminChooseDates";
import { ClearableAdminChooseDates } from "@/widgets/ClearableAdminChooseDates";

const electionEditSchema = z.object({
	id: z.number(),
	title_sv: z.string().min(1),
	title_en: z.string().min(1),
	start_time: z.date(),
	end_time_guild_meeting: z.date().optional(),
	end_time_middle_meeting: z.date().optional(),
	end_time_all: z.date(),
	description_sv: z.string().nullable().optional(),
	description_en: z.string().nullable().optional(),
	post_ids: z.array(z.number()).optional(),
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

const MS_ONE_DAY = 86400000;

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
			end_time_guild_meeting: undefined,
			end_time_middle_meeting: undefined,
			end_time_all: new Date(Date.now() + MS_ONE_DAY * 10), // 10 days
			description_sv: "",
			description_en: "",
			post_ids: [],
		},
	});

	useEffect(() => {
		if (open && selectedElection) {
			form.reset({
				id: selectedElection.election_id,
				title_sv: selectedElection.title_sv ?? "",
				title_en: selectedElection.title_en ?? "",
				start_time: toDateOrUndefined(selectedElection.start_time) ?? new Date(),
				end_time_guild_meeting: toDateOrUndefined(selectedElection.end_time_guild_meeting),
				end_time_middle_meeting: toDateOrUndefined(selectedElection.end_time_middle_meeting),
				end_time_all: toDateOrUndefined(selectedElection.end_time_all),
				description_sv: selectedElection.description_sv ?? "",
				description_en: selectedElection.description_en ?? "",
				post_ids: selectedElection.posts.map((post) => post.id) ?? [],
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
			title_sv: values.title_sv,
			title_en: values.title_en,
			start_time: new Date(values.start_time),
			end_time_guild_meeting: values.end_time_guild_meeting ? new Date(values.end_time_guild_meeting) : null,
			end_time_middle_meeting: values.end_time_middle_meeting ? new Date(values.end_time_middle_meeting) : null,
			end_time_all: new Date(values.end_time_all),
			description_sv: values.description_sv ?? "",
			description_en: values.description_en ?? "",
			post_ids: values.post_ids ?? [],
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
						{/* end_time_guild_meeting */}
						<FormField
							control={form.control}
							name="end_time_guild_meeting"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("elections.end_time_guild_meeting")}</FormLabel>
									<FormControl>
										<ClearableAdminChooseDates
											value={field.value as Date | undefined}
											onChange={field.onChange}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						{/* end_time_middle_meeting */}
						<FormField
							control={form.control}
							name="end_time_middle_meeting"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("elections.end_time_middle_meeting")}</FormLabel>
									<FormControl>
										<ClearableAdminChooseDates
											value={field.value as Date | undefined}
											onChange={field.onChange}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						{/* end_time_all */}
						<FormField
							control={form.control}
							name="end_time_all"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("elections.end_time_all")}</FormLabel>
									<FormControl>
										<AdminChooseDates
											value={field.value as Date}
											onChange={field.onChange}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						{/* description_sv */}
						<FormField
							control={form.control}
							name="description_sv"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("elections.description_sv")}</FormLabel>
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
						{/* description_en */}
						<FormField
							control={form.control}
							name="description_en"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("elections.description_en")}</FormLabel>
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
						{/* post_ids */}
						<FormField
							control={form.control}
							name="post_ids"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("elections.post_ids")}</FormLabel>
									<FormControl>
										<AdminChooseMultPosts
											value={field.value ?? []}
											onChange={field.onChange}
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
