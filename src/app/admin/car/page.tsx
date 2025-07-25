"use client";

// Now using: https://github.com/robskinney/shadcn-ui-fullcalendar-example

import { useMemo, useState } from "react";
import type { AdminUserRead, CarBookingRead } from "@/api/index";
import CarForm from "./CarForm";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	adminGetAllUsersOptions,
	createCarBookingMutation,
	getAllCarBookingsOptions,
} from "@/api/@tanstack/react-query.gen";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Calendar from "@/components/full-calendar";
import { EventsProvider } from "@/utils/full-calendar-event-context";
import {
	createColumnHelper,
	useReactTable,
	getCoreRowModel,
	getPaginationRowModel,
	type SortingState,
	getSortedRowModel,
	type Row,
} from "@tanstack/react-table";
import {
	removeCarBookingMutation,
	getAllCarBookingsQueryKey,
	updateCarBookingMutation,
} from "@/api/@tanstack/react-query.gen";
import AdminTable from "@/widgets/AdminTable";
import type {
	CalendarEvent,
	CustomEventData,
} from "@/utils/full-calendar-seed";
import { useTranslation } from "react-i18next";
import CarEditForm from "./CarEditForm";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import BlockForm from "./BlockForm";
import type { CarBlockRead } from "@/api/index";
import {
	unblockUserFromCarBookingMutation,
	getAllCarBookingBlocksOptions,
	getAllCarBookingBlocksQueryKey,
} from "@/api/@tanstack/react-query.gen";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";

const columnHelper = createColumnHelper<CarBookingRead>();

