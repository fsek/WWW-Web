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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogTitle } from "@radix-ui/react-dialog";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	createElectionMutation,
	getAllElectionsQueryKey,
} from "@/api/@tanstack/react-query.gen";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import type { ElectionCreate } from "@/api";
import AdminChooseMultPosts from "@/widgets/AdminChooseMultPosts";
import { AdminChooseDates } from "@/widgets/AdminChooseDates";
import { ClearableAdminChooseDates } from "@/widgets/ClearableAdminChooseDates";

const electionSchema = z.object({
	title_sv: z.string().min(1),
	title_en: z.string().min(1),
	start_time: z.date(), // datetime-local string
	end_time_guild_meeting: z.date().optional(),
	end_time_middle_meeting: z.date().optional(),
	end_time_all: z.date(),
	description_sv: z.string().nullable().optional(),
	description_en: z.string().nullable().optional(),
	post_ids: z.array(z.number()).optional(),
});

const MS_ONE_DAY = 86400000;

export default function ElectionsForm() {
	const [open, setOpen] = useState(false);
	const [submitEnabled, setSubmitEnabled] = useState(true);
	const { t } = useTranslation("admin");

	const electionForm = useForm<z.infer<typeof electionSchema>>({
		resolver: zodResolver(electionSchema),
		defaultValues: {
			title_sv: "",
			title_en: "",
			start_time: new Date(),
			end_time_guild_meeting: new Date(Date.now() + MS_ONE_DAY * 7),
			end_time_middle_meeting: new Date(Date.now() + MS_ONE_DAY * 8),
			end_time_all: new Date(Date.now() + MS_ONE_DAY * 10),
			description_sv: "",
			description_en: "",
			post_ids: [],
		},
	});

	const queryClient = useQueryClient();

	const createElection = useMutation({
		...createElectionMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllElectionsQueryKey() });
			toast.success(t("elections.create_success"));
			setOpen(false);
			setSubmitEnabled(true);
		},
		onError: (error) => {
			toast.error(
				typeof error?.detail === "string"
					? error.detail
					: t("elections.create_error"),
			);
			setOpen(false);
			setSubmitEnabled(true);
		},
	});

	function onSubmit(values: z.infer<typeof electionSchema>) {
		setSubmitEnabled(false);
		const body: ElectionCreate = {
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
		createElection.mutate({ body });
	}

	return (
		<div className="p-3">
			<Button
				onClick={() => {
					electionForm.reset();
					setOpen(true);
					setSubmitEnabled(true);
				}}
			>
				<Plus />
				{t("elections.create_election")}
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="min-w-fit lg:max-w-7xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>{t("elections.create_election")}</DialogTitle>
					</DialogHeader>
					<hr />
					<Form {...electionForm}>
						<form
							onSubmit={electionForm.handleSubmit(onSubmit)}
							className="grid gap-x-4 gap-y-3 lg:grid-cols-4"
						>
							<FormField
								control={electionForm.control}
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

							<FormField
								control={electionForm.control}
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

							<FormField
								control={electionForm.control}
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
							<FormField
								control={electionForm.control}
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
							<FormField
								control={electionForm.control}
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
							<FormField
								control={electionForm.control}
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
							<FormField
								control={electionForm.control}
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
							<FormField
								control={electionForm.control}
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
							<FormField
								control={electionForm.control}
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
								<Button
									type="submit"
									disabled={!submitEnabled}
									className="w-32 min-w-fit"
								>
									{t("elections.create")}
								</Button>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
