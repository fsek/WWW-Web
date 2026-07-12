import { useState } from "react";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createProgramYearMutation,
	getAllCoursesOptions,
	getAllProgramYearsQueryKey,
} from "@/api/@tanstack/react-query.gen";
import type { ProgramYearCreate } from "@/api";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import AdminForm from "@/widgets/AdminForm";
import { useParams } from "next/navigation";

const MAX_PROGRAM_YEAR_TITLE = 100;
const MAX_PROGRAM_YEAR_DESC = 10000;

const programYearSchema = z.object({
	title_sv: z.string().trim().min(1).max(MAX_PROGRAM_YEAR_TITLE),
	title_en: z.string().trim().min(1).max(MAX_PROGRAM_YEAR_TITLE),
	description_sv: z.string().max(MAX_PROGRAM_YEAR_DESC).optional(),
	description_en: z.string().max(MAX_PROGRAM_YEAR_DESC).optional(),
	program_id: z.number(),
	course_ids: z.array(z.number()).optional(),
});

export default function ProgramForm() {
	const [open, setOpen] = useState(false);
	const { t } = useTranslation("admin");
	const params = useParams();
	const programId = Number(params.program_id);

	const queryClient = useQueryClient();
	const { data: allCourses = [] } = useQuery({
		...getAllCoursesOptions(),
		refetchOnWindowFocus: false,
	});

	const courseOptions = allCourses
		.map((course) => ({
			value: course.course_id,
			label: course.title,
		}))
		.sort((a, b) => a.label.localeCompare(b.label));

	const createProgramYear = useMutation({
		...createProgramYearMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getAllProgramYearsQueryKey(),
			});
			toast.success(t("program_years.create_success"));
			setOpen(false);
		},
		onError: (error) => {
			toast.error(
				typeof error?.detail === "string"
					? error.detail
					: t("program_years.create_error"),
			);
			setOpen(false);
		},
	});

	function onSubmit(values: z.infer<typeof programYearSchema>) {
		const payload: ProgramYearCreate = {
			title_sv: values.title_sv,
			title_en: values.title_en,
			program_id: values.program_id,
			description_sv: values.description_sv?.trim() ? values.description_sv : null,
			description_en: values.description_en?.trim() ? values.description_en : null,
			course_ids: values.course_ids ?? [],
		};

		createProgramYear.mutate({ body: payload });
	}

	return (
		<AdminForm
			title={t("program_years.create_program")}
			formType="add"
			gridCols={4}
			open={open}
			onOpenChange={setOpen}
			defaultValues={{
				title_sv: "",
				title_en: "",
				description_sv: "",
				description_en: "",
				program_id: Number.isNaN(programId) ? 0 : programId,
				course_ids: [],
			}}
			inputFields={[
				{
					variant: "text",
					name: "title_sv",
					label: t("program_years.title_sv"),
					placeholder: t("program_years.title_sv"),
					colSpan: 2,
				},
				{
					variant: "text",
					name: "title_en",
					label: t("program_years.title_en"),
					placeholder: t("program_years.title_en"),
					colSpan: 2,
				},
				{
					variant: "textarea",
					name: "description_sv",
					label: t("program_years.description_sv"),
					placeholder: t("program_years.description_sv"),
					rows: 8,
					colSpan: 2,
				},
				{
					variant: "textarea",
					name: "description_en",
					label: t("program_years.description_en"),
					placeholder: t("program_years.description_en"),
					rows: 8,
					colSpan: 2,
				},
				{
					variant: "styledMultiSelect",
					name: "course_ids",
					label: t("program_years.courses"),
					placeholder: t("program_years.select_courses"),
					options: courseOptions,
					colSpan: 4,
				},
			]}
			zodSchema={programYearSchema}
			onSubmit={onSubmit}
		/>
	);
}
