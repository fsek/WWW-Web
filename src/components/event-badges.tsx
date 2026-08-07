import type { EventRead } from "@/api";
import { useTranslation } from "react-i18next";
import { Badge } from "./ui/badge";
import {
	Beer,
	Calendar,
	CreditCard,
	Goal,
	Lock,
	Repeat,
	ShieldUser,
	Star,
	Users,
	Utensils,
} from "lucide-react";

interface EventBadgesProps {
	event: EventRead;
	containerClassName?: string;
	badgeClassName?: string;
	iconClassName?: string;
	showMissingTexts?: boolean;
}

export function EventFeatureBadges({
	event,
	containerClassName = "",
	badgeClassName = "",
	iconClassName = "",
	showMissingTexts = true,
}: EventBadgesProps) {
	const { t } = useTranslation();

	if (
		!(
			event.all_day ||
			event.recurring ||
			event.is_nollning_event ||
			event.allow_other_mentors ||
			event.food ||
			event.drink_package ||
			event.closed ||
			event.price !== 0
		)
	) {
		return showMissingTexts ? (
			<p className="text-muted-foreground text-sm">
				{t("admin:events.no_features")}
			</p>
		) : (
			<></>
		);
	}

	let mentorGroupTypeBadge = undefined;

	if (event.is_nollning_event) {
		const isMentor = event.mentor_group_types.includes("Mentor");
		const isMission = event.mentor_group_types.includes("Mission");

		if (isMentor && !isMission) {
			mentorGroupTypeBadge = (
				<Badge variant="secondary" className={badgeClassName}>
					<Users className={iconClassName} />
					{t("admin:events.nollning_event_mentor")}
				</Badge>
			);
		} else if (isMission && !isMentor) {
			mentorGroupTypeBadge = (
				<Badge variant="secondary" className={badgeClassName}>
					<Goal className={iconClassName} />
					{t("admin:events.nollning_event_mission")}
				</Badge>
			);
		}
	}

	return (
		<div className={containerClassName}>
			{event.is_nollning_event && (
				<Badge variant="default" className={badgeClassName}>
					<Star className={iconClassName} />
					{t("admin:events.is_nollning_event")}
				</Badge>
			)}
			{mentorGroupTypeBadge}
			{mentorGroupTypeBadge && event.allow_other_mentors && (
				<Badge variant="secondary" className={badgeClassName}>
					<ShieldUser className={iconClassName} />
					{t("admin:events.allow_other_mentors")}
				</Badge>
			)}
			{event.all_day && (
				<Badge variant="secondary" className={badgeClassName}>
					<Calendar className={iconClassName} />
					{t("admin:events.all_day")}
				</Badge>
			)}
			{event.recurring && (
				<Badge variant="secondary" className={badgeClassName}>
					<Repeat className={iconClassName} />
					{t("admin:events.recurring")}
				</Badge>
			)}
			{event.food && (
				<Badge variant="outline" className={badgeClassName}>
					<Utensils className={iconClassName} />
					{t("admin:events.food")}
				</Badge>
			)}
			{event.drink_package && (
				<Badge variant="outline" className={badgeClassName}>
					<Beer className={iconClassName} />
					{t("admin:events.drink_package")}
				</Badge>
			)}
			{event.price !== 0 && (
				<Badge variant="outline" className={badgeClassName}>
					<CreditCard className={iconClassName} />
					{t("admin:events.costs_money")}
				</Badge>
			)}
			{event.closed && (
				<Badge variant="destructive" className={badgeClassName}>
					<Lock className={iconClassName} />
					{t("admin:events.closed")}
				</Badge>
			)}
		</div>
	);
}

export function EventSignupBadges({
	event,
	containerClassName = "",
	badgeClassName = "",
	showMissingTexts = true,
}: EventBadgesProps) {
	const { t } = useTranslation();

	if (!event.can_signup) {
		return showMissingTexts ? (
			<p className="text-sm text-muted-foreground">
				{t("admin:events.signup_not_used")}
			</p>
		) : (
			<></>
		);
	}

	if (event.signup_start === null || event.signup_end === null) {
		return showMissingTexts ? (
			<p className="text-sm text-muted-foreground">
				{t("admin:events.signup_not_available")}
			</p>
		) : (
			<></>
		);
	}

	return (
		<div className={containerClassName}>
			<Badge variant="default" className={badgeClassName}>
				{t("admin:events.can_signup")}
			</Badge>
			<Badge variant="secondary" className={badgeClassName}>
				{t(`admin:events.lottery_${event.lottery ? "enabled" : "disabled"}`)}
			</Badge>
		</div>
	);
}
