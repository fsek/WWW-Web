import type { NollningRead } from "@/api";
import {
	getAllNollningQueryKey,
	patchNollningMutation,
} from "@/api/@tanstack/react-query.gen";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface Props {
	nollning: NollningRead;
}

const nollningSchema = z.object({
	id: z.number(),
	name: z.string().min(1),
	description: z.string().min(1),
	year: z.coerce.number().min(1960).max(2100),
});

const EditNollning = ({ nollning }: Props) => {
	const [open, setOpen] = useState(false);
	const { t } = useTranslation("admin");

	const nollningForm = useForm<z.infer<typeof nollningSchema>>({
		resolver: zodResolver(nollningSchema),
	});

	useEffect(() => {
		nollningForm.reset({
			id: nollning.id,
			name: nollning.name,
			description: nollning.description,
			year: nollning.year,
		});
	}, [nollning, nollningForm]);

	const queryClient = useQueryClient();

	const editNollning = useMutation({
		...patchNollningMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllNollningQueryKey() });
			toast.success(t("nollning.main.edit_success"));
			setOpen(false);
		},
		onError: () => {
			toast.error(t("nollning.main.edit_error"));
			setOpen(false);
		},
	});

	const onSubmit = (values: z.infer<typeof nollningSchema>) => {
		editNollning.mutate({
			path: { nollning_id: values.id },
			body: {
				name: values.name,
				description: values.description,
				year: values.year,
			},
		});
	};

	return (
		<div>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<Button
						onClick={() => {
							nollningForm.reset();
						}}
					>
						{t("nollning.main.edit_button")}
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="text-3xl py-3 font-bold text-primary">
							{t("nollning.main.edit_title")}
						</DialogTitle>
					</DialogHeader>
					<Form {...nollningForm}>
						<form onSubmit={nollningForm.handleSubmit(onSubmit)}>
							<div className="px-8 space-x-4 space-y-4">
								<FormField
									control={nollningForm.control}
									name={"name"}
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("nollning.main.name")}</FormLabel>
											<FormControl>
												<Input placeholder={nollning.name} {...field} />
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={nollningForm.control}
									name={"year"}
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("nollning.main.year")}</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder={nollning.year.toString()}
													{...field}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={nollningForm.control}
									name={"description"}
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("nollning.main.description")}</FormLabel>
											<FormControl>
												<textarea
													className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
													{...field}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
								<Button type="submit" className="w-32 min-w-fit">
									{t("nollning.main.save")}
								</Button>

								<DialogClose type="button" className="w-32 min-w-fit">
									{t("nollning.main.cancel")}
								</DialogClose>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default EditNollning;
