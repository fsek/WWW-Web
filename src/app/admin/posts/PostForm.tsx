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

const postSchema = z.object({
	name: z.string().min(2),
	council_id: z.number().int(),
});

export default function PostForm() {
	const [open, setOpen] = useState(false);
	const [submitEnabled, setSubmitEnabled] = useState(true);

	const postForm = useForm<z.infer<typeof postSchema>>({
		resolver: zodResolver(postSchema),
		defaultValues: {
			name: "",
			council_id: 0,
		},
	});

	const queryClient = useQueryClient();

	const createPosts = useMutation({
		...createPostMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllPostsQueryKey() });
			setOpen(false);
			setSubmitEnabled(true);
		},
		onError: () => {
			setOpen(false);
			setSubmitEnabled(true);
		},
	});

	function onSubmit(values: z.infer<typeof postSchema>) {
		setSubmitEnabled(false);
		createPosts.mutate({
			body: {
				name: values.name,
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
				Skapa post
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="min-w-fit lg:max-w-7xl">
					<DialogHeader>
						<DialogTitle>Skapa post</DialogTitle>
					</DialogHeader>
					<hr />
					<Form {...postForm}>
						<form
							onSubmit={postForm.handleSubmit(onSubmit)}
							className="grid gap-x-4 gap-y-3 lg:grid-cols-4"
						>
							<FormField
								control={postForm.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Namn </FormLabel>
										<FormControl>
											<Input placeholder="Titel" {...field} />
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={postForm.control}
								name="council_id"
								render={({ field }) => (
									<FormItem className="lg:col-span-2">
										<FormLabel>Council name</FormLabel>
										<AdminChooseCouncil
											value={field.value}
											onChange={field.onChange}
										/>
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
