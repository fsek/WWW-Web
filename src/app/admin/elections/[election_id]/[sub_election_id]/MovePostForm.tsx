"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { SelectFromOptions } from "@/widgets/SelectFromOptions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	electionsMoveElectionPostMutation,
	electionsGetSubElectionQueryKey,
} from "@/api/@tanstack/react-query.gen";
import { toast } from "sonner";
import { Save, X, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import getErrorMessage from "@/help_functions/getErrorMessage";

interface MovePostFormProps {
	subElectionId: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	posts: {
		election_post_id: number;
		name_en?: string | null;
		name_sv?: string | null;
	}[];
	otherSubElections: {
		sub_election_id: number;
		title_en?: string | null;
		title_sv?: string | null;
	}[];
}

const schema = z.object({
	election_post_id: z.number({ error: "Post is required" }),
	new_sub_election_id: z.number({
		error: "Target sub election is required",
	}),
});

type FormValues = z.infer<typeof schema>;

export default function MovePostForm({
	subElectionId,
	open,
	onOpenChange,
	posts,
	otherSubElections,
}: MovePostFormProps) {
	const { t, i18n } = useTranslation("admin");
	const [submitting, setSubmitting] = useState(false);
	const queryClient = useQueryClient();

	const form = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: {
			election_post_id: undefined as unknown as number,
			new_sub_election_id: undefined as unknown as number,
		},
	});

	const moveMutation = useMutation({
		...electionsMoveElectionPostMutation(),
		onSuccess: (_data, variables) => {
			toast.success(
				t("elections.move_post_success", { defaultValue: "Post moved" }),
			);
			// Invalidate current and target sub election queries
			queryClient.invalidateQueries({
				queryKey: electionsGetSubElectionQueryKey({
					path: { sub_election_id: subElectionId },
				}),
			});
			if (variables?.body?.new_sub_election_id) {
				queryClient.invalidateQueries({
					queryKey: electionsGetSubElectionQueryKey({
						path: { sub_election_id: variables.body.new_sub_election_id },
					}),
				});
			}
			form.reset();
			setSubmitting(false);
			onOpenChange(false);
		},
		onError: (error) => {
			toast.error(
				`${t("elections.move_post_error", { defaultValue: "Could not move post" })} ${getErrorMessage(error, t)}`,
			);
			setSubmitting(false);
		},
	});

	function onSubmit(values: FormValues) {
		setSubmitting(true);
		moveMutation.mutate({
			path: { sub_election_id: subElectionId },
			body: {
				election_post_id: values.election_post_id,
				new_sub_election_id: values.new_sub_election_id,
			},
		});
	}

	const postOptions = posts.map((p) => ({
		value: String(p.election_post_id),
		label:
			i18n.language === "en"
				? p.name_en || `#${p.election_post_id}`
				: p.name_sv || `#${p.election_post_id}`,
	}));

	const subElectionOptions = otherSubElections.map((s) => ({
		value: String(s.sub_election_id),
		label:
			i18n.language === "en"
				? s.title_en || `#${s.sub_election_id}`
				: s.title_sv || `#${s.sub_election_id}`,
	}));

	return (
		<Dialog
			open={open}
			onOpenChange={(o) => {
				if (!submitting) onOpenChange(o);
			}}
		>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>
						{t("elections.move_post", { defaultValue: "Move post" })}
					</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="election_post_id"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										{t("elections.post_to_move", { defaultValue: "Post" })}
									</FormLabel>
									<FormControl>
										<SelectFromOptions
											options={postOptions}
											value={field.value ? String(field.value) : undefined}
											onChange={(v) => field.onChange(Number(v))}
											placeholder={t("elections.select_post", {
												defaultValue: "Select post",
											})}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="new_sub_election_id"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										{t("elections.target_sub_election", {
											defaultValue: "Target sub election",
										})}
									</FormLabel>
									<FormControl>
										<SelectFromOptions
											options={subElectionOptions}
											value={field.value ? String(field.value) : undefined}
											onChange={(v) => field.onChange(Number(v))}
											placeholder={t("elections.select_sub_election", {
												defaultValue: "Select sub election",
											})}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="flex gap-2 pt-2">
							<Button
								type="submit"
								disabled={
									submitting ||
									!form.watch("election_post_id") ||
									!form.watch("new_sub_election_id")
								}
							>
								<Save className="h-4 w-4 mr-2" />
								{t("admin:submit")}
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={submitting}
							>
								<X className="h-4 w-4 mr-2" />
								{t("admin:cancel")}
							</Button>
						</div>
					</form>
				</Form>
				<p className="text-xs text-muted-foreground flex items-center gap-1">
					<ArrowRight className="h-3 w-3" />{" "}
					{t("elections.move_post_hint", {
						defaultValue: "Select a post and a target sub election to move it.",
					})}
				</p>
			</DialogContent>
		</Dialog>
	);
}
