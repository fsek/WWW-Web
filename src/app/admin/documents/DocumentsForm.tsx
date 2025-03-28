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
// import {
// 	createDocumentMutation,
// 	getAllDocumentsQueryKey,
// } from "@/api/@tanstack/react-query.gen";

import { AdminChooseCouncil } from "@/widgets/AdminChooseCouncil";
import { useTranslation } from "react-i18next";

export default function DocumentsForm() {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const [submitEnabled, setSubmitEnabled] = useState(true);

	const documentsSchema = z.object({
		title: z.string(),
		// description: "",
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
		public: z.boolean(),
	});

	const documentsForm = useForm<z.infer<typeof documentsSchema>>({
		resolver: zodResolver(documentsSchema),
		defaultValues: {
			title: "",
			// description: "",
			file: new File(
				["This is an example file. You may treat getting this as an error."],
				"sample.txt",
			),
			public: false,
		},
	});

	const queryClient = useQueryClient();

	// const createDocuments = useMutation({
	// 	...createDocumentMutation(),
	// 	onSuccess: () => {
	// 		queryClient.invalidateQueries({ queryKey: getAllEventsQueryKey() });
	// 		setOpen(false);
	// 		setSubmitEnabled(true);
	// 	},
	// 	onError: () => {
	// 		setOpen(false);
	// 		setSubmitEnabled(true);
	// 	},
	// });

	function onSubmit(values: z.infer<typeof documentsSchema>) {
		setSubmitEnabled(false);
		// createDocuments.mutate({
		// 	body: {
		// 		title: values.title,
		//     // description: values.description,
		//     file: values.file,
		//     public: values.public,
		//     uploader_id: values.uploader_id,
		//     upload_date: values.upload_date,
		//     edit_date: values.edit_date,
		// 	},
		// });
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
				Skapa event
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
									<FormItem>
										<FormLabel>{t("admin:documents.title")}</FormLabel>
										<FormControl>
											<Input
												placeholder={t("admin:documents.title")}
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={documentsForm.control}
								name="file"
								render={({ field }) => (
									<FormItem className="lg:col-span-2">
										<FormLabel>{t("admin:documents.file")}</FormLabel>
										<FormControl>
											<Input
												id="document"
												type="file"
												onChange={(e) => field.onChange(e.target.files?.[0])}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={documentsForm.control}
								name="public"
								render={({ field }) => (
									<FormItem className="lg:col-span-2">
										<FormLabel>{t("admin:documents.public")}</FormLabel>
										<FormControl>
											<Input
												id="public"
												type="checkbox"
												checked={field.value}
												onChange={field.onChange}
												ref={field.ref}
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
									{t("admin:submit")}
								</Button>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
