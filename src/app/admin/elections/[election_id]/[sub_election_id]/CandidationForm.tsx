import { useState } from "react";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	createCandidationMutation,
	electionsGetSubElectionQueryKey,
} from "@/api/@tanstack/react-query.gen";
import { Plus, Save, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import AdminChooseUser, { type Option } from "@/widgets/AdminChooseUser";
import SelectOnePost from "@/components/SelectOnePost";
import getErrorMessage from "@/help_functions/getErrorMessage";

const schema = z.object({
	user_id: z.number({ error: "User is required" }),
	post_id: z.number({ error: "Post is required" }),
});

interface CandidationFormProps {
	subElectionId: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function CandidationForm({
	subElectionId,
	open,
	onOpenChange,
}: CandidationFormProps) {
	const [submitEnabled, setSubmitEnabled] = useState(true);
	const { t } = useTranslation("admin");

	const form = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: {
			user_id: undefined as unknown as number,
			post_id: undefined as unknown as number,
		},
	});

	const queryClient = useQueryClient();

	const createCandidation = useMutation({
		...createCandidationMutation(),
		onSuccess: () => {
			toast.success(t("elections.candidation_success"));
			queryClient.invalidateQueries({
				queryKey: electionsGetSubElectionQueryKey({
					path: { sub_election_id: subElectionId },
				}),
			});
			form.reset();
			onOpenChange(false);
			setSubmitEnabled(true);
		},
		onError: (error) => {
			toast.error(
				`${t("elections.candidation_error")} ${getErrorMessage(error, t)}`,
			);
			setSubmitEnabled(true);
		},
	});

	function onSubmit(values: z.infer<typeof schema>) {
		setSubmitEnabled(false);
		createCandidation.mutate({
			path: { sub_election_id: subElectionId },
			query: { user_id: values.user_id, post_id: values.post_id },
		});
	}

	return (
		<div className="p-3">
			<Button
				onClick={() => {
					form.reset({
						user_id: undefined,
						post_id: undefined,
					});
					onOpenChange(true);
					setSubmitEnabled(true);
				}}
				className="hidden"
			>
				<Plus />
				{t("elections.add_candidation")}
			</Button>

			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="min-w-fit lg:max-w-2xl">
					<DialogHeader>
						<DialogTitle>{t("elections.add_candidation")}</DialogTitle>
					</DialogHeader>
					<hr />
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="grid gap-x-4 gap-y-3 lg:grid-cols-2"
						>
							<FormField
								control={form.control}
								name="user_id"
								render={({ field }) => (
									<FormItem className="lg:col-span-2">
										<FormLabel>{t("admin:user")}</FormLabel>
										<FormControl>
											<AdminChooseUser
												onChange={(user) => {
													field.onChange((user as Option)?.value);
												}}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="post_id"
								render={({ field }) => (
									<FormItem className="lg:col-span-2">
										<FormLabel>{t("admin:post")}</FormLabel>
										<FormControl>
											<SelectOnePost
												value={field.value}
												onChange={field.onChange}
												filterList={[]}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className="space-x-2 lg:col-span-2 lg:grid-cols-subgrid">
								<Button
									type="submit"
									disabled={!submitEnabled}
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
