import { useState } from "react";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createProgramMutation,
	getAllSpecialisationsOptions,
	getAllProgramsQueryKey,
} from "@/api/@tanstack/react-query.gen";
import type { ProgramCreate } from "@/api";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import AdminForm from "@/widgets/AdminForm";

const MAX_PROGRAM_TITLE = 100;
const MAX_PROGRAM_DESC = 10000;

const programSchema = z.object({
	title_sv: z.string().trim().min(1).max(MAX_PROGRAM_TITLE),
	title_en: z.string().trim().min(1).max(MAX_PROGRAM_TITLE),
	description_sv: z.string().max(MAX_PROGRAM_DESC).optional(),
	description_en: z.string().max(MAX_PROGRAM_DESC).optional(),
	specialisation_ids: z.array(z.number()).optional(),
});

export default function ProgramForm() {
	const [open, setOpen] = useState(false);
	const { t, i18n } = useTranslation("admin");

	const queryClient = useQueryClient();
	const { data: allSpecialisations = [] } = useQuery({
		...getAllSpecialisationsOptions(),
		refetchOnWindowFocus: false,
	});

	const specialisationOptions = allSpecialisations
		.map((specialisation) => ({
			value: specialisation.specialisation_id,
			label:
				i18n.language === "sv"
					? specialisation.title_sv
					: specialisation.title_en,
		}))
		.sort((a, b) => a.label.localeCompare(b.label, i18n.language));

	const createProgram = useMutation({
		...createProgramMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getAllProgramsQueryKey(),
			});
			toast.success(t("programs.create_success"));
			setOpen(false);
		},
		onError: (error) => {
			toast.error(
				typeof error?.detail === "string"
					? error.detail
					: t("programs.create_error"),
			);
			setOpen(false);
		},
	});

	function onSubmit(values: z.infer<typeof programSchema>) {
		const payload: ProgramCreate = {
			title_sv: values.title_sv,
			title_en: values.title_en,
			description_sv: values.description_sv?.trim() ? values.description_sv : null,
			description_en: values.description_en?.trim() ? values.description_en : null,
			specialisation_ids: values.specialisation_ids ?? [],
		};

		createProgram.mutate({ body: payload });
	}

	return (
		<AdminForm
			title={t("programs.create_program")}
			formType="add"
			gridCols={4}
			open={open}
			onOpenChange={setOpen}
			defaultValues={{
				title_sv: "",
				title_en: "",
				description_sv: "",
				description_en: "",
				specialisation_ids: [],
			}}
			inputFields={[
				{
					variant: "text",
					name: "title_sv",
					label: t("title_sv"),
					placeholder: t("title_sv"),
					colSpan: 2,
				},
				{
					variant: "text",
					name: "title_en",
					label: t("title_en"),
					placeholder: t("title_en"),
					colSpan: 2,
				},
				{
					variant: "textarea",
					name: "description_sv",
					label: t("description_sv"),
					placeholder: t("description_sv"),
					rows: 8,
					colSpan: 2,
				},
				{
					variant: "textarea",
					name: "description_en",
					label: t("description_en"),
					placeholder: t("description_en"),
					rows: 8,
					colSpan: 2,
				},
				{
					variant: "styledMultiSelect",
					name: "specialisation_ids",
					label: t("programs.specialisations"),
					placeholder: t("programs.select_specialisations"),
					options: specialisationOptions,
					colSpan: 4,
				},
			]}
			zodSchema={programSchema}
			onSubmit={onSubmit}
		/>
	);
}
