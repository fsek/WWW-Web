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
	createSongMutation,
	getAllSongsQueryKey,
} from "@/api/@tanstack/react-query.gen";

const songSchema = z.object({
	title: z.string().min(2),
	author: z.string().min(2),
	melody: z.string(),
	content: z.string(),
});

export default function SongForm() {
	const [open, setOpen] = useState(false);
	const [submitEnabled, setSubmitEnabled] = useState(true);

	const songForm = useForm<z.infer<typeof songSchema>>({
		resolver: zodResolver(songSchema),
		defaultValues: {
			title: "",
			author: "",
			melody: "",
			content: "",
		},
	});

	const queryClient = useQueryClient();

	const createSongs = useMutation({
		...createSongMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllSongsQueryKey() });
			setOpen(false);
			setSubmitEnabled(true);
		},
		onError: () => {
			setOpen(false);
			setSubmitEnabled(true);
		},
	});

	function onSubmit(values: z.infer<typeof songSchema>) {
		setSubmitEnabled(false);
		createSongs.mutate({
			body: {
				title: values.title,
				author: values.author,
				melody: values.melody,
				content: values.content,
				category: { id: 1, name: "hej" },
			},
		});
	}

	return (
		<div className="p-3">
			<Button
				onClick={() => {
					songForm.reset();
					setOpen(true);
					setSubmitEnabled(true);
				}}
			>
				Skapa sång
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="min-w-fit lg:max-w-7xl">
					<DialogHeader>
						<DialogTitle>Skapa sång</DialogTitle>
					</DialogHeader>
					<hr />
					<Form {...songForm}>
						<form
							onSubmit={songForm.handleSubmit(onSubmit)}
							className="grid gap-x-4 gap-y-3 lg:grid-cols-4"
						>
							<FormField
								control={songForm.control}
								name="title"
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
								control={songForm.control}
								name="author"
								render={({ field }) => (
									<FormItem className="lg:col-span-2">
										<FormLabel>Author</FormLabel>
										<FormControl>
											<Input placeholder="Författare" {...field} />
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={songForm.control}
								name="melody"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Melodi</FormLabel>
										<FormControl>
											<Input placeholder="Melodi" {...field} />
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={songForm.control}
								name="content"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Text</FormLabel>
										<FormControl>
											<Input placeholder="Text" {...field} />
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
