import { useState } from "react";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createCourseMutation,
	getAllCoursesOptions,
	getAllCoursesQueryKey,
} from "@/api/@tanstack/react-query.gen";
import type { CourseCreate } from "@/api";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import AdminForm from "@/widgets/AdminForm";

const MAX_COURSE_TITLE = 200;
const MAX_COURSE_CODE = 100;
const MAX_COURSE_DESC = 10000;

const courseSchema = z.object({
	title: z.string().trim().min(1).max(MAX_COURSE_TITLE),
	course_code: z.string().max(MAX_COURSE_CODE).min(1),
	short_identifier: z.string().max(MAX_COURSE_TITLE).optional(),
	description: z.string().max(MAX_COURSE_DESC).optional(),
});

export default function CourseForm() {
	const [open, setOpen] = useState(false);
	const { t } = useTranslation("admin");

	const queryClient = useQueryClient();
	const { data: allCourses = [] } = useQuery({
		...getAllCoursesOptions(),
		refetchOnWindowFocus: false,
	});

	const createCourse = useMutation({
		...createCourseMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getAllCoursesQueryKey(),
			});
			toast.success(t("courses.create_success"));
			setOpen(false);
		},
		onError: (error) => {
			toast.error(
				typeof error?.detail === "string"
					? error.detail
					: t("courses.create_error"),
			);
			setOpen(false);
		},
	});

	function onSubmit(values: z.infer<typeof courseSchema>) {
		const payload: CourseCreate = {
			title: values.title,
			course_code: values.course_code,
			short_identifier: values.short_identifier?.trim()
				? values.short_identifier
				: null,
			description: values.description?.trim() ? values.description : null,
		};

		createCourse.mutate({ body: payload });
	}

	return (
		<AdminForm
			title={t("courses.create_course")}
			formType="add"
			gridCols={3}
			open={open}
			onOpenChange={setOpen}
			defaultValues={{
				title: "",
				course_code: "",
				description: "",
			}}
			inputFields={[
				{
					variant: "text",
					name: "title",
					label: t("courses.title"),
					placeholder: t("courses.title"),
					colSpan: 1,
				},
				{
					variant: "text",
					name: "course_code",
					label: t("courses.course_code"),
					placeholder: t("courses.course_code"),
					colSpan: 1,
				},
				{
					variant: "text",
					name: "short_identifier",
					label: t("courses.short_identifier"),
					placeholder: t("courses.short_identifier_placeholder"),
					colSpan: 1,
				},
				{
					variant: "textarea",
					name: "description",
					label: t("courses.description"),
					placeholder: t("courses.description"),
					rows: 8,
					colSpan: 3,
				},
			]}
			zodSchema={courseSchema}
			onSubmit={onSubmit}
		/>
	);
}
