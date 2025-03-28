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

const documentsSchema = z.object({
	title: z.string(),
	// description: "",
	file: z
		.instanceof(File)
		.refine(
			(file) => file.size <= 5 * 1024 * 1024,
			"Filen får inte vara större än 5MB",
		)
		.refine(
			(file) =>
				["application/pdf", "image/jpeg", "image/png"].includes(file.type),
			"Endast PDF, JPEG och PNG är tillåtna.",
		),
	public: z.boolean(),
	uploader_id: z.string(),
	upload_date: z.string(),
	edit_date: z.string(),
});

export default function DocumentsForm() {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const [submitEnabled, setSubmitEnabled] = useState(true);

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
						<DialogTitle>Skapa event</DialogTitle>
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
										<FormLabel>Titel</FormLabel>
										<FormControl>
											<Input placeholder="Titel" {...field} />
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={documentsForm.control}
								name="file"
								render={({ field }) => (
									<FormItem className="lg:col-span-2">
										<FormLabel>Fil</FormLabel>
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

							<div className="space-x-2 lg:col-span-2 lg:grid-cols-subgrid">
								<Button variant="outline" className="w-32 min-w-fit">
									Förhandsgranska
								</Button>
								<Button
									type="submit"
									disabled={!submitEnabled}
									className="w-32 min-w-fit"
								>
									Publicera
								</Button>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
