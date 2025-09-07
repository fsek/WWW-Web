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
	electionsDeleteSubElectionMutation,
	electionsUpdateSubElectionMutation,
	getElectionQueryKey,
} from "@/api/@tanstack/react-query.gen";
import type { SubElectionRead, SubElectionUpdate } from "@/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { Save } from "lucide-react";
import AdminChooseMultPosts from "@/widgets/AdminChooseMultPosts";
import { AdminChooseDates } from "@/widgets/AdminChooseDates";
import getErrorMessage from "@/help_functions/getErrorMessage";

const subElectionEditSchema = z.object({
	sub_election_id: z.number(),
	title_sv: z.string().min(1),
	title_en: z.string().min(1),
	end_time: z.date(),
	post_ids: z.array(z.number()).optional(),
});

type SubElectionEditFormType = z.infer<typeof subElectionEditSchema>;

interface SubElectionsEditFormProps {
	open: boolean;
	onClose: () => void;
	selectedSubElection: SubElectionRead;
	electionId: number;
}

function toDateOrUndefined(d?: string | Date | null) {
	if (!d) return undefined;
	return typeof d === "string" ? new Date(d) : d;
}

export default function SubElectionsEditForm({
	open,
	onClose,
	selectedSubElection,
	electionId,
}: SubElectionsEditFormProps) {
	const { t } = useTranslation("admin");
	const form = useForm<SubElectionEditFormType>({
		resolver: zodResolver(subElectionEditSchema),
		defaultValues: {
			sub_election_id: 0,
			title_sv: "",
			title_en: "",
			end_time: new Date(),
			post_ids: [],
		},
	});

	useEffect(() => {
		if (open && selectedSubElection) {
			form.reset({
				sub_election_id: selectedSubElection.sub_election_id,
				title_sv: selectedSubElection.title_sv ?? "",
				title_en: selectedSubElection.title_en ?? "",
				end_time: toDateOrUndefined(selectedSubElection.end_time) ?? new Date(),
				post_ids: selectedSubElection.posts.map((post) => post.id) ?? [],
			});
		}
	}, [selectedSubElection, form, open]);

	const queryClient = useQueryClient();

	const updateSubElection = useMutation({
		...electionsUpdateSubElectionMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getElectionQueryKey({ path: { election_id: electionId } }),
			});
			toast.success(t("elections.sub_election.edit_success"));
		},
		onError: (error) => {
			toast.error(
				`${t("elections.sub_election.edit_error")} ${getErrorMessage(error, t)}`,
			);
			onClose();
		},
	});

	const removeSubElection = useMutation({
		...electionsDeleteSubElectionMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getElectionQueryKey({ path: { election_id: electionId } }),
			});
			toast.success(t("elections.sub_election.remove_success"));
		},
		onError: (error) => {
			toast.error(
				`${t("elections.sub_election.remove_error")} ${getErrorMessage(error, t)}`,
			);
			onClose();
		},
	});

	function handleFormSubmit(values: SubElectionEditFormType) {
		const updatedSubElection: SubElectionUpdate = {
			title_sv: values.title_sv,
			title_en: values.title_en,
			end_time: new Date(values.end_time),
			post_ids: values.post_ids ?? [],
		};

		updateSubElection.mutate(
			{
				path: { sub_election_id: values.sub_election_id },
				body: updatedSubElection,
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
		removeSubElection.mutate(
			{ path: { sub_election_id: form.getValues("sub_election_id") } },
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
					<DialogTitle>
						{t("elections.sub_election.edit_sub_election")}
					</DialogTitle>
				</DialogHeader>
				<hr />
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleFormSubmit)}
						className="grid gap-x-4 gap-y-3 lg:grid-cols-2"
					>
						{/* title_sv */}
						<FormField
							control={form.control}
							name="title_sv"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("elections.sub_election.title_sv")}</FormLabel>
									<FormControl>
										<Input
											placeholder={t(
												"elections.sub_election.title_placeholder",
											)}
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
									<FormLabel>{t("elections.sub_election.title_en")}</FormLabel>
									<FormControl>
										<Input
											placeholder={t(
												"elections.sub_election.title_placeholder",
											)}
											{...field}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						{/* end_time */}
						<FormField
							control={form.control}
							name="end_time"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("elections.sub_election.end_time")}</FormLabel>
									<FormControl>
										<AdminChooseDates
											value={field.value as Date}
											onChange={field.onChange}
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
									<FormLabel>{t("elections.sub_election.post_ids")}</FormLabel>
									<FormControl>
										<AdminChooseMultPosts
											value={field.value ?? []}
											onChange={field.onChange}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						<div className="space-x-2 lg:col-span-2">
							<ConfirmDeleteDialog
								open={deleteDialogOpen}
								onOpenChange={setDeleteDialogOpen}
								onConfirm={handleRemoveSubmit}
								confirmByTyping
								confirmByTypingText={t("elections.sub_election.type_remove")}
								confirmByTypingKey={selectedSubElection?.title_sv ?? "Error"}
								triggerText={t("elections.sub_election.remove_sub_election")}
								title={t("elections.sub_election.confirm_remove")}
								description={t("elections.sub_election.confirm_remove_text")}
								confirmText={t("elections.sub_election.remove_sub_election")}
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
