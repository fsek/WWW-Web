"use client";

import { cn } from "@/lib/utils";
import { months_en, months_sv } from "@/utils/full-calendar-seed";
import type { calendarRef } from "@/utils/full-calendar-seed";
import { Button } from "@/components/ui/button";
import {
	generateDaysInMonth,
	goNext,
	goPrev,
	goToday,
	handleDayChange,
	handleMonthChange,
	handleYearChange,
	setView,
} from "@/utils/full-calendar-context";
import { useState, useEffect } from "react";
import {
	Check,
	ChevronLeft,
	ChevronRight,
	ChevronsUpDown,
	GalleryVertical,
	Table,
	Tally3,
	Calendar,
} from "lucide-react";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import { EventAddForm } from "./full-calendar-add-form";
import {
	Select,
	SelectTrigger,
	SelectItem,
	SelectValue,
	SelectContent,
} from "@/components/ui/select";

interface CalendarNavProps {
	calendarRef: calendarRef;
	start: Date;
	end: Date;
	viewedDate: Date;
	editDescription?: boolean;
	disableEdit?: boolean;
	enableAllDay?: boolean;
	enableTrueEventProperties?: boolean;
	mini?: boolean;
	enableCarProperties?: boolean;
	isMobile?: boolean;
}

export default function CalendarNav({
	calendarRef,
	start,
	end,
	viewedDate,
	editDescription = false,
	disableEdit = false,
	enableAllDay = true,
	enableTrueEventProperties = false,
	mini = false,
	enableCarProperties = false,
	isMobile = false,
}: CalendarNavProps) {
	const { t, i18n } = useTranslation("calendar");

	// Determine initial view based on props
	const getInitialView = () => {
		if (mini && isMobile) return "dayGridDay";
		if (!mini && isMobile) return "timeGridFourDay";
		return mini ? "dayGridWeek" : "timeGridWeek";
	};

	const [currentView, setCurrentView] = useState(getInitialView());

	// Update current view when props change
	useEffect(() => {
		setCurrentView(getInitialView());
	}, [mini, isMobile]);

	const selectedMonth = viewedDate.getMonth() + 1;
	const selectedDay = viewedDate.getDate();
	const selectedYear = viewedDate.getFullYear();

	const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
	const dayOptions = generateDaysInMonth(daysInMonth);

	const [daySelectOpen, setDaySelectOpen] = useState(false);
	const [monthSelectOpen, setMonthSelectOpen] = useState(false);

	// Get appropriate "today/this week/this month" text
	const getTodayButtonText = () => {
		switch (currentView) {
			case "timeGridDay":
				return t("nav.today");
			case "dayGridDay":
				return t("nav.today");
			case "timeGridWeek":
				return t("nav.this_week");
			case "dayGridWeek":
				return t("nav.this_week");
			case "timeGridFourDay":
				return t("nav.today");
			case "dayGridMonth":
				return t("nav.this_month");
			default:
				return t("nav.today");
		}
	};

	return (
		<div className="flex flex-wrap min-w-full justify-center gap-3 px-10 ">
			<div className="flex flex-row space-x-1">
				{/* Navigate to previous date interval */}
				<Button
					variant="ghost"
					className="w-8"
					onClick={() => {
						goPrev(calendarRef);
					}}
				>
					<ChevronLeft className="h-4 w-4" />
				</Button>

				{/* Day Lookup - show for day views and week views */}
				{(currentView === "timeGridDay" ||
					currentView === "dayGridDay" ||
					currentView === "dayGridWeek" ||
					currentView === "timeGridFourDay") && (
					<Popover open={daySelectOpen} onOpenChange={setDaySelectOpen}>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								role="combobox"
								className="w-20 justify-between text-xs font-semibold"
							>
								{selectedDay
									? dayOptions.find((day) => day.value === String(selectedDay))
											?.label
									: t("nav.select_day")}
								<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-[200px] p-0">
							<Command>
								<CommandInput placeholder={t("nav.search_day")} />
								<CommandList>
									<CommandEmpty>{t("nav.day_not_found")}</CommandEmpty>
									<CommandGroup>
										{dayOptions.map((day) => (
											<CommandItem
												key={day.value}
												value={day.value}
												onSelect={(currentValue) => {
													handleDayChange(
														calendarRef,
														viewedDate,
														currentValue,
													);
													setDaySelectOpen(false);
												}}
											>
												<Check
													className={cn(
														"mr-2 h-4 w-4",
														String(selectedDay) === day.value
															? "opacity-100"
															: "opacity-0",
													)}
												/>
												{day.label}
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>
				)}

				{/* Month Lookup */}
				<div>
					<Select
						value={String(selectedMonth)}
						onValueChange={(value) => {
							handleMonthChange(calendarRef, viewedDate, value);
						}}
					>
						<SelectTrigger className="text-xs font-semibold md:text-sm">
							<SelectValue placeholder={t("nav.select_month")} />
						</SelectTrigger>
						<SelectContent>
							{(i18n.language === "en" ? months_en : months_sv).map((month) => (
								<SelectItem key={month.value} value={month.value}>
									{month.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				{/* Year Lookup */}
				<Input
					className="w-[75px] md:w-[85px] text-xs md:text-sm font-semibold"
					type="number"
					value={selectedYear}
					onChange={(value) => handleYearChange(calendarRef, viewedDate, value)}
				/>

				{/* Navigate to next date interval */}
				<Button
					variant="ghost"
					className="w-8"
					onClick={() => {
						goNext(calendarRef);
					}}
				>
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>

			<div className="flex flex-wrap gap-3 justify-center">
				{/* Button to go to current date */}
				<Button
					className="w-fit text-xs md:text-sm"
					variant="outline"
					onClick={() => {
						goToday(calendarRef);
					}}
				>
					{getTodayButtonText()}
				</Button>

				{/* Change view with tabs - only show on non-mini or when not mobile */}
				{!mini && (
					<Tabs defaultValue={isMobile ? "timeGridFourDay" : "timeGridWeek"}>
						<TabsList
							className={`flex ${isMobile ? "w-36 md:w-44" : "w-44 md:w-64"}`}
						>
							<TabsTrigger
								value="timeGridDay"
								onClick={() =>
									setView(calendarRef, "timeGridDay", setCurrentView)
								}
								className={`space-x-1 ${
									currentView === "timeGridDay"
										? "w-1/2"
										: isMobile
											? "w-1/3"
											: "w-1/4"
								}`}
							>
								<GalleryVertical className="h-5 w-5" />
								{currentView === "timeGridDay" && (
									<p className="text-xs md:text-sm">{t("nav.day")}</p>
								)}
							</TabsTrigger>

							{/* Show 4-day view on mobile instead of week view */}
							{isMobile ? (
								<TabsTrigger
									value="timeGridFourDay"
									onClick={() =>
										setView(calendarRef, "timeGridFourDay", setCurrentView)
									}
									className={`space-x-1 ${currentView === "timeGridFourDay" ? "w-1/2" : "w-1/3"}`}
								>
									<Calendar className="h-5 w-5" />
									{currentView === "timeGridFourDay" && (
										<p className="text-xs md:text-sm">4 {t("nav.days")}</p>
									)}
								</TabsTrigger>
							) : (
								<TabsTrigger
									value="timeGridWeek"
									onClick={() =>
										setView(calendarRef, "timeGridWeek", setCurrentView)
									}
									className={`space-x-1 ${currentView === "timeGridWeek" ? "w-1/2" : "w-1/4"}`}
								>
									<Tally3 className="h-5 w-5" />
									{currentView === "timeGridWeek" && (
										<p className="text-xs md:text-sm">{t("nav.week")}</p>
									)}
								</TabsTrigger>
							)}

							<TabsTrigger
								value="dayGridMonth"
								onClick={() =>
									setView(calendarRef, "dayGridMonth", setCurrentView)
								}
								className={`space-x-1 ${currentView === "dayGridMonth" ? "w-1/2" : isMobile ? "w-1/3" : "w-1/4"}`}
							>
								<Table className="h-5 w-5 rotate-90" />
								{currentView === "dayGridMonth" && (
									<p className="text-xs md:text-sm">{t("nav.month")}</p>
								)}
							</TabsTrigger>
						</TabsList>
					</Tabs>
				)}

				{/* GoTo full calendar button */}
				{mini && enableTrueEventProperties && (
					<Button
						className="w-fit text-xs md:text-sm"
						onClick={() => {
							window.location.href = "/calendar";
						}}
					>
						{t("nav.full_calendar")}
					</Button>
				)}

				{/* Add event button  */}
				{!disableEdit && (
					<EventAddForm
						start={start}
						end={end}
						editDescription={editDescription}
						enableAllDay={enableAllDay}
						enableTrueEventProperties={enableTrueEventProperties}
						enableCarProperties={enableCarProperties}
					/>
				)}
			</div>
		</div>
	);
}