export default function Car() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const { t, i18n } = useTranslation();
	const queryClient = useQueryClient();
	const [, setOpen] = useState(false);
	const [, setSubmitEnabled] = useState(true);
	const [openEditDialog, setOpenEditDialog] = useState(false);
	const [selectedBooking, setselectedBooking] = useState<CarBookingRead | null>(
		null,
	);
	const [showOnlyCurrent, setShowOnlyCurrent] = useState(false);

	// Read tab from query string, default to "calendar"
	const initialTab = searchParams.get("tab") || "calendar";
	const [tab, setTab] = useState(initialTab);

	// Column setup
	const columns = [
		columnHelper.accessor("description", {
			header: t("admin:description"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("start_time", {
			header: t("admin:car.start_time"),
			cell: (info) =>
				new Date(info.getValue()).toLocaleString("sv-SE", {
					hour: "2-digit",
					minute: "2-digit",
					year: "numeric",
					month: "2-digit",
					day: "2-digit",
				}),
		}),
		columnHelper.accessor("end_time", {
			header: t("admin:car.end_time"),
			cell: (info) =>
				new Date(info.getValue()).toLocaleString("sv-SE", {
					hour: "2-digit",
					minute: "2-digit",
					year: "numeric",
					month: "2-digit",
					day: "2-digit",
				}),
		}),
		columnHelper.accessor(
			(row) => `${row.user.first_name} ${row.user.last_name}`,
			{
				id: "user_full_name",
				header: t("admin:car.booked_by_name"),
				cell: (info) => info.getValue(),
			},
		),
		columnHelper.accessor("confirmed", {
			header: t("admin:car.confirmed"),
			cell: (info) => {
				const confirmed = info.getValue();
				return confirmed ? t("admin:yes") : t("admin:no");
			},
		}),
		// Combined column for personal/council
		columnHelper.accessor(
			(row) =>
				row.personal
					? t("admin:car.personal")
					: ((i18n.language === "en"
							? row.council?.name_en
							: row.council?.name_sv) ?? t("admin:car.no_council")),
			{
				id: "personal_or_council",
				header: t("admin:car.personal_or_council"),
				cell: (info) => info.getValue(),
			},
		),
		{
			id: "details",
			header: t("admin:car.details"),
			cell: (row: { row: Row<CarBookingRead> }) => {
				const isConfirmed = row.row.original.confirmed;
				const buttonColor = isConfirmed
					? "border-green-600 text-green-700"
					: "border-yellow-500 text-yellow-700 bg-yellow-50";
				return (
					<Button
						variant="outline"
						className={`px-2 py-1 border ${buttonColor}`}
						onClick={(e) => {
							e.stopPropagation();
							router.push(
								`/car/booking-details?id=${row.row.original.booking_id}`,
							);
						}}
					>
						{t("admin:car.details")}
					</Button>
				);
			},
		},
	];

	const { data, error, isFetching, isLoading } = useQuery({
		...getAllCarBookingsOptions(),
	});

	const {
		data: userDetails,
		error: userDetailsError,
		isFetching: userDetailsIsFetching,
		isLoading: userDetailsIsLoading,
	} = useQuery({
		...adminGetAllUsersOptions(),
	});

	const tableData = useMemo(() => {
		if (!data) {
			return [];
		}
		if (showOnlyCurrent) {
			return (data as CarBookingRead[]).filter(
				(booking) => new Date(booking.end_time) >= new Date(),
			);
		}
		return data as CarBookingRead[];
	}, [data, showOnlyCurrent]);

	const handleEventAdd = useMutation({
		...createCarBookingMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllCarBookingsQueryKey() });
			setOpen(false);
			setSubmitEnabled(true);
			toast.success(t("admin:car.success_add"));
		},
	});

	const handleEventDelete = useMutation({
		...removeCarBookingMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllCarBookingsQueryKey() });
			setOpen(false);
			setSubmitEnabled(true);
			toast.success(t("admin:car.success_delete"));
		},
	});

	const handleEventEdit = useMutation({
		...updateCarBookingMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllCarBookingsQueryKey() });
			setOpen(false);
			setSubmitEnabled(true);
			toast.success(t("admin:car.success_edit"));
		},
	});

	function handleRowClick(row: Row<CarBookingRead>) {
		setselectedBooking(row.original);
		setOpenEditDialog(true);
	}

	function handleClose() {
		setOpenEditDialog(false);
		setselectedBooking(null);
	}

	const [sorting, setSorting] = useState<SortingState>([]);

	const table = useReactTable({
		columns,
		data: tableData,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: setSorting,
		initialState: {
			pagination: {
				pageIndex: 0, //custom initial page index
				pageSize: 10, //custom default page size
			},
			sorting: sorting,
		},
		state: {
			sorting,
		},
	});

	// Blocked users state and query
	const {
		data: blockData,
		error: blockError,
		isFetching: isBlockFetching,
		isLoading: isBlockLoading,
	} = useQuery({
		...getAllCarBookingBlocksOptions(),
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
			(user: AdminUserRead) => user.id === user_id,
		);
		if (!user) {
			return "Unknown User";
		}
		return `${user.first_name} ${user.last_name}`;
	}

	const blockColumns = useMemo(
		() => [
			{
				accessorKey: "user_id",
				header: t("admin:block.blocked_user"),
				cell: (info) => {
					const userId = info.getValue();
					const userName = getUserFullName(userId);
					return userName;
				},
			},
			{
				accessorKey: "reason",
				header: t("admin:block.reason"),
				cell: (info) => info.getValue(),
			},
			{
				accessorKey: "blocked_by",
				header: t("admin:block.blocked_by"),
				cell: (info) => {
					const userId = info.getValue();
					const userName = getUserFullName(userId);
					return userName;
				},
			},
			{
				accessorKey: "created_at",
				header: t("admin:block.blocked_at"),
				cell: (info) =>
					info.getValue()
						? new Date(info.getValue()).toLocaleString("sv-SE")
						: "",
			},
			{
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
			},
		],
		[t, handleUnblockUser, queryClient.invalidateQueries],
	);

	const blockTable = useReactTable({
		columns: blockColumns,
		data: (blockData as CarBlockRead[]) ?? [],
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	});

	if (error || userDetailsError || blockError) {
		return (
			<LoadingErrorCard
				error={error || userDetailsError || blockError || undefined}
			/>
		);
	}

	interface CustomEventData_ extends CustomEventData {
		council_id?: number;
		personal: boolean;
		confirmed: boolean;
		council_name_sv?: string;
		council_name_en?: string;
	}

	// Transform the fetched data into CalendarEvent type
	const events: CalendarEvent<CustomEventData_>[] =
		(data as CarBookingRead[])?.map((car) => {
			const userName =
				car.user.first_name && car.user.last_name
					? `${car.user.first_name} ${car.user.last_name}`
					: `User ${car.user.id}`;
			const backgroundColor = car.confirmed ? "#66cc00" : "#e6e600"; // Green for confirmed, yellow for unconfirmed
			return {
				id: car.booking_id.toString(),
				title_sv: userName,
				start: car.start_time,
				end: car.end_time,
				all_day: false,
				description_sv: car.description,
				council_name_sv: car.council?.name_sv ?? undefined,
				council_name_en: car.council?.name_en ?? undefined,
				confirmed: car.confirmed,
				personal: car.personal,
				council_id: car.council_id ?? undefined,
				backgroundColor: backgroundColor,
			};
		}) ?? [];

	return (
		<div className="px-8 space-x-4">
			<h3 className="text-xl px-8 py-3 underline underline-offset-4 decoration-sidebar">
				{t("admin:car.title")}
			</h3>
			<p className="py-3">{t("admin:car.description")}</p>
			<Separator />
			{isFetching || userDetailsIsLoading || isBlockLoading ? (
				<LoadingErrorCard />
			) : error || userDetailsError || blockError ? (
				<LoadingErrorCard
					error={error || userDetailsError || blockError || undefined}
				/>
			) : (
				<EventsProvider
					initialCalendarEvents={events}
					eventColor="#f6ad55" // TODO: use tailwind
					carEvents={true}
					handleAdd={(event) => {
						handleEventAdd.mutate(
							{
								body: {
									description: event.description_sv,
									start_time: event.start,
									end_time: event.end,
									personal: (event.personal as boolean) ?? true,
									council_id: event.council_id
										? (event.council_id as number)
										: undefined,
								},
							},
							{
								onError: (error) => {
									toast.error(
										t("admin:car.error_add") +
											(error?.detail ? `: ${error.detail}` : ""),
									);
								},
							},
						);
					}}
					handleDelete={(id) => {
						handleEventDelete.mutate(
							{ path: { booking_id: Number(id) } },
							{
								onError: (error) => {
									toast.error(
										t("admin:car.error_delete") +
											(error?.detail ? `: ${error.detail}` : ""),
									);
									// TODO: Show error message to user
								},
							},
						);
					}}
					handleEdit={(event) => {
						if (!event.id) {
							toast.error(t("admin:car.error_missing_id"));
							return;
						}

						if (!event.title_sv) {
							const msg = "Missing title";
							toast.error(msg);
							throw new Error(msg);
						}

						handleEventEdit.mutate(
							{
								path: { booking_id: Number(event.id) },
								body: {
									description: event.description_sv,
									start_time: event.start,
									end_time: event.end,
									personal: (event.personal as boolean) ?? true,
									council_id: event.council_id
										? (event.council_id as number)
										: undefined,
									confirmed: (event.confirmed as boolean) ?? false,
								},
							},
							{
								onError: (error) => {
									toast.error(
										t("admin:car.error_edit") +
											(error?.detail ? `: ${error.detail}` : ""),
									);
									// TODO: Show error message to user
								},
							},
						);
					}}
				>
					<div className="py-4">
						<Tabs
							value={tab}
							onValueChange={(value) => {
								setTab(value);
								const params = new URLSearchParams(
									Array.from(searchParams.entries()),
								);
								params.set("tab", value);
								router.replace(`${pathname}?${params.toString()}`);
							}}
							className="flex flex-col w-full items-center"
						>
							<TabsList className="flex justify-center mb-2">
								<TabsTrigger value="calendar">
									{t("admin:car.calendar")}
								</TabsTrigger>
								<TabsTrigger value="list">{t("admin:car.list")}</TabsTrigger>
								<TabsTrigger value="blockings">
									{t("admin:car.blockings")}
								</TabsTrigger>
							</TabsList>
							<TabsContent value="calendar" className="w-full px-5 space-y-5">
								<div className="space-y-0">
									<h2 className="flex items-center text-2xl font-semibold tracking-tight md:text-3xl">
										{t("admin:car.calendar")}
									</h2>
									<p className="text-xs md:text-sm font-medium">
										{t("admin:car.calendar_description")}
									</p>
								</div>

								<Separator />
								<Calendar
									showDescription={true}
									editDescription={true}
									handleOpenDetails={(event) => {
										if (event) {
											router.push(`/car/booking-details?id=${event.id}`);
										}
									}}
									disableEdit={false} // Also disables delete, add and dragging
									enableAllDay={false}
									enableCarProperties={true}
								/>
							</TabsContent>
							<TabsContent value="list" className="w-full px-5 space-y-5">
								<div className="space-y-0">
									<h2 className="flex items-center text-2xl font-semibold tracking-tight md:text-3xl">
										{t("admin:car.list")}
									</h2>
									<p className="text-xs md:text-sm font-medium">
										{t("admin:car.list_description")}
									</p>
								</div>
								<div className="flex">
									<CarForm />
									<Button
										variant={showOnlyCurrent ? "default" : "outline"}
										className="my-auto"
										onClick={() => setShowOnlyCurrent((v) => !v)}
									>
										{showOnlyCurrent
											? t("admin:car.show_all_bookings")
											: t("admin:car.hide_past_bookings")}
									</Button>
								</div>
								<Separator />
								<AdminTable table={table} onRowClick={handleRowClick} />
								<CarEditForm
									open={openEditDialog}
									onClose={() => handleClose()}
									selectedBooking={selectedBooking as CarBookingRead}
								/>
							</TabsContent>
							<TabsContent value="blockings" className="w-full px-5 space-y-5">
								<div className="space-y-0">
									<h2 className="flex items-center text-2xl font-semibold tracking-tight md:text-3xl">
										{t("admin:car.blockings")}
									</h2>
									<p className="text-xs md:text-sm font-medium">
										{t("admin:car.blockings_description")}
									</p>
								</div>
								<BlockForm />
								<Separator />
								<AdminTable table={blockTable} />
							</TabsContent>
						</Tabs>
					</div>
				</EventsProvider>
			)}
			<Toaster position="top-center" richColors />
		</div>
	);
}
