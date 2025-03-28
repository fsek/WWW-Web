import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { AdminChooseCouncil } from "@/widgets/AdminChooseCouncil";
import { AdminChooseDates } from "@/widgets/AdminChooseDates";
// import {
// 	getAllEventsQueryKey,
// 	eventUpdateMutation,
// 	eventRemoveMutation,
// } from "@/api/@tanstack/react-query.gen";
// import type { DocumentRead, DocumentUpdate } from "../../../api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

interface DocumentsEditFormProps {
	open: boolean;
	onClose: () => void;
	// selectedDocument: DocumentRead;
}

export default function DocumentsEditForm({
	open,
	onClose,
	// selectedDocument,
}: DocumentsEditFormProps) {
	const { t } = useTranslation();

	const documentsEditSchema = z.object({
		id: z.number(),
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
					["application/pdf", "image/jpeg", "image/png", "text/plain"].includes(file.type),
				t("admin:documents.file_type_error"),
			),
		public: z.boolean(),
	});

	type DocumentsEditFormType = z.infer<typeof documentsEditSchema>;

	const documentsEditForm = useForm<DocumentsEditFormType>({
		resolver: zodResolver(documentsEditSchema),
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

	// useEffect(() => {
	// 	if (open && selectedDocument) {
	// 		form.reset({
	// 			...selectedDocument,
	// 			starts_at: new Date(selectedDocument.starts_at).toISOString(),
	// 			ends_at: new Date(selectedDocument.ends_at).toISOString(),
	// 			signup_start: new Date(selectedDocument.signup_start).toISOString(),
	// 			signup_end: new Date(selectedDocument.signup_end).toISOString(),
	// 		});
	// 	}
	// }, [selectedDocument, form, open]);

	const queryClient = useQueryClient();

	// const updateDocument = useMutation({
	// 	...documentUpdateMutation(),
	// 	throwOnError: false,
	// 	onSuccess: () => {
	// 		queryClient.invalidateQueries({ queryKey: getAllDocumentsQueryKey() });
	// 	},
	// 	onError: () => {
	// 		onClose();
	// 	},
	// });

	// const removeDocument = useMutation({
	// 	...documentRemoveMutation(),
	// 	throwOnError: false,
	// 	onSuccess: () => {
	// 		queryClient.invalidateQueries({ queryKey: getAllDocumentsQueryKey() });
	// 	},
	// 	onError: () => {
	// 		onClose();
	// 	},
	// });

	function handleFormSubmit(values: DocumentsEditFormType) {
		// const updatedDocument: DocumentUpdate = {
		// 	title: values.title,
		// 	file: values.file,
		// };

		// updateDocument.mutate(
		// 	{
		// 		path: { event_id: values.id },
		// 		body: updatedDocument,
		// 	},
		// 	{
		// 		onSuccess: () => {
		// 			onClose();
		// 		},
		// 	},
		// );
		console.log("Form submitted", values);
	}

	function handleRemoveSubmit() {
		// removeDocument.mutate(
		// 	{ path: { event_id: form.getValues("id") } },
		// 	{
		// 		onSuccess: () => {
		// 			onClose();
		// 		},
		// 	},
		// );
		console.log("Remove document", documentsEditForm.getValues("id"));
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(isOpen) => {
				if (!isOpen) {
					onClose();
				}
			}}
		>
			{" "}
			<DialogContent className="min-w-fit lg:max-w-7xl">
				<DialogHeader>
					<DialogTitle>Redigera dokument</DialogTitle>
				</DialogHeader>
				<hr />
				<Form {...documentsEditForm}>
					<form
						onSubmit={documentsEditForm.handleSubmit(handleFormSubmit)}
						className="grid gap-x-4 gap-y-3 lg:grid-cols-4"
					>
							<FormField
								control={documentsEditForm.control}
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
								control={documentsEditForm.control}
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

						{/* Public */}

						<div className="space-x-2 lg:col-span-2 lg:grid-cols-subgrid">
							<Button
								variant="outline"
								className="w-32 min-w-fit"
								onClick={() => console.log("Preview clicked")}
							>
								Förhandsgranska
							</Button>

							<Button
								variant="destructive"
								type="button"
								className="w-32 min-w-fit"
								onClick={handleRemoveSubmit}
							>
								Remove document
							</Button>

							<Button type="submit" className="w-32 min-w-fit">
								Spara
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
