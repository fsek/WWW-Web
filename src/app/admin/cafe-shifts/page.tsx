"use client";

import { useState, useEffect } from "react";
import CafeShiftsForm from "./CafeShiftsForm";
import CafeShiftsEditForm from "./CafeShiftsEditForm";
import {
	createShiftMutation,
	deleteShiftMutation,
	updateShiftMutation,
	viewAllShiftsOptions,
	viewAllShiftsQueryKey,
} from "@/api/@tanstack/react-query.gen";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createColumnHelper, type Row } from "@tanstack/react-table";
import AdminTable from "@/widgets/AdminTable";
import formatTime from "@/help_functions/timeFormater";
import type { CafeShiftRead } from "@/api";
import useCreateTable from "@/widgets/useCreateTable";
import { useTranslation } from "react-i18next";
import type {
	CalendarEvent,
	CustomEventData,
} from "@/utils/full-calendar-seed";
import { EventsProvider } from "@/utils/full-calendar-event-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import Calendar from "@/components/full-calendar";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import MultiShiftsAddForm from "./MultiShiftAddForm";
import { toast } from "sonner";

// Column setup
const columnHelper = createColumnHelper<CafeShiftRead>();
const columns = [
	columnHelper.accessor("id", {
		header: "ID",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("user", {
		header: "Användare",
		cell: (info) => {
			const user = info.getValue();
			return user ? `${user.first_name} ${user.last_name}` : "Ej tilldelad";
		},
	}),
	columnHelper.accessor("starts_at", {
		header: "Starttid",
		cell: (info) => formatTime(info.getValue()),
	}),
	columnHelper.accessor("ends_at", {
		header: "Sluttid",
		cell: (info) => formatTime(info.getValue()),
	}),
];

export default function CafeShifts() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const initialTab = searchParams.get("tab") || "calendar";
	const [tab, setTab] = useState(initialTab);
	const { t } = useTranslation();
	const queryClient = useQueryClient();

	const { data, error, isFetching } = useQuery({
		...viewAllShiftsOptions(),
	});

	const [openEditDialog, setOpenEditDialog] = useState(false);
	const [selectedShift, setSelectedShift] = useState<CafeShiftRead | null>(
		null,
	);

	const table = useCreateTable({ data: data ?? [], columns });

	// set default sort on starts_at (recent -> old) once data arrives
	useEffect(() => {
		if (data && table.getState().sorting.length === 0) {
			table.setSorting([{ id: "starts_at", desc: true }]);
		}
	}, [data, table]);

	function handleRowClick(row: Row<CafeShiftRead>) {
		setSelectedShift(row.original);
		setOpenEditDialog(true);
	}

	function handleClose() {
		setOpenEditDialog(false);
		setSelectedShift(null);
	}

	// Mutations for adding, deleting, and editing shifts
	const addShift = useMutation({
		...createShiftMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: viewAllShiftsQueryKey() });
			toast.success(t("admin:cafe_shifts.success_add"));
		},
		onError: (err) => {
			toast.error(t("admin:cafe_shifts.error_add"));
		},
		throwOnError: false,
	});

	const deleteShift = useMutation({
		...deleteShiftMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: viewAllShiftsQueryKey() });
			toast.success(t("admin:cafe_shifts.success_delete"));
		},
		onError: (err) => {
			toast.error(t("admin:cafe_shifts.error_delete"));
		},
		throwOnError: false,
	});

	const editShift = useMutation({
		...updateShiftMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: viewAllShiftsQueryKey() });
			toast.success(t("admin:cafe_shifts.success_edit"));
		},
		onError: (err) => {
			toast.error(t("admin:cafe_shifts.error_edit"));
		},
		throwOnError: false,
	});

	if (isFetching) {
		return <LoadingErrorCard />;
	}

	if (error) {
		return <LoadingErrorCard error={error} />;
	}

	interface CustomShiftData extends CustomEventData {
		user_id: number | null;
		user_name: string | null;
	}

	// Map fetched shifts to calendar events
	const events: CalendarEvent<CustomShiftData>[] =
		(data as CafeShiftRead[])?.map((shift) => ({
			id: shift.id.toString(),
			title_sv: shift.user
				? `${shift.user.first_name} ${shift.user.last_name}`
				: "Ledigt pass",
			title_en: shift.user
				? `${shift.user.first_name} ${shift.user.last_name}`
				: "Available shift",
			start: shift.starts_at,
			end: shift.ends_at,
			user_id: shift.user ? shift.user.id : null,
			user_name: shift.user
				? `${shift.user.first_name} ${shift.user.last_name}`
				: null,
			description_sv: shift.user // Dummy descriptions, these are never shown
				? `Cafépass för ${shift.user.first_name}`
				: "Ledigt cafépass",
			description_en: shift.user
				? `Cafe shift for ${shift.user.first_name}`
				: "Available cafe shift",
		})) ?? [];

	return (
		<div className="px-8 space-x-4">
			<h3 className="text-3xl py-3 font-bold text-primary">
				{t("admin:cafe_shifts.title")}
			</h3>
			<p className="py-3">{t("admin:cafe_shifts.description")}</p>
			<EventsProvider
				initialCalendarEvents={events}
				eventColor="#f6ad55"
				handleAdd={(event) =>
					addShift.mutate(
						{
							body: {
								starts_at: event.start,
								ends_at: event.end,
							},
						},
						{
							onError: (err) => toast.error(t("admin:cafe_shifts.error_add")),
						},
					)
				}
				handleDelete={(id) =>
					deleteShift.mutate(
						{ path: { shift_id: Number(id) } },
						{
							onError: (err) =>
								toast.error(t("admin:cafe_shifts.error_delete")),
						},
					)
				}
				handleEdit={(event) => {
					if (!event.id) {
						toast.error(t("admin:cafe_shifts.error_missing_id"));
						return;
					}
					editShift.mutate(
						{
							path: { shift_id: Number(event.id) },
							body: {
								starts_at: event.start,
								ends_at: event.end,
								user_id:
									(event as CalendarEvent<CustomShiftData>).user_id || null,
							},
						},
						{
							onError: (err) => toast.error(t("admin:cafe_shifts.error_edit")),
						},
					);
				}}
			>
				<MultiShiftsAddForm />
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
								{t("admin:cafe_shifts.calendar")}
							</TabsTrigger>
							<TabsTrigger value="list">
								{t("admin:cafe_shifts.list")}
							</TabsTrigger>
						</TabsList>
						<TabsContent value="calendar" className="w-full px-5 space-y-5">
							<div className="space-y-0">
								<h2 className="flex items-center text-2xl font-semibold tracking-tight md:text-3xl">
									{t("admin:cafe_shifts.calendar")}
								</h2>
								<p className="text-xs md:text-sm font-medium">
									{t("admin:cafe_shifts.calendar_description")}
								</p>
							</div>

							<Separator />
							<Calendar
								showDescription={false}
								editDescription={false}
								handleOpenDetails={(shift) => {
									if (shift) {
										router.push(`/cafe-shifts/${shift.id}`);
									}
								}}
								disableEdit={false}
								enableAllDay={false}
								enableCafeShiftProperties={true}
							/>
						</TabsContent>
						<TabsContent value="list" className="w-full px-5 space-y-5">
							<div className="space-y-0">
								<h2 className="flex items-center text-2xl font-semibold tracking-tight md:text-3xl">
									{t("admin:cafe_shifts.list")}
								</h2>
								<p className="text-xs md:text-sm font-medium">
									{t("admin:cafe_shifts.list_description")}
								</p>
							</div>
							<CafeShiftsForm />
							<Separator />
							<AdminTable table={table} onRowClick={handleRowClick} />
							<CafeShiftsEditForm
								open={openEditDialog}
								onClose={() => handleClose()}
								selectedShift={selectedShift as CafeShiftRead}
							/>
						</TabsContent>
					</Tabs>
				</div>
			</EventsProvider>
		</div>
	);
}
