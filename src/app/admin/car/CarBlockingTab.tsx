"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	adminGetAllUsersOptions,
	getAllCarBookingBlocksOptions,
	getAllCarBookingBlocksQueryKey,
	unblockUserFromCarBookingMutation,
} from "@/api/@tanstack/react-query.gen";
import type { AdminUserRead, CarBlockRead } from "@/api/index";
import {
	createColumnHelper,
	getCoreRowModel,
	getPaginationRowModel,
	type Row,
	useReactTable,
} from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import AdminTable from "@/widgets/AdminTable";
import BlockForm from "./BlockForm";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";

const blockColumnHelper = createColumnHelper<CarBlockRead>();

export default function CarBlockingTab() {
	const { t } = useTranslation();
	const queryClient = useQueryClient();

	const {
		data: blockData,
		error: blockError,
		isLoading: isBlockLoading,
	} = useQuery({
		...getAllCarBookingBlocksOptions(),
	});

	const {
		data: userDetails,
		error: userDetailsError,
		isLoading: userDetailsIsLoading,
		isFetching: userDetailsIsFetching,
	} = useQuery({
		...adminGetAllUsersOptions(),
		refetchOnWindowFocus: false,
	});

	const handleUnblockUser = useMutation({
		...unblockUserFromCarBookingMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getAllCarBookingBlocksQueryKey(),
			});
		},
	});

	function getUserFullName(user_id: number): string {
		if (userDetailsError || userDetailsIsFetching || !userDetails) {
			return "Unknown User";
		}
		const user = (userDetails as AdminUserRead[]).find(
			(u: AdminUserRead) => u.id === user_id,
		);
		return user ? `${user.first_name} ${user.last_name}` : "Unknown User";
	}

	const blockColumns = useMemo(
		() => [
			blockColumnHelper.accessor("user_id", {
				header: t("admin:block.blocked_user"),
				cell: (info) => getUserFullName(info.getValue()),
			}),
			blockColumnHelper.accessor("reason", {
				header: t("admin:block.reason"),
				cell: (info) => info.getValue(),
			}),
			blockColumnHelper.accessor("blocked_by", {
				header: t("admin:block.blocked_by"),
				cell: (info) => getUserFullName(info.getValue()),
			}),
			blockColumnHelper.accessor("created_at", {
				header: t("admin:block.blocked_at"),
				cell: (info) =>
					info.getValue()
						? new Date(info.getValue()).toLocaleString("sv-SE")
						: "",
			}),
			blockColumnHelper.display({
				id: "actions",
				header: t("admin:block.actions"),
				cell: ({ row }: { row: Row<CarBlockRead> }) => (
					<Button
						variant="destructive"
						size="sm"
						onClick={(e) => {
							e.stopPropagation();
							handleUnblockUser.mutate(
								{ path: { user_id: row.original.user_id } },
								{
									onError: (error) => {
										toast.error(
											t("admin:block.error_unblock") +
												(error?.detail ? `: ${error.detail}` : ""),
										);
									},
									onSuccess: () => {
										toast.success(t("admin:block.success_unblock"));
										queryClient.invalidateQueries({
											queryKey: getAllCarBookingBlocksQueryKey(),
										});
									},
								},
							);
						}}
					>
						{t("admin:block.unblock")}
					</Button>
				),
			}),
		],
		[
			t,
			userDetails,
			userDetailsError,
			userDetailsIsFetching,
			handleUnblockUser,
			queryClient,
		],
	);

	const blockTable = useReactTable({
		columns: blockColumns,
		data: (blockData as CarBlockRead[]) ?? [],
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	});

	if (userDetailsError || blockError) {
		return (
			<LoadingErrorCard error={userDetailsError || blockError || undefined} />
		);
	}

	if (isBlockLoading || userDetailsIsLoading) {
		return <LoadingErrorCard />;
	}

	return (
		<div>
			<div className="space-y-0">
				<h2 className="flex items-center text-2xl font-semibold tracking-tight md:text-3xl text-primary">
					{t("admin:car.blockings")}
				</h2>
				<p className="text-xs md:text-sm font-medium">
					{t("admin:car.blockings_description")}
				</p>
			</div>
			<BlockForm />
			<Separator />
			<AdminTable table={blockTable} />
		</div>
	);
}
