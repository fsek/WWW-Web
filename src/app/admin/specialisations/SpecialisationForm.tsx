import { useState } from "react";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createSpecialisationMutation,
	getAllCoursesOptions,
	getAllSpecialisationsQueryKey,
} from "@/api/@tanstack/react-query.gen";
import type { SpecialisationCreate } from "@/api";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import AdminForm from "@/widgets/AdminForm";

const MAX_SPECIALISATION_TITLE = 100;
const MAX_SPECIALISATION_DESC = 10000;

const specialisationSchema = z.object({
	title_sv: z.string().trim().min(1).max(MAX_SPECIALISATION_TITLE),
	title_en: z.string().trim().min(1).max(MAX_SPECIALISATION_TITLE),
	description_sv: z.string().max(MAX_SPECIALISATION_DESC).optional(),
	description_en: z.string().max(MAX_SPECIALISATION_DESC).optional(),
	course_ids: z.array(z.number()).optional(),
});

export default function SpecialisationForm() {
	const [open, setOpen] = useState(false);
	const { t } = useTranslation("admin");

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

	const createSpecialisation = useMutation({
		...createSpecialisationMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getAllSpecialisationsQueryKey(),
				
			});
			toast.success(t("specialisations.create_success"));
			setOpen(false);
		},
		onError: (error) => {
			toast.error(
				typeof error?.detail === "string"
					? error.detail
					: t("specialisations.create_error"),
			);
			setOpen(false);
		},
	});

	function onSubmit(values: z.infer<typeof specialisationSchema>) {
		const payload: SpecialisationCreate = {
			title_sv: values.title_sv,
			title_en: values.title_en,
			description_sv: values.description_sv?.trim() ? values.description_sv : null,
			description_en: values.description_en?.trim() ? values.description_en : null,
			course_ids: values.course_ids ?? [],
		};

		createSpecialisation.mutate({ body: payload });
	}

	return (
		<AdminForm
			title={t("specialisations.create_specialisation")}
			formType="add"
			gridCols={4}
			open={open}
			onOpenChange={setOpen}
			defaultValues={{
				title_sv: "",
				title_en: "",
				description_sv: "",
				description_en: "",
				course_ids: [],
			}}
			inputFields={[
				{
					variant: "text",
					name: "title_sv",
					label: t("specialisations.title_sv"),
					placeholder: t("specialisations.title_sv"),
					colSpan: 2,
				},
				{
					variant: "text",
					name: "title_en",
					label: t("specialisations.title_en"),
					placeholder: t("specialisations.title_en"),
					colSpan: 2,
				},
				{
					variant: "textarea",
					name: "description_sv",
					label: t("specialisations.description_sv"),
					placeholder: t("specialisations.description_sv"),
					rows: 8,
					colSpan: 2,
				},
				{
					variant: "textarea",
					name: "description_en",
					label: t("specialisations.description_en"),
					placeholder: t("specialisations.description_en"),
					rows: 8,
					colSpan: 2,
				},
				{
					variant: "styledMultiSelect",
					name: "course_ids",
					label: t("specialisations.courses"),
					placeholder: t("specialisations.select_courses"),
					options: courseOptions,
					colSpan: 4,
				},
			]}
			zodSchema={specialisationSchema}
			onSubmit={onSubmit}
		/>
	);
}
