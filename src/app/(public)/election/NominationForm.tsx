import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createNominationMutation,
	getVisibleElectionQueryKey,
	getMeOptions,
} from "@/api/@tanstack/react-query.gen";
import { Plus, Save, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { SelectFromOptions } from "@/widgets/SelectFromOptions";
import getErrorMessage from "@/help_functions/getErrorMessage";

const schema = z.object({
	election_post_id: z.number({ required_error: "Post is required" }),
	nominee_name: z.string().min(1, { message: "Name is required" }),
	nominee_email: z.string().email({ message: "Invalid email" }),
	motivation: z.string().optional(),
});

interface BaseElectionPost {
	election_post_id: number;
	post_id: number;
	sub_election_id: number;
	name_sv: string;
	name_en: string;
}

interface NominationFormProps {
	electionPosts?: BaseElectionPost[];
	singleElectionPost?: BaseElectionPost;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	electionId: number;
	disabled?: boolean;
}

export default function NominationForm({
	electionPosts,
	singleElectionPost,
	open,
	onOpenChange,
	electionId,
	disabled = false,
}: NominationFormProps) {
	const [submitEnabled, setSubmitEnabled] = useState(true);
	const { t, i18n } = useTranslation("main");

	const posts: BaseElectionPost[] = useMemo(
		() => (singleElectionPost ? [singleElectionPost] : (electionPosts ?? [])),
		[electionPosts, singleElectionPost],
	);
	const singleMode = posts.length === 1;

	const form = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: {
			election_post_id: singleMode
				? posts[0].election_post_id
				: (undefined as unknown as number),
			nominee_name: "",
			nominee_email: "",
			motivation: "",
		},
	});

	// Reset / auto-select and prefill when posts or user change or dialog opens
	// biome-ignore lint/correctness/useExhaustiveDependencies: The linter wants .setValue and .reset to be in the deps array but they are stable
	useEffect(() => {
		if (open) {
			if (singleMode) {
				form.setValue("election_post_id", posts[0].election_post_id);
			} else {
				form.reset({ election_post_id: undefined as unknown as number });
			}
			setSubmitEnabled(true);
		}
	}, [open, singleMode, posts]);

	const queryClient = useQueryClient();

	const createNomination = useMutation({
		...createNominationMutation(),
		onError: (error) => {
			toast.error(
				`${t("elections.nomination_error")} ${getErrorMessage(error, t)}`,
			);
			setSubmitEnabled(true);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getVisibleElectionQueryKey(),
			});
		},
	});

	function onSubmit(values: z.infer<typeof schema>) {
		if (disabled) {
			toast.error(t("elections.nomination_error"));
			return;
		}
		setSubmitEnabled(false);

		const chosen = posts.find(
			(p) => p.election_post_id === values.election_post_id,
		);
		if (!chosen) {
			toast.error(`${t("elections.nomination_error")} (Invalid post)`);
			setSubmitEnabled(true);
			return;
		}

		const subElectionId = chosen.sub_election_id;
		createNomination.mutate(
			{
				path: { sub_election_id: subElectionId },
				body: {
					sub_election_id: subElectionId,
					nominee_name: values.nominee_name,
					nominee_email: values.nominee_email,
					motivation: values.motivation || "",
					election_post_id: chosen.election_post_id,
				},
			},
			{
				onSuccess: () => {
					toast.success(t("elections.nomination_success"));
					queryClient.invalidateQueries({
						queryKey: getVisibleElectionQueryKey({
							path: { sub_election_id: subElectionId },
						}),
					});
					form.reset({
						election_post_id: singleMode
							? posts[0].election_post_id
							: (undefined as unknown as number),
						nominee_name: "",
						nominee_email: "",
						motivation: "",
					});
					onOpenChange(false);
					setSubmitEnabled(true);
				},
			},
		);
	}

	const options = useMemo(
		() =>
			posts.map((p) => ({
				label:
					i18n.language === "en"
						? p.name_en || p.name_sv
						: p.name_sv || p.name_en,
				value: String(p.election_post_id),
			})),
		[posts, i18n.language],
	);

	return (
		<div>
			<Button
				onClick={() => {
					onOpenChange(true);
				}}
				variant="outline"
				disabled={disabled}
			>
				<Plus />
				{t("elections.add_nomination")}
			</Button>

			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="min-w-fit lg:max-w-2xl">
					<DialogHeader>
						<DialogTitle>{t("elections.add_nomination")}</DialogTitle>
					</DialogHeader>
					<hr />
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="grid gap-x-4 gap-y-3 lg:grid-cols-2"
						>
							<FormField
								control={form.control}
								name="election_post_id"
								render={({ field }) => (
									<FormItem className="lg:col-span-2">
										<FormLabel>{t("admin:post")}</FormLabel>
										<FormControl>
											<SelectFromOptions
												isDisabled={singleMode || disabled}
												value={
													field.value !== undefined
														? String(field.value)
														: undefined
												}
												onChange={(val) => field.onChange(Number(val))}
												options={options}
												placeholder={t("elections.select_post")}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="nominee_name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("elections.nominee_name")}</FormLabel>
										<FormControl>
											<Input {...field} value={field.value ?? ""} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="nominee_email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("elections.nominee_email")}</FormLabel>
										<FormControl>
											<Input {...field} value={field.value ?? ""} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="motivation"
								render={({ field }) => (
									<FormItem className="lg:col-span-2">
										<FormLabel>{t("elections.motivation")}</FormLabel>
										<FormControl>
											<Textarea {...field} value={field.value ?? ""} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="space-x-2 lg:col-span-2 lg:grid-cols-subgrid">
								<Button
									type="submit"
									disabled={disabled || !submitEnabled}
									className="w-32 min-w-fit"
								>
									<Save className="mr-2 h-4 w-4" />
									{t("admin:submit")}
								</Button>
								<Button
									type="button"
									variant="outline"
									onClick={() => onOpenChange(false)}
									className="w-32 min-w-fit"
								>
									<X className="mr-2 h-4 w-4" />
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
