import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parsePhoneNumberWithError } from "libphonenumber-js";
import type { AdminUserRead } from "@/api";

export default function UserDetailsCard({ user }: { user: AdminUserRead }) {
	const { t } = useTranslation("admin");

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
				</div>
			</CardContent>
		</Card>
	);
}
