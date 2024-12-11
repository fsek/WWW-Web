import { useState, useEffect } from "react";
import { type NewsRead, NewsService } from "../../../api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createNewsMutation,
	createNewsOptions,
	getAllNewsQueryKey,
} from "@/api/@tanstack/react-query.gen";
import { Plus } from "lucide-react";

const newsSchema = z.object({
	title_sv: z.string().min(2),
	title_en: z.string().min(2),
	text_sv: z.string().min(2),
	text_en: z.string().min(2),
	picture: z.any().optional(),
});

export default function NewsForm() {
	const [open, setOpen] = useState(false);
	const [submitEnabled, setSubmitEnabled] = useState(true);
	const newsForm = useForm<z.infer<typeof newsSchema>>({
		resolver: zodResolver(newsSchema),
	});

	const createNews = useMutation({
		...createNewsMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries(getAllNewsQueryKey());
			setOpen(false);
			setSubmitEnabled(true);
		},
	});

	const queryClient = useQueryClient();

	function onSubmit(values: z.infer<typeof newsSchema>) {
		// Do something with the form values.
		// ✅ This will be type-safe and validated.
		setSubmitEnabled(false);
		createNews.mutate({
			body: {
				title_sv: values.title_sv,
				title_en: values.title_en,
				content_sv: values.text_sv,
				content_en: values.text_en,
				pinned_from: undefined,
				pinned_to: undefined,
			},
		});
	}

	return (
		<div className="p-3">
			<Button
				onClick={() => {
					newsForm.reset();
					setOpen(true);
					setSubmitEnabled(true);
				}}
			>
				<Plus />
				Skapa nyhet
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="min-w-fit lg:max-w-7xl">
					<DialogHeader>
						<DialogTitle>Skapa nyhet</DialogTitle>
					</DialogHeader>
					<hr />
					<Form {...newsForm}>
						<form
							onSubmit={newsForm.handleSubmit(onSubmit)}
							className="grid gap-x-4 gap-y-3 lg:grid-cols-2"
						>
							<FormField
								control={newsForm.control}
								name="title_sv"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Titel (sv)</FormLabel>
										<FormControl>
											<Input placeholder="Titel" {...field} />
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={newsForm.control}
								name="title_en"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Titel (en)</FormLabel>
										<FormControl>
											<Input placeholder="Title" {...field} />
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={newsForm.control}
								name="text_sv"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Text (sv)</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Text"
												className="h-48"
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={newsForm.control}
								name="text_en"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Text (en)</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Text"
												className="h-48"
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={newsForm.control}
								name="picture"
								render={({ field }) => (
									<FormItem className="lg:col-span-2">
										<FormLabel>Bild</FormLabel>
										<FormControl>
											<Input id="picture" type="file" {...field} />
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
