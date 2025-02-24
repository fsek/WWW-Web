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

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getAllSongsQueryKey,
	removeMutation,
	updateMutation,
} from "@/api/@tanstack/react-query.gen";
import type { SongRead, <UpdateSong></UpdateSong> } from "../../../api";

const songEditSchema = z.object({
	id: z.string().min(2),
	title: z.string().min(2),
	author: z.string().min(2),
	melody: z.string(),
	content: z.string(),
	category: z.array(z.string()),
	views: z.number(),
});

type SongsEditFormType = z.infer<typeof songEditSchema>;

interface SongsEditFormProps {
	open: boolean;
	onClose: () => void;
	selectedSong: SongRead;
}

export default function SongsEditForm({
	open,
	onClose,
	selectedSong,
}: SongsEditFormProps) {
	const form = useForm<SongsEditFormType>({
		resolver: zodResolver(songEditSchema),
		defaultValues: {
			title: "",
			author: "",
			melody: "",
			content: "",
		},
	});

	useEffect(() => {
		if (open && selectedSong) {
			form.reset({
				...selectedSong,
			});
		}
	}, [selectedSong, form, open]);

	const queryClient = useQueryClient();

	const updateSong = useMutation({
		...updateMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllSongsQueryKey() });
		},
		onError: () => {
			onClose();
		},
	});

	const removeSong = useMutation({
		...removeMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllSongsQueryKey() });
		},
		onError: () => {
			onClose();
		},
	});

	function handleFormSubmit(values: SongEditFormType) {
		const updatedSong: SongUpdate = {
			title: values.title,
			author: values.author,
			melody: values.melody,
			content: values.content,
		};

		updateSong.mutate(
			{
				path: { song_id: values.id },
				body: updatedSong,
			},
			{
				onSuccess: () => {
					onClose();
				},
			},
		);
	}

	function handleRemoveSubmit() {
		removeSong.mutate(
			{ path: { song_id: form.getValues("id") } },
			{
				onSuccess: () => {
					onClose();
				},
			},
		);
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
					<DialogTitle>Redigera sång</DialogTitle>
				</DialogHeader>
				<hr />
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleFormSubmit)}
						className="grid gap-x-4 gap-y-3 lg:grid-cols-4"
					>
						{/* Titel */}
						<FormField
							control={form.control}
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

						{/* Author */}
						<FormField
							control={form.control}
							name="author"
							render={({ field }) => (
								<FormItem className="lg:col-span-2">
									<FormLabel>Author</FormLabel>
									<FormControl>
										<Input placeholder="Author" {...field} />
									</FormControl>
								</FormItem>
							)}
						/>

						{/* Melody */}
						<FormField
							control={form.control}
							name="melody"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Melody</FormLabel>
									<FormControl>
										<Input placeholder="Melody" {...field} />
									</FormControl>
								</FormItem>
							)}
						/>

						{/* Content */}
						<FormField
							control={form.control}
							name="content"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Content </FormLabel>
									<FormControl>
										<Input placeholder="Author" {...field} />
									</FormControl>
								</FormItem>
							)}
						/>

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
								Remove song
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
