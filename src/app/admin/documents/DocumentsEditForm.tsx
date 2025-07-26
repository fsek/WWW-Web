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
import {
	getAllDocumentsQueryKey,
	updateDocumentMutation,
	deleteDocumentMutation,
	getDocumentFileByIdOptions,
} from "@/api/@tanstack/react-query.gen";
import type { DocumentRead, DocumentUpdate } from "@/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { use, useEffect, useState } from "react";
import { ConfirmDeleteDialog } from "@/components/ui/ConfirmDeleteDialog";
import { useRouter } from "next/navigation";

interface DocumentsEditFormProps {
	open: boolean;
	onClose: () => void;
	selectedDocument: DocumentRead;
}

export default function DocumentsEditForm({
	open,
	onClose,
	selectedDocument,
}: DocumentsEditFormProps) {
	const { t } = useTranslation();
	const router = useRouter();

	const documentsEditSchema = z.object({
		id: z.number(),
		title: z.string(),
		file: z
			.instanceof(File)
			.refine(
				(file) => file.size <= 5 * 1024 * 1024,
				t("admin:documents.file_size_error"),
			)
			.refine(
				(file) => ["application/pdf"].includes(file.type),
				t("admin:documents.file_type_error"),
			),
		is_private: z.boolean(),
		category: z.string(),
	});

	type DocumentsEditFormType = z.infer<typeof documentsEditSchema>;

	const documentsEditForm = useForm<DocumentsEditFormType>({
		resolver: zodResolver(documentsEditSchema),
		defaultValues: {
			title: "",
			file: new File(
				["This is an example file. You may treat getting this as an error."],
				"sample.txt",
			),
			is_private: false,
		},
	});

	useEffect(() => {
		if (open && selectedDocument) {
			documentsEditForm.reset({
				...selectedDocument,
			});
		}
	}, [selectedDocument, documentsEditForm, open]);

	const queryClient = useQueryClient();

	const updateDocument = useMutation({
		...updateDocumentMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllDocumentsQueryKey() });
		},
		onError: () => {
			onClose();
		},
	});

	const removeDocument = useMutation({
		...deleteDocumentMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllDocumentsQueryKey() });
		},
		onError: () => {
			onClose();
		},
	});

	function handleFormSubmit(values: DocumentsEditFormType) {
		const updatedDocument: DocumentUpdate = {
			title: values.title,
			category: values.category,
			is_private: values.is_private,
		};

		updateDocument.mutate(
			{
				path: { document_id: values.id },
				body: updatedDocument,
			},
			{
				onSuccess: () => {
					onClose();
				},
			},
		);
		console.log("Form submitted", values);
	}

	function handleRemoveSubmit() {
		removeDocument.mutate(
			{ path: { document_id: documentsEditForm.getValues("id") } },
			{
				onSuccess: () => {
					onClose();
				},
			},
		);
	}

	async function handleReadDocument(selectedDocument: DocumentRead) {
		router.push(`/documents/${selectedDocument.id}`);
	}

	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	return (
		<Dialog
			open={open}
			onOpenChange={(isOpen) => {
				if (!isOpen) {
					onClose();
				}
			}}
		>
			<DialogContent className="min-w-fit lg:max-w-7xl">
				<DialogHeader>
					<DialogTitle>{t("admin:documents.edit_document")}</DialogTitle>
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

						<FormField
							control={documentsEditForm.control}
							name="is_private"
							render={({ field }) => (
								<FormItem className="lg:col-span-2">
									<FormLabel>{t("admin:documents.is_private")}</FormLabel>
									<FormControl>
										<Input
											type="checkbox"
											checked={field.value}
											onChange={(e) => field.onChange(e.target.checked)}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						<div className="space-x-2 lg:col-span-2 lg:grid-cols-subgrid">
							<ConfirmDeleteDialog
								open={deleteDialogOpen}
								onOpenChange={setDeleteDialogOpen}
								onConfirm={handleRemoveSubmit}
								triggerText={t("admin:documents.remove_document")}
								title={t("admin:documents.confirm_remove")}
								description={t("admin:documents.confirm_remove_text")}
								confirmText={t("admin:documents.remove_document")}
								cancelText={t("admin:cancel")}
							/>
							<Button type="submit" className="w-32 min-w-fit">
								{t("admin:submit")}
							</Button>
							<Button
								type="button"
								variant="secondary"
								className="w-32 min-w-fit"
								onClick={() => handleReadDocument(selectedDocument)}
							>
								{t("admin:documents.read")}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
