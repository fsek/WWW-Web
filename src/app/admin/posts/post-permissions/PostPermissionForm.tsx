import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogTitle } from "@radix-ui/react-dialog";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
	changePostPermissionsMutation,
	getAllPostsQueryKey,
	getAllPermissionsOptions,
	getPostQueryKey,
} from "@/api/@tanstack/react-query.gen";
import type { PostRead, PermissionRead } from "@/api";

interface PostPermissionFormProps {
	post_values?: PostRead | null;
}

const postPermissionSchema = z.object({
	post_id: z.number().int(),
	permissions: z.array(
		z.object({
			change: z.enum(["add", "remove"]),
			permission_id: z.number().int(),
		}),
	),
});

type FormValues = z.infer<typeof postPermissionSchema>;

export default function PostPermissionForm({
	post_values = null,
}: PostPermissionFormProps) {
	const [open, setOpen] = useState(false);
	const [submitEnabled, setSubmitEnabled] = useState(true);
	const [selectedIds, setSelectedIds] = useState<number[]>([]);

	const { data: permissionsList = [] } = useQuery({
		...getAllPermissionsOptions(),
	}) as { data?: PermissionRead[] };

	const form = useForm<FormValues>({
		resolver: zodResolver(postPermissionSchema),
		defaultValues: {
			post_id: post_values?.id ?? 0,
			permissions: [],
		},
	});

	const queryClient = useQueryClient();
	const mutation = useMutation({
		...changePostPermissionsMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllPostsQueryKey() });
			console.log("tog sig hit");
			queryClient.invalidateQueries({
				queryKey: getPostQueryKey({ path: { post_id: post_values?.id ?? -1 } }),
			});
			console.log("men inte hit");

			setSubmitEnabled(true);
			setOpen(false);
		},
		onError: () => {
			setOpen(false);
			setSubmitEnabled(true);
		},
	});

	useEffect(() => {
		if (open && post_values) {
			setSelectedIds(post_values.permissions.map((p) => p.id));
			form.reset({ post_id: post_values.id, permissions: [] });
		}
	}, [open, post_values, form]);

	function togglePermission(id: number) {
		setSelectedIds((prev) =>
			prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id],
		);
	}

	function onSubmit() {
		if (!post_values) return;
		// Compute diffs
		const original = post_values.permissions.map((p) => p.id);
		const toAdd = selectedIds.filter((id) => !original.includes(id));
		const toRemove = original.filter((id) => !selectedIds.includes(id));

		type UP = FormValues["permissions"][0];

		const perms = [
			...toAdd.map((id): UP => ({ change: "add", permission_id: id })),
			...toRemove.map((id): UP => ({ change: "remove", permission_id: id })),
		];

		setSubmitEnabled(false);
		mutation.mutate({ body: { post_id: post_values.id, permissions: perms } });
	}

	if (!post_values) {
		return <div>Hämtar...</div>;
	}

	return (
		<div className="p-3">
			<Button
				onClick={() => {
					setOpen(true);
					setSubmitEnabled(true);
				}}
			>
				Ändra behörigheter
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="min-w-fit lg:max-w-7xl">
					<DialogHeader>
						<DialogTitle>Ändra behörigheter</DialogTitle>
					</DialogHeader>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="grid gap-x-4 gap-y-3 lg:grid-cols-4"
						>
							<input type="hidden" {...form.register("post_id")} />

							{permissionsList.map((permission) => (
								<FormField
									key={permission.id}
									control={form.control}
									name="permissions"
									render={() => (
										<FormItem>
											<FormLabel htmlFor={`perm-${permission.id}`}>
												{permission.target}
											</FormLabel>
											<FormControl>
												<Checkbox
													id={`perm-${permission.id}`}
													checked={selectedIds.includes(permission.id)}
													onCheckedChange={() =>
														togglePermission(permission.id)
													}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
							))}

							<div className="space-x-2 lg:col-span-2 lg:grid-cols-subgrid">
								<Button variant="outline" className="w-32 min-w-fit">
									Förhandsgranska
								</Button>
								<Button
									type="submit"
									disabled={!submitEnabled}
									className="w-32 min-w-fit"
								>
									Spara
								</Button>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
