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
	populateElectionMutation,
} from "@/api/@tanstack/react-query.gen";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import type { ElectionCreate, ElectionPopulate } from "@/api";
import { AdminChooseDates } from "@/widgets/AdminChooseDates";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import getErrorMessage from "@/help_functions/getErrorMessage";
import { semester } from "@/api";
import { SelectFromOptions } from "@/widgets/SelectFromOptions";

const electionSchema = z.object({
	title_sv: z.string().min(1),
	title_en: z.string().min(1),
	start_time: z.date(),
	description_sv: z.string().nullable().optional(),
	description_en: z.string().nullable().optional(),
	visible: z.boolean().optional(),
	semester: z.nativeEnum(semester).optional(),
	end_time_guild: z.date().optional(),
	end_time_board: z.date().optional(),
	end_time_board_intermediate: z.date().optional(),
	end_time_educational_council: z.date().optional(),
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
			semester: undefined,
		},
	});

	const selectedSemester = electionForm.watch("semester");
	const shouldShowPopulateFields =
		selectedSemester && selectedSemester !== "Other";

	const queryClient = useQueryClient();

	const populateElection = useMutation({
		...populateElectionMutation(),
		onSuccess: () => {
			toast.success(t("elections.populate_success"));
			queryClient.invalidateQueries({ queryKey: getAllElectionsQueryKey() });
		},
		onError: (error) => {
			toast.error(
				`${t("elections.populate_error")} ${getErrorMessage(error, t)}`,
			);
		},
	});

	const createElection = useMutation({
		...createElectionMutation(),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: getAllElectionsQueryKey() });
			toast.success(t("elections.create_success"));

			// If semester is selected and not "Other", populate the election
			if (shouldShowPopulateFields && data?.election_id) {
				const now = new Date();
				const MS_IN_A_DAY = 24 * 60 * 60 * 1000;
				const populateData: ElectionPopulate = {
					semester: selectedSemester as "HT" | "VT",
					end_time_guild:
						electionForm.getValues("end_time_guild") ??
						new Date(now.getTime() + 7 * MS_IN_A_DAY),
					end_time_board:
						electionForm.getValues("end_time_board") ??
						new Date(now.getTime() + 14 * MS_IN_A_DAY),
					end_time_board_intermediate:
						electionForm.getValues("end_time_board_intermediate") ??
						new Date(now.getTime() + 21 * MS_IN_A_DAY),
					end_time_educational_council:
						electionForm.getValues("end_time_educational_council") ??
						new Date(now.getTime() + 28 * MS_IN_A_DAY),
				};

				populateElection.mutate({
					body: populateData,
					path: { election_id: data.election_id },
				});
			}

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

	const semesterOptions = Object.values(semester).map((value) => ({
		value: String(value),
		label: t(`enums.semester.${value}`),
	}));

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

							{/* semester selection */}
							<FormField
								control={electionForm.control}
								name="semester"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("elections.semester")}</FormLabel>
										<FormControl>
											<SelectFromOptions
												options={semesterOptions}
												value={field.value}
												onChange={field.onChange}
												placeholder={t("elections.semester_placeholder")}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							{/* Conditional populate fields */}
							{shouldShowPopulateFields && (
								<>
									<FormField
										control={electionForm.control}
										name="end_time_guild"
										render={({ field }) => (
											<FormItem>
												<FormLabel>{t("elections.end_time_guild")}</FormLabel>
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
										name="end_time_board"
										render={({ field }) => (
											<FormItem>
												<FormLabel>{t("elections.end_time_board")}</FormLabel>
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
										name="end_time_board_intermediate"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													{t("elections.end_time_board_intermediate")}
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
										control={electionForm.control}
										name="end_time_educational_council"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													{t("elections.end_time_educational_council")}
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
								</>
							)}

							{/* Info message */}
							{shouldShowPopulateFields && (
								<div className="lg:col-span-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
									<p className="text-sm text-blue-800">
										{t("elections.populate_info", {
											semester: t(
												`elections.semester_${selectedSemester?.toLowerCase()}`,
											),
										})}
									</p>
								</div>
							)}

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
