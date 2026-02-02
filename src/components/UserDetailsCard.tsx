import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parsePhoneNumberWithError } from "libphonenumber-js";
import type { AdminUserRead } from "@/api";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
import { ChevronDown } from "lucide-react";

export default function UserDetailsCard({
	user,
	full = false,
}: { user: AdminUserRead; full?: boolean }) {
	const { t, i18n } = useTranslation("admin");
	const FOOD_PREFERENCES: Record<string, string> = {
		Vegetarian: "Vegetarian",
		Vegan: "Vegan",
		Pescetarian: "Pescetarian",
		Milk: t("admin:milk_allergy"),
		Gluten: "Gluten",
	};

	return (
		<Card className="mb-4">
			<CardHeader>
				<CardTitle>{t("user-posts.user_info", "User Information")}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					<div className="space-y-1">
						<p className="font-semibold text-sm text-muted-foreground">
							{t("first_name")}:
						</p>
						<p className="text-base">{user.first_name}</p>
					</div>
					<div className="space-y-1">
						<p className="font-semibold text-sm text-muted-foreground">
							{t("last_name")}:
						</p>
						<p className="text-base">{user.last_name}</p>
					</div>
					<div className="space-y-1">
						<p className="font-semibold text-sm text-muted-foreground">
							{t("email")}:
						</p>
						<p className="text-base">{user.email}</p>
					</div>
					<div className="space-y-1">
						<p className="font-semibold text-sm text-muted-foreground">
							{t("stil_id")}:
						</p>
						<p className="text-base">
							{user.stil_id || t("not_provided", "Not provided")}
						</p>
					</div>
					<div className="space-y-1">
						<p className="font-semibold text-sm text-muted-foreground">
							{t("program")}:
						</p>
						<p className="text-base">{user.program}</p>
					</div>
					<div className="space-y-1">
						<p className="font-semibold text-sm text-muted-foreground">
							{t("start_year")}:
						</p>
						<p className="text-base">{user.start_year}</p>
					</div>
					<div className="space-y-1">
						<p className="font-semibold text-sm text-muted-foreground">
							{t("telephone_number")}:
						</p>
						<p className="text-base">
							{user.telephone_number
								? (() => {
										try {
											return parsePhoneNumberWithError(
												user.telephone_number,
											).formatNational();
										} catch {
											return user.telephone_number;
										}
									})()
								: t("not_provided", "Not provided")}
						</p>
					</div>
					<div className="space-y-1">
						<p className="font-semibold text-sm text-muted-foreground">
							{t("account_created")}:
						</p>
						<p className="text-base">
							{user.account_created
								? new Date(user.account_created).toLocaleDateString("sv")
								: ""}
						</p>
					</div>
					<div className="space-y-1">
						<p className="font-semibold text-sm text-muted-foreground">
							{t("is_member")}:
						</p>
						<p className="text-base">
							{user.is_member ? t("yes", "Yes") : t("no", "No")}
						</p>
					</div>
					{full && (
						<>
							<div className="space-y-1">
								<p className="font-semibold text-sm text-muted-foreground">
									{t("member.moose_game_name")}:
								</p>
								<p className="text-base">
									{user.moose_game_name.length === 0
										? t("not_provided")
										: user.moose_game_name}
								</p>
							</div>
							<div className="space-y-1">
								<p className="font-semibold text-sm text-muted-foreground">
									{t("member.moose_game_score")}:
								</p>
								<p className="text-base">{user.moose_game_score}</p>
							</div>
							<div className="space-y-1">
								<p className="font-semibold text-sm text-muted-foreground">
									{t("is_verified")}:
								</p>
								<p className="text-base">
									{user.is_verified ? t("yes") : t("no")}
								</p>
							</div>
						</>
					)}
				</div>
				<hr className="my-2" />
				{full && (
					<>
						<Collapsible className="group/collapsible">
							<CollapsibleTrigger className="w-full flex items-stretch px-1 transition-colors rounded-md hover:bg-accent py-3">
								<ChevronDown className="h-5 w-5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
								<p className="grow px-2 font-semibold text-sm text-muted-foreground text-left">
									{t("posts.self")}
								</p>
							</CollapsibleTrigger>
							<ul className="list-disc">
								{user.posts.map((post) => (
									<CollapsibleContent className="px-8" key={post.id}>
										<li className="text-base">
											{i18n.language === "sv" ? post.name_sv : post.name_en}
										</li>
									</CollapsibleContent>
								))}
							</ul>
						</Collapsible>
						<Collapsible className="group/collapsible py-0">
							<CollapsibleTrigger className="w-full flex items-stretch px-1 transition-colors rounded-md hover:bg-accent py-3">
								<ChevronDown className="h-5 w-5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
								<p className="grow px-2 font-semibold text-sm text-muted-foreground text-left">
									{t("member.food_preference")}
								</p>
							</CollapsibleTrigger>
							<ul className="list-disc">
								{user.standard_food_preferences?.map((food) => (
									<CollapsibleContent className="px-8" key={food}>
										<li className="text-base">{FOOD_PREFERENCES[food]}</li>
									</CollapsibleContent>
								))}
								<CollapsibleContent className="px-8">
									{user.other_food_preferences && (
										<li className="text-base">{user.other_food_preferences}</li>
									)}
								</CollapsibleContent>
							</ul>
						</Collapsible>
					</>
				)}
			</CardContent>
		</Card>
	);
}
