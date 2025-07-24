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

const postSchema = z.object({
	name_sv: z.string().min(2),
	name_en: z.string().min(2),
	description_sv: z.string().min(2),
	description_en: z.string().min(2),
	email: z.string().email(),
	council_id: z.number().int(),
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
		},
	});

	const queryClient = useQueryClient();

	const createPosts = useMutation({
		...createPostMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllPostsQueryKey() });
			setOpen(false);
			setSubmitEnabled(true);
			toast.success(t("posts.create_success", "Post skapad!"));
		},
		onError: (error) => {
			setOpen(false);
			setSubmitEnabled(true);
			toast.error(
				t("posts.create_error", "Kunde inte skapa post.") +
					(error?.detail ? ` (${error.detail})` : ""),
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
			},
		});
	}

	return (
		<div className="p-3">
			<Button
				onClick={() => {
					postForm.reset();
					setOpen(true);
					setSubmitEnabled(true);
				}}
			>
				{t("posts.submit", "Skapa post")}
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="min-w-fit lg:max-w-7xl">
					<DialogHeader>
						<DialogTitle>{t("posts.title", "Skapa post")}</DialogTitle>
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
										<FormLabel>{t("posts.name", "Name")}</FormLabel>
										<FormControl>
											<Input
												placeholder={t("posts.name_placeholder", "Namn")}
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
										<FormLabel>
											{t("posts.name_en", "Name (English)")}
										</FormLabel>
										<FormControl>
											<Input
												placeholder={t(
													"posts.name_en_placeholder",
													"Name (English)",
												)}
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
										<FormLabel>
											{t("posts.description_sv", "Description (Swedish)")}
										</FormLabel>
										<FormControl>
											<Textarea
												placeholder={t(
													"posts.description_placeholder_sv",
													"Beskrivning (Svenska)",
												)}
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
										<FormLabel>
											{t("posts.description_en", "Description (English)")}
										</FormLabel>
										<FormControl>
											<Textarea
												placeholder={t(
													"posts.description_placeholder_en",
													"Description (English)",
												)}
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
										<FormLabel>{t("posts.email", "Email")}</FormLabel>
										<FormControl>
											<Input
												type="email"
												placeholder={t("posts.email_placeholder", "Email")}
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
										<FormLabel>{t("posts.council", "Council name")}</FormLabel>
										<AdminChooseCouncil
											value={field.value}
											onChange={field.onChange}
										/>
									</FormItem>
								)}
							/>

							<div className="space-x-2 lg:col-span-2 lg:grid-cols-subgrid">
								<Button
									type="submit"
									disabled={!submitEnabled}
									className="w-32 min-w-fit"
								>
									{t("posts.publish", "Publicera")}
								</Button>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
