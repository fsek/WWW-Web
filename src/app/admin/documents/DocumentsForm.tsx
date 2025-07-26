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
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogTitle } from "@radix-ui/react-dialog";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	uploadDocumentMutation,
	getAllDocumentsQueryKey,
} from "@/api/@tanstack/react-query.gen";

import { useTranslation } from "react-i18next";

export default function DocumentsForm() {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const [submitEnabled, setSubmitEnabled] = useState(true);

	const documentsSchema = z.object({
		title: z.string().min(1, t("admin:documents.title_required")),
		file: z
			.instanceof(File)
			.refine(
				(file) => file.size <= 5 * 1024 * 1024,
				t("admin:documents.file_size_error"),
			)
			.refine(
				(file) =>
					["application/pdf", "image/jpeg", "image/png", "text/plain"].includes(
						file.type,
					),
				t("admin:documents.file_type_error"),
			),
		is_private: z.boolean(),
		category: z.string(),
	});

	const documentsForm = useForm<z.infer<typeof documentsSchema>>({
		resolver: zodResolver(documentsSchema),
		defaultValues: {
			title: "",
			file: undefined,
			is_private: false,
			category: "",
		},
	});

	const queryClient = useQueryClient();

	const uploadDocument = useMutation({
		...uploadDocumentMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllDocumentsQueryKey() });
			setOpen(false);
			setSubmitEnabled(true);
			documentsForm.reset();
		},
		onError: () => {
			setSubmitEnabled(true);
		},
	});

	function onSubmit(values: z.infer<typeof documentsSchema>) {
		setSubmitEnabled(false);

		uploadDocument.mutate({
			body: {
				title: values.title,
				file: values.file,
				is_private: values.is_private,
				category: values.category,
			},
		});
	}

	return (
		<div className="p-3">
			<Button
				onClick={() => {
					documentsForm.reset();
					setOpen(true);
					setSubmitEnabled(true);
				}}
			>
				{t("admin:documents.create")}
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="min-w-fit lg:max-w-7xl">
					<DialogHeader>
						<DialogTitle>{t("admin:documents.create")}</DialogTitle>
					</DialogHeader>
					<hr />
					<Form {...documentsForm}>
						<form
							onSubmit={documentsForm.handleSubmit(onSubmit)}
							className="grid gap-x-4 gap-y-3 lg:grid-cols-4"
						>
							<FormField
								control={documentsForm.control}
								name="title"
								render={({ field }) => (
									<FormItem className="lg:col-span-2">
										<FormLabel>{t("admin:documents.title")}</FormLabel>
										<FormControl>
											<Input
												placeholder={t("admin:documents.title")}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={documentsForm.control}
								name="file"
								render={({ field: { onChange, value, ...field } }) => (
									<FormItem className="lg:col-span-2">
										<FormLabel>{t("admin:documents.file")}</FormLabel>
										<FormControl>
											<Input
												{...field}
												type="file"
												accept=".pdf,.jpg,.jpeg,.png,.txt"
												onChange={(e) => {
													const file = e.target.files?.[0];
													onChange(file);
												}}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={documentsForm.control}
								name="category"
								render={({ field }) => (
									<FormItem className="lg:col-span-2">
										<FormLabel>{t("admin:documents.category")}</FormLabel>
										<FormControl>
											<Input
												placeholder={t("admin:documents.category")}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={documentsForm.control}
								name="is_private"
								render={({ field }) => (
									<FormItem className="flex flex-row items-center-safe space-x-3 space-y-0 lg:col-span-2 pl-3">
										<FormControl>
											<Checkbox
												checked={field.value}
												onCheckedChange={field.onChange}
											/>
										</FormControl>
										<div className="space-y-1 leading-none">
											<FormLabel>
												{t("admin:documents.private_explanation")}
											</FormLabel>
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="space-x-2 lg:col-span-4">
								<Button
									type="submit"
									disabled={!submitEnabled}
									className="w-32 min-w-fit"
								>
									{t("admin:submit")}
								</Button>
								<Button
									type="button"
									variant="outline"
									onClick={() => setOpen(false)}
									className="w-32 min-w-fit"
								>
									{t("admin:cancel")}
								</Button>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
