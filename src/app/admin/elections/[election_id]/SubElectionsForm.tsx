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
	electionsCreateSubElectionMutation,
	getElectionQueryKey,
} from "@/api/@tanstack/react-query.gen";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import type { SubElectionCreate } from "@/api";
import AdminChooseMultPosts from "@/widgets/AdminChooseMultPosts";
import { AdminChooseDates } from "@/widgets/AdminChooseDates";
import getErrorMessage from "@/help_functions/getErrorMessage";

const subElectionSchema = z.object({
	title_sv: z.string().min(1),
	title_en: z.string().min(1),
	end_time: z.date(),
	post_ids: z.array(z.number()).optional(),
});

const MS_ONE_DAY = 86400000;

interface SubElectionsFormProps {
	electionId: number;
}

export default function SubElectionsForm({
	electionId,
}: SubElectionsFormProps) {
	const [open, setOpen] = useState(false);
	const [submitEnabled, setSubmitEnabled] = useState(true);
	const { t } = useTranslation("admin");

	const subElectionForm = useForm<z.infer<typeof subElectionSchema>>({
		resolver: zodResolver(subElectionSchema),
		defaultValues: {
			title_sv: "",
			title_en: "",
			end_time: new Date(Date.now() + MS_ONE_DAY * 7),
			post_ids: [],
		},
	});

	const queryClient = useQueryClient();

	const createSubElection = useMutation({
		...electionsCreateSubElectionMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getElectionQueryKey({ path: { election_id: electionId } }),
			});
			toast.success(t("elections.sub_election.create_success"));
			setOpen(false);
			setSubmitEnabled(true);
		},
		onError: (error) => {
			toast.error(
				`${t("elections.sub_election.create_error")} ${getErrorMessage(error, t)}`,
			);
			setOpen(false);
			setSubmitEnabled(true);
		},
	});

	function onSubmit(values: z.infer<typeof subElectionSchema>) {
		setSubmitEnabled(false);
		const body: SubElectionCreate = {
			election_id: electionId,
			title_sv: values.title_sv,
			title_en: values.title_en,
			end_time: new Date(values.end_time),
			post_ids: values.post_ids ?? [],
		};
		createSubElection.mutate({ body });
	}

	return (
		<div className="p-3">
			<Button
				onClick={() => {
					subElectionForm.reset();
					setOpen(true);
					setSubmitEnabled(true);
				}}
			>
				<Plus />
				{t("elections.sub_election.create_sub_election")}
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="min-w-fit lg:max-w-7xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							{t("elections.sub_election.create_sub_election")}
						</DialogTitle>
					</DialogHeader>
					<hr />
					<Form {...subElectionForm}>
						<form
							onSubmit={subElectionForm.handleSubmit(onSubmit)}
							className="grid gap-x-4 gap-y-3 lg:grid-cols-2"
						>
							<FormField
								control={subElectionForm.control}
								name="title_sv"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											{t("elections.sub_election.title_sv")}
										</FormLabel>
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

							<FormField
								control={subElectionForm.control}
								name="title_en"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											{t("elections.sub_election.title_en")}
										</FormLabel>
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

							<FormField
								control={subElectionForm.control}
								name="end_time"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											{t("elections.sub_election.end_time")}
										</FormLabel>
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
								control={subElectionForm.control}
								name="post_ids"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											{t("elections.sub_election.post_ids")}
										</FormLabel>
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
								<Button
									type="submit"
									disabled={!submitEnabled}
									className="w-32 min-w-fit"
								>
									{t("elections.sub_election.create")}
								</Button>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
