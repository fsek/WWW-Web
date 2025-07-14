"use client";

// Now using: https://github.com/robskinney/shadcn-ui-fullcalendar-example

import { use, useMemo, useState } from "react";
import type { CarRead, SimpleUserRead } from "@/api/index";
import CarForm from "./CarForm";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createBookingMutation,
	getAllBookingOptions,
	getUserOptions,
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
	removeBookingMutation,
	getAllBookingQueryKey,
	updateBookingMutation,
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

const columnHelper = createColumnHelper<CarRead>();

export default function Car() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const [, setOpen] = useState(false);
	const [, setSubmitEnabled] = useState(true);
	const [openEditDialog, setOpenEditDialog] = useState(false);
	const [selectedBooking, setselectedBooking] = useState<CarRead | null>(null);
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
		columnHelper.accessor("user_first_name", {
			header: t("admin:car.booked_by_first"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("user_last_name", {
			header: t("admin:car.booked_by_last"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("confirmed", {
			header: t("admin:car.confirmed"),
			cell: (info) => {
				const confirmed = info.getValue();
				return confirmed ? t("admin:yes") : t("admin:no");
			},
		}),
		columnHelper.accessor("personal", {
			header: t("admin:car.personal"),
			cell: (info) => {
				const personal = info.getValue();
				return personal ? t("admin:yes") : t("admin:no");
			},
		}),
		columnHelper.accessor(
			(row) => row.council?.name ?? t("admin:car.no_council"),
			{
				id: "council_name",
				header: t("admin:car.council_name"),
				cell: (info) => info.getValue(),
			},
		),
		{
			id: "details",
			header: t("admin:car.details"),
			cell: (row: { row: Row<CarRead> }) => {
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

	const { data, error, isFetching } = useQuery({
		...getAllBookingOptions(),
	});

	const tableData = useMemo(() => {
		if (!data) {
			return [];
		}
		if (showOnlyCurrent) {
			return (data as CarRead[]).filter(
				(booking) => new Date(booking.end_time) >= new Date(),
			);
		}
		return data as CarRead[];
	}, [data, showOnlyCurrent]);

	const handleEventAdd = useMutation({
		...createBookingMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllBookingQueryKey() });
			setOpen(false);
			setSubmitEnabled(true);
		},
	});

	const handleEventDelete = useMutation({
		...removeBookingMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllBookingQueryKey() });
			setOpen(false);
			setSubmitEnabled(true);
		},
	});

	const handleEventEdit = useMutation({
		...updateBookingMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllBookingQueryKey() });
			setOpen(false);
			setSubmitEnabled(true);
		},
	});

	function handleRowClick(row: Row<CarRead>) {
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
		const {
			data: userDetails,
			error: userDetailsError,
			isFetching: userDetailsIsFetching,
		} = useQuery({
			...getUserOptions({
				path: { user_id: user_id ?? -1 },
			}),
			enabled: !!user_id,
			staleTime: 30 * 60 * 1000,
		});
		if (userDetailsError || userDetailsIsFetching || !userDetails) {
			return "Unknown User";
		}
		return `${userDetails.first_name} ${userDetails.last_name}`;
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
								},
							);
						}}
					>
						{t("admin:block.unblock")}
					</Button>
				),
			},
		],
		[t, handleUnblockUser],
	);

	const blockTable = useReactTable({
		columns: blockColumns,
		data: (blockData as CarBlockRead[]) ?? [],
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	});

	if (isFetching) {
		return <p> {t("admin:loading")}</p>;
	}

	if (error) {
		return <p> {t("admin:error")}</p>;
	}

	interface CustomEventData_ extends CustomEventData {
		council_id?: number;
		personal: boolean;
		confirmed: boolean;
		council_name?: string;
	}

	// Transform the fetched data into CalendarEvent type
	const events: CalendarEvent<CustomEventData_>[] =
		(data as CarRead[])?.map((car) => {
			const userName =
				car.user_first_name && car.user_last_name
					? `${car.user_first_name} ${car.user_last_name}`
					: `User ${car.user_id}`;
			const backgroundColor = car.confirmed ? "#66cc00" : "#e6e600"; // Green for confirmed, yellow for unconfirmed
			return {
				id: car.booking_id.toString(),
				title_sv: userName,
				start: car.start_time,
				end: car.end_time,
				all_day: false,
				description_sv: car.description,
				council_name: car.council?.name ?? undefined,
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
								<CarForm toast={toast.error} />
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
								selectedBooking={selectedBooking as CarRead}
								toast={toast.error}
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
							<BlockForm toast={toast.error} />
							<Separator />
							{isBlockFetching ? (
								<p>{t("admin:loading")}</p>
							) : blockError ? (
								<p>{t("admin:error")}</p>
							) : (
								<AdminTable table={blockTable} />
							)}
						</TabsContent>
					</Tabs>
				</div>
			</EventsProvider>
			<Toaster position="top-center" richColors />
		</div>
	);
}
