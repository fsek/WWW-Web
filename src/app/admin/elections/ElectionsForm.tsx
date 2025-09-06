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
import { AdminChooseDates } from "@/widgets/AdminChooseDates";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import getErrorMessage from "@/help_functions/getErrorMessage";

const electionSchema = z.object({
	title_sv: z.string().min(1),
	title_en: z.string().min(1),
	start_time: z.date(),
	description_sv: z.string().nullable().optional(),
	description_en: z.string().nullable().optional(),
	visible: z.boolean().optional(),
});

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
			description_sv: "",
			description_en: "",
			visible: true,
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
				`${t("elections.create_error")} ${getErrorMessage(error, t)}`,
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
			description_sv: values.description_sv ?? "",
			description_en: values.description_en ?? "",
			visible: values.visible ?? false,
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
							{/* title_sv */}
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
							{/* title_en */}
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
							{/* start_time */}
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
							{/* visible */}
							<FormField
								control={electionForm.control}
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
							{/* description_en */}
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
