"use client";

import {
	createEventSignupListMutation,
	confirmEventUsersMutation,
	getAllEventSignupsOptions,
	getAllEventSignupsQueryKey,
	getSingleEventOptions,
	unconfirmEventUsersMutation,
	confirmPlacesMutation,
	getEventCsvOptions,
	getSingleEventQueryKey,
} from "@/api/@tanstack/react-query.gen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import AdminTable from "@/widgets/AdminTable";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createColumnHelper,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type Row,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import SignupEditForm from "./SignupEditForm";
import SignupForm from "./SignupForm";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import type { EventSignupRead } from "@/api/types.gen";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";

const columnHelper = createColumnHelper<EventSignupRead>();

export default function AdminEventSignupsPage() {
	const { t, i18n } = useTranslation("admin");
	const searchParams = useSearchParams();
	const queryClient = useQueryClient();

	const eventIdParam = searchParams.get("id");
	const eventId = eventIdParam ? Number(eventIdParam) : Number.NaN;

	const {
		data: signups,
		error: signupsError,
		isLoading: signupsLoading,
	} = useQuery({
		...getAllEventSignupsOptions({ path: { event_id: Number(eventId) } }),
		enabled: Number.isFinite(eventId),
	});

	const {
		data: event,
		error: eventError,
		isLoading: eventLoading,
	} = useQuery({
		...getSingleEventOptions({ path: { eventId: Number(eventId) } }),
		enabled: Number.isFinite(eventId),
	});

	// search state
	const [search, setSearch] = useState<string>("");
	const [showUnconfirmed, setShowUnconfirmed] = useState<boolean>(true);

	// edit form state
	const [editFormOpen, setEditFormOpen] = useState(false);
	const [selectedRow, setSelectedRow] = useState<EventSignupRead | null>(null);

	// create form state
	const [createOpen, setCreateOpen] = useState(false);

	// confirmation dialog state
	const [confirmHandOutOpen, setConfirmHandOutOpen] = useState(false);
	const [confirmConfirmPlacesOpen, setConfirmConfirmPlacesOpen] =
		useState(false);

	// compute filtered rows
	const filteredRows = useMemo(() => {
		if (!signups) return [];
		const lower = (search || "").toLowerCase();
		return signups.filter((r) => {
			const user = r.user;
			if (!user) return false;
			const first = user.first_name ?? "";
			const last = user.last_name ?? "";
			const idStr = String(user.id);
			const group = r.group_name ?? "";
			const priority = r.priority ?? "";
			const email = user.email ?? "";
			const matchesSearch =
				first.toLowerCase().includes(lower) ||
				last.toLowerCase().includes(lower) ||
				`${first} ${last}`.toLowerCase().includes(lower) ||
				idStr.includes(lower) ||
				group.toLowerCase().includes(lower) ||
				priority.toLowerCase().includes(lower) ||
				email.toLowerCase().includes(lower);
			const matchesUnconfirmed = showUnconfirmed || r.confirmed_status;
			return matchesSearch && matchesUnconfirmed;
		});
	}, [signups, search, showUnconfirmed]);

	const handleRowClick = (row: Row<EventSignupRead>) => {
		setSelectedRow(row.original);
		setEditFormOpen(true);
	};

	const createEventSignup = useMutation({
		...createEventSignupListMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getAllEventSignupsQueryKey({ path: { event_id: eventId } }),
			});
			toast.success(t("admin:event_signup.created"));
		},
		onError: (error) => {
			toast.error(t("admin:event_signup.error"));
		},
	});

	const confirmSignup = useMutation({
		...confirmEventUsersMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getAllEventSignupsQueryKey({ path: { event_id: eventId } }),
			});
			toast.success(t("admin:event_signup.success_confirmed"));
		},
		onError: (error) => {
			toast.error(t("admin:event_signup.error_confirm"));
		},
	});

	const unconfirmSignup = useMutation({
		...unconfirmEventUsersMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getAllEventSignupsQueryKey({ path: { event_id: eventId } }),
			});
			toast.success(t("admin:event_signup.unconfirmed"));
		},
		onError: (error) => {
			toast.error(t("admin:event_signup.error_unconfirm"));
		},
	});

	const confirmPlaces = useMutation({
		...confirmPlacesMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getAllEventSignupsQueryKey({ path: { event_id: eventId } }),
			});
			queryClient.invalidateQueries({
				queryKey: getSingleEventQueryKey({ path: { eventId: eventId } }),
			});
			toast.success(t("admin:event_signup.confirm_places_success"));
		},
		onError: (error) => {
			toast.error(t("admin:event_signup.error_confirm_places"));
		},
	});

	function handleHandOutSpots() {
		// Logic to hand out spots
		createEventSignup.mutate({ path: { event_id: eventId } });
		queryClient.invalidateQueries({
			queryKey: getAllEventSignupsQueryKey({ path: { event_id: eventId } }),
		});
	}

	function handleConfirmPlaces() {
		// Logic to confirm places
		confirmPlaces.mutate({
			path: { event_id: eventId },
			body: [selectedRow?.user.id],
		});
	}

	function handleDownloadCsv() {
		// Download CSV for current event using generated options (with fallback)
		// This was created by a bot and it just works. It should be put into its
		// own file but I couldn't get that to work properly
		(async () => {
			if (!Number.isFinite(eventId)) {
				toast.error(t("admin:event_signup.missing_id"));
				return;
			}

			try {
				const opts = getEventCsvOptions({ path: { event_id: eventId } });

				// Try to reuse generated queryFn via queryClient
				let result: unknown;
				// queryClient.fetchQuery v4 expects the object signature and array queryKey.
				const qk = opts.queryKey ?? [];
				const queryKey = Array.isArray(qk) ? qk : [qk];
				result = await queryClient.fetchQuery({
					queryKey: queryKey as any[],
					queryFn: opts.queryFn as any,
				});

				// Normalize to blob + disposition
				let blob: Blob | null = null;
				let disposition = "";
				if (result instanceof Blob) {
					blob = result;
				} else if (typeof result === "string") {
					blob = new Blob([result], { type: "text/csv" });
				} else if (result && typeof result === "object") {
					// generated queryFn or fallback may return an object
					// attempt common shapes
					if (
						typeof result === "object" &&
						result !== null &&
						"blob" in result &&
						result.blob instanceof Blob
					) {
						blob = (result as { blob: Blob }).blob;
						disposition =
							(result as { disposition?: string }).disposition || "";
					} else if (
						typeof result === "object" &&
						result !== null &&
						"data" in result &&
						typeof (result as { data?: string }).data === "string"
					) {
						blob = new Blob([(result as { data: string }).data], {
							type: "text/csv",
						});
					}
				}

				if (!blob) throw new Error("No CSV data received");

				// extract filename from disposition if present
				let filename = "event.csv";
				const match =
					disposition.match(/filename\*?=(?:UTF-8'')?["']?([^;"']+)["']?/i) ||
					"";
				if (match && (match as any)[1]) {
					filename = decodeURIComponent((match as any)[1]);
				}

				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = filename;
				document.body.appendChild(a);
				a.click();
				a.remove();
				URL.revokeObjectURL(url);

				toast.success(t("admin:event_signup.download_csv_success"));
			} catch (err) {
				toast.error(t("admin:event_signup.download_csv_error"));
			}
		})();
	}

	const columns = [
		columnHelper.accessor((row) => row.created_at, {
			id: "created_at",
			header: t("admin:event_signup.created_at"),
			cell: (info) => {
				const date = new Date(info.getValue());
				return date.toLocaleString();
			},
			size: 160,
		}),
		columnHelper.accessor((row) => row.user.first_name, {
			id: "first_name",
			header: t("admin:first_name"),
			cell: (info) => info.getValue() ?? "-",
			size: 80,
		}),
		columnHelper.accessor((row) => row.user.last_name, {
			id: "last_name",
			header: t("admin:last_name"),
			cell: (info) => info.getValue() ?? "-",
			size: 140,
		}),
		columnHelper.accessor((row) => row.user.email, {
			id: "email",
			header: t("admin:email"),
			cell: (info) => info.getValue(),
			size: 140,
		}),
		columnHelper.accessor((row) => row.priority, {
			id: "priority",
			header: t("event_signup.priority"),
			cell: (info) => {
				const v = info.getValue();
				return v ? v.charAt(0).toUpperCase() + v.slice(1) : "-";
			},
			size: 110,
		}),
		columnHelper.accessor((row) => row.group_name ?? "", {
			id: "group_name",
			header: t("event_signup.group_name"),
			cell: (info) => info.getValue() || "-",
			size: 100,
		}),
		columnHelper.accessor((row) => row.confirmed_status, {
			id: "status",
			header: t("event_signup.status"),
			cell: (info) =>
				info.getValue() ? (
					<Badge variant="default">
						{t("admin:event_signup.will_have_spot")}
					</Badge>
				) : (
					<Badge variant="secondary">
						{t("admin:event_signup.will_not_have_spot")}
					</Badge>
				),
			size: 120,
		}),
		{
			id: "actions",
			header: t("admin:actions"),
			cell: ({ row }: { row: Row<EventSignupRead> }) => (
				<Button
					variant={row.original.confirmed_status ? "destructive" : "default"}
					disabled={event?.event_users_confirmed}
					size="sm"
					onClick={(e) => {
						e.stopPropagation();
						const userId = row.original.user.id;
						if (row.original.confirmed_status) {
							unconfirmSignup.mutate({
								path: { event_id: eventId },
								body: [userId],
							});
						} else {
							confirmSignup.mutate({
								path: { event_id: eventId },
								body: [userId],
							});
						}
					}}
				>
					{row.original.confirmed_status
						? t("admin:event_signup.take_away_spot")
						: t("admin:event_signup.give_spot")}
				</Button>
			),
		},
	];

	const [sorting, setSorting] = useState<SortingState>([
		{ id: "created_at", desc: false },
	]);

	const table = useReactTable({
		columns,
		data: filteredRows,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: setSorting,
		state: { sorting },
	});

	useEffect(() => {
		// Invalidate on eventId change to keep data fresh when switching id
		if (Number.isFinite(eventId)) {
			queryClient.invalidateQueries({
				queryKey: getAllEventSignupsOptions({
					path: { event_id: Number(eventId) },
				}).queryKey,
			});
		}
	}, [eventId, queryClient]);

	if (!Number.isFinite(eventId)) {
		return (
			<div className="px-8">
				<h3 className="text-3xl py-3 underline underline-offset-4 text-primary">
					{t("admin:event_signup.title")}
				</h3>
				<p className="text-red-600">{t("admin:event_signup.missing_id")}</p>
			</div>
		);
	}

	if (signupsLoading) {
		return <LoadingErrorCard />;
	}

	if (signupsError) {
		return <LoadingErrorCard error={signupsError as any} />;
	}

	// Disable handout until signup_end has passed (or while loading/no date)
	// or if event users have been given confirmed statuses
	const disableHandOut =
		eventLoading ||
		!event?.signup_end ||
		new Date(event.signup_end) > new Date() ||
		event?.event_users_confirmed;

	return (
		<div className="px-8 space-x-4">
			<div className="space-y-0">
				<h3 className="text-3xl py-3 underline underline-offset-4 text-primary">
					{t("admin:event_signup.title")}
					{" - "}
					{i18n.language === "en" ? event?.title_en : event?.title_sv}
				</h3>
				<p className="text-xs md:text-sm font-medium">
					{t("admin:event_signup.description")}
				</p>

				<div className="mt-4 mb-2 grid grid-cols-1 gap-2 items-center md:grid-cols-2 xl:grid-cols-3">
					<Input
						placeholder={t("admin:event_signup.search_placeholder")}
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						autoFocus
					/>
					<label
						htmlFor="show-unconfirmed"
						className="flex items-center space-x-3 rounded-md border p-3 hover:bg-accent/50 transition-colors cursor-pointer ml-4"
					>
						<Checkbox
							id="show-unconfirmed"
							checked={showUnconfirmed}
							onCheckedChange={(checked) => {
								setShowUnconfirmed(checked as boolean);
							}}
							className="h-5 w-5"
						/>
						<span className="text-sm font-medium">
							{t("admin:event_signup.show_unconfirmed")}
						</span>
					</label>
					<Button variant="default" onClick={() => setCreateOpen(true)}>
						{t("admin:event_signup.add")}
					</Button>
					<AlertDialog
						open={confirmHandOutOpen}
						onOpenChange={(open) => {
							if (disableHandOut) return; // prevent opening when disabled
							setConfirmHandOutOpen(open);
						}}
					>
						<div className="flex items-center gap-2">
							<AlertDialogTrigger asChild>
								<Button variant="default" disabled={disableHandOut}>
									{t("admin:event_signup.hand_out_spots")}
								</Button>
							</AlertDialogTrigger>
							{disableHandOut && (
								<span className="text-xs text-muted-foreground">
									{t("admin:event_signup.hand_out_spots_closed")}
								</span>
							)}
						</div>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>
									{t("admin:event_signup.hand_out_spots_confirm_title")}
								</AlertDialogTitle>
								<AlertDialogDescription>
									{t("admin:event_signup.hand_out_spots_confirm_desc")}
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>{t("admin:cancel")}</AlertDialogCancel>
								<AlertDialogAction
									onClick={() => {
										handleHandOutSpots();
										setConfirmHandOutOpen(false);
									}}
								>
									{t("admin:event_signup.hand_out_spots")}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
					<div className="flex items-center gap-2">
						<ConfirmDeleteDialog
							open={confirmConfirmPlacesOpen}
							onOpenChange={setConfirmConfirmPlacesOpen}
							onConfirm={handleConfirmPlaces}
							disabled={disableHandOut}
							triggerText={t("admin:event_signup.confirm_places")}
							title={t("admin:event_signup.confirm_places_title")}
							description={t("admin:event_signup.confirm_places_desc")}
							confirmText={t("admin:event_signup.confirm")}
							confirmByTyping={true}
							confirmByTypingText={t("admin:event_signup.confirm_places_input")}
							confirmByTypingKey={t(
								"admin:event_signup.confirm_places_input_key",
							)}
							cancelText={t("admin:cancel")}
							showIcon={false}
						/>
						{event?.event_users_confirmed && (
							<span className="text-xs text-muted-foreground">
								{t("admin:event_signup.event_users_confirmed_description")}
							</span>
						)}
					</div>
					<Button variant="outline" onClick={handleDownloadCsv}>
						{t("admin:event_signup.download_csv")}
					</Button>
				</div>

				<Separator className="mb-4" />
			</div>

			<AdminTable table={table} onRowClick={handleRowClick} />

			{selectedRow && (
				<SignupEditForm
					open={editFormOpen}
					onClose={() => {
						setEditFormOpen(false);
						setSelectedRow(null);
					}}
					eventId={Number(eventId)}
					selectedSignup={selectedRow}
					event_users_confirmed={event?.event_users_confirmed}
				/>
			)}

			<SignupForm
				open={createOpen}
				onOpenChange={setCreateOpen}
				eventId={Number(eventId)}
				event_users_confirmed={event?.event_users_confirmed}
			/>
		</div>
	);
}
