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
	createPostMutation,
	getAllPostsQueryKey,
} from "@/api/@tanstack/react-query.gen";

import { AdminChooseCouncil } from "@/widgets/AdminChooseCouncil";
import { useTranslation } from "react-i18next";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { SelectFromOptions } from "@/widgets/SelectFromOptions";
import { ElectedByEnum, ElectedAtSemesterEnum } from "@/api";

const postSchema = z.object({
	name_sv: z.string().min(2),
	name_en: z.string().min(2),
	description_sv: z.string().min(2),
	description_en: z.string().min(2),
	email: z.string().email(),
	council_id: z.number().int(),
	elected_at_semester: z.nativeEnum(ElectedAtSemesterEnum),
	elected_by: z.nativeEnum(ElectedByEnum),
	elected_user_recommended_limit: z.coerce.number().int().min(0),
	elected_user_max_limit: z.coerce.number().int().min(0),
});

export default function PostForm() {
	const [open, setOpen] = useState(false);
	const [submitEnabled, setSubmitEnabled] = useState(true);
	const { t } = useTranslation("admin");

	const postForm = useForm<z.infer<typeof postSchema>>({
		resolver: zodResolver(postSchema),
		defaultValues: {
			name_sv: "",
			name_en: "",
			description_sv: "",
			description_en: "",
			council_id: 0,
			email: "",
			elected_at_semester: "HT" as ElectedAtSemesterEnum,
			elected_by: "Guild" as ElectedByEnum,
			elected_user_recommended_limit: 0,
			elected_user_max_limit: 0,
		},
	});

	const queryClient = useQueryClient();

	const createPosts = useMutation({
		...createPostMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllPostsQueryKey() });
			setOpen(false);
			setSubmitEnabled(true);
			toast.success(t("posts.create_success"));
		},
		onError: (error) => {
			setOpen(false);
			setSubmitEnabled(true);
			toast.error(
				t("posts.create_error") + (error?.detail ? ` (${error.detail})` : ""),
			);
		},
	});

	function onSubmit(values: z.infer<typeof postSchema>) {
		setSubmitEnabled(false);
		createPosts.mutate({
			body: {
				name_sv: values.name_sv,
				name_en: values.name_en,
				description_sv: values.description_sv,
				description_en: values.description_en,
				email: values.email,
				council_id: values.council_id,
				elected_at_semester: values.elected_at_semester,
				elected_by: values.elected_by,
				elected_user_recommended_limit: values.elected_user_recommended_limit,
				elected_user_max_limit: values.elected_user_max_limit,
			},
		});
	}

	const electedAtSemesterOptions = Object.values(ElectedAtSemesterEnum).map(
		(value) => ({ value, label: t(`posts.elected_at_semester.${value}`) }),
	);
	const electedByOptions = Object.values(ElectedByEnum).map((value) => ({
		value,
		label: t(`posts.elected_by.${value}`),
	}));

	return (
		<>
			<Button
				onClick={() => {
					postForm.reset();
					setOpen(true);
					setSubmitEnabled(true);
				}}
			>
				<Plus />
				{t("posts.submit")}
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="min-w-fit lg:max-w-7xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>{t("posts.title")}</DialogTitle>
					</DialogHeader>
					<hr />
					<Form {...postForm}>
						<form
							onSubmit={postForm.handleSubmit(onSubmit)}
							className="grid gap-x-4 gap-y-3 lg:grid-cols-4"
						>
							{/* Name (sv) */}
							<FormField
								control={postForm.control}
								name="name_sv"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("posts.name")}</FormLabel>
										<FormControl>
											<Input
												placeholder={t("posts.name_placeholder")}
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							{/* Name (en) */}
							<FormField
								control={postForm.control}
								name="name_en"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("posts.name_en")}</FormLabel>
										<FormControl>
											<Input
												placeholder={t("posts.name_en_placeholder")}
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							{/* Description (sv) */}
							<FormField
								control={postForm.control}
								name="description_sv"
								render={({ field }) => (
									<FormItem className="lg:col-span-2">
										<FormLabel>{t("posts.description_sv")}</FormLabel>
										<FormControl>
											<Textarea
												placeholder={t("posts.description_placeholder_sv")}
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							{/* Description (en) */}
							<FormField
								control={postForm.control}
								name="description_en"
								render={({ field }) => (
									<FormItem className="lg:col-span-2">
										<FormLabel>{t("posts.description_en")}</FormLabel>
										<FormControl>
											<Textarea
												placeholder={t("posts.description_placeholder_en")}
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							{/* Email */}
							<FormField
								control={postForm.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("posts.email")}</FormLabel>
										<FormControl>
											<Input
												type="email"
												placeholder={t("posts.email_placeholder")}
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={postForm.control}
								name="council_id"
								render={({ field }) => (
									<FormItem className="lg:col-span-2">
										<FormLabel>{t("posts.council")}</FormLabel>
										<AdminChooseCouncil
											value={field.value}
											onChange={field.onChange}
										/>
									</FormItem>
								)}
							/>

							{/* Elected at semester */}
							<FormField
								control={postForm.control}
								name="elected_at_semester"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("posts.elected_at_semester")}</FormLabel>
										<FormControl>
											<SelectFromOptions
												options={electedAtSemesterOptions}
												value={field.value}
												onChange={field.onChange}
												placeholder={t("posts.elected_at_semester_placeholder")}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							{/* Elected by */}
							<FormField
								control={postForm.control}
								name="elected_by"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("posts.elected_by")}</FormLabel>
										<FormControl>
											<SelectFromOptions
												options={electedByOptions}
												value={field.value}
												onChange={field.onChange}
												placeholder={t("posts.elected_by_placeholder")}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							{/* Elected user recommended limit */}
							<FormField
								control={postForm.control}
								name="elected_user_recommended_limit"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											{t("posts.elected_user_recommended_limit")}
										</FormLabel>
										<FormControl>
											<Input
												type="number"
												min={0}
												placeholder={t(
													"posts.elected_user_recommended_limit_placeholder",
												)}
												{...field}
												value={(field.value as number) ?? 0}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							{/* Elected user max limit */}
							<FormField
								control={postForm.control}
								name="elected_user_max_limit"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("posts.elected_user_max_limit")}</FormLabel>
										<FormControl>
											<Input
												type="number"
												min={0}
												placeholder={t(
													"posts.elected_user_max_limit_placeholder",
												)}
												{...field}
												value={(field.value as number) ?? 0}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							<div className="space-x-2 lg:col-span-2 lg:grid-cols-subgrid">
								<Button
									type="submit"
									disabled={!submitEnabled}
									className="w-32 min-w-fit"
								>
									{t("posts.publish")}
								</Button>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</>
	);
}
