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

const electionSchema = z.object({
	title: z.string().min(2),
	start_time: z.string().min(1), // datetime-local string
	end_time: z.string().min(1),
	description: z.string().nullable().optional(),
});

export default function ElectionsForm() {
	const [open, setOpen] = useState(false);
	const [submitEnabled, setSubmitEnabled] = useState(true);
	const { t } = useTranslation("admin");

	const electionForm = useForm<z.infer<typeof electionSchema>>({
		resolver: zodResolver(electionSchema),
		defaultValues: {
			title: "",
			start_time: "",
			end_time: "",
			description: "",
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
			title: values.title,
			start_time: new Date(values.start_time),
			end_time: new Date(values.end_time),
			description: values.description ?? "",
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
								control={electionForm.control}
								name="start_time"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("elections.start_time")}</FormLabel>
										<FormControl>
											<input
												type="datetime-local"
												{...field}
												className="w-full rounded border px-2 py-1"
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={electionForm.control}
								name="end_time"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("elections.end_time")}</FormLabel>
										<FormControl>
											<input
												type="datetime-local"
												{...field}
												className="w-full rounded border px-2 py-1"
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={electionForm.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("elections.description")}</FormLabel>
										<FormControl>
											<Textarea
												placeholder={t("elections.description", "Description")}
												{...field}
												value={field.value ?? ""}
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
