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
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogTitle } from "@radix-ui/react-dialog";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	adminGetAllUsersOptions,
	blockUserFromCarBookingMutation,
	getAllCarBookingBlocksQueryKey,
} from "@/api/@tanstack/react-query.gen";
import { useTranslation } from "react-i18next";
import { SelectFromOptions } from "@/widgets/SelectFromOptions";
import { toast } from "sonner";

export default function form() {
	const { t } = useTranslation();

	const carBlockSchema = z.object({
		reason: z.string().min(1).max(255),
		user_id: z.number().min(1),
	});

	const [open, setOpen] = useState(false);
	const [submitEnabled, setSubmitEnabled] = useState(true);

	const form = useForm<z.infer<typeof carBlockSchema>>({
		resolver: zodResolver(carBlockSchema),
		defaultValues: {
			reason: "",
			user_id: 0,
		},
	});

	const {
		data: users,
	} = useQuery({
		...adminGetAllUsersOptions(),
	});

	const queryClient = useQueryClient();

	const createBlockings = useMutation({
		...blockUserFromCarBookingMutation(),
		throwOnError: false,
		onSuccess: () => {
			toast.success(t("admin:block.success_add"));
			queryClient.invalidateQueries({
				queryKey: getAllCarBookingBlocksQueryKey(),
			});
			setOpen(false);
			setSubmitEnabled(true);
		},
		onError: (error) => {
			toast.error(
				t("admin:block.error_add") + (error?.detail ? `: ${error.detail}` : ""),
			);
			setSubmitEnabled(true);
		},
	});

	function onSubmit(values: z.infer<typeof carBlockSchema>) {
		setSubmitEnabled(false);
		createBlockings.mutate({
			body: {
				reason: values.reason,
				user_id: values.user_id,
			},
		});
	}

	return (
		<div className="p-3">
			<Button
				onClick={() => {
					form.reset();
					setOpen(true);
					setSubmitEnabled(true);
				}}
			>
				{t("admin:block.create_blocking")}
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="min-w-fit lg:max-w-7xl">
					<DialogHeader>
						<DialogTitle>{t("admin:block.create_blocking")}</DialogTitle>
					</DialogHeader>
					<hr />
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="grid gap-x-4 gap-y-3 lg:grid-cols-4"
						>
							<FormField
								control={form.control}
								name="reason"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("admin:block.reason")}</FormLabel>
										<FormControl>
											<Input placeholder={t("admin:block.reason")} {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="user_id"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("admin:block.blocked_user")}</FormLabel>
										<FormControl>
											<SelectFromOptions
												options={
													users?.map((user) => ({
														value: user.id.toString(),
														label: `${user.first_name} ${user.last_name}`,
													})) ?? []
												}
												value={field.value.toString()}
												onChange={(value) => field.onChange(Number(value))}
												placeholder={t("admin:block.select_user")}
												className="w-full"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button
								type="submit"
								disabled={!submitEnabled}
								className="w-32 min-w-fit my-auto"
							>
								{t("admin:submit")}
							</Button>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
