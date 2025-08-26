"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const SubscribeInfo = () => {
	const { t } = useTranslation();
	const [subscriptionUrl, setSubscriptionUrl] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [lastChecked, setLastChecked] = useState<string | null>(null);
	const [verifySuccess, setVerifySuccess] = useState<boolean | null>(null);

	useEffect(() => {
		setSubscriptionUrl(`${window.location.origin}/calendar/subscribe`);
	}, []);

	const copyToClipboard = async (
		text: string,
		successKey = "calendar:subscribe.copied",
	) => {
		try {
			await navigator.clipboard.writeText(text);
			toast.success(t(successKey) as string);
		} catch (err) {
			toast.error(t("calendar:subscribe.copy_failed") as string);
		}
	};

	const verifyFeed = async () => {
		setIsLoading(true);
		try {
			const res = await fetch("/calendar/subscribe", { method: "GET" });
			if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
			// don't display raw ICS; only confirm it works
			const contentType = res.headers.get("content-type") || "";
			toast.success(
				`${t("calendar:subscribe.feed_ok")} ${contentType ? `(${contentType})` : ""}`,
			);
			setVerifySuccess(true);
		} catch (err) {
			toast.error(
				`${t("calendar:subscribe.feed_error")}: ${
					typeof err === "object" && err && "detail" in err
						? err.detail
						: (err as Error)?.message || String(err)
				}`,
			);
			setVerifySuccess(false);
		} finally {
			setLastChecked(new Date().toLocaleString());
			setIsLoading(false);
		}
	};

	const generateLinks = (url: string) => {
		const webcal_enc = encodeURIComponent(
			url.replace(/^https?:\/\//, "webcal://"),
		);
		return {
			google: `https://calendar.google.com/calendar/r?cid=${webcal_enc}`,
			outlook: `https://outlook.live.com/calendar/0/addcalendar?url=${webcal_enc}`,
			appleWebcal: url.replace(/^https?:\/\//, "webcal://"),
		};
	};

	const links = generateLinks(subscriptionUrl);

	return (
		<section className="p-4 md:p-6 bg-background rounded-md shadow-sm max-w-7xl mx-auto mb-10">
			<header className="mb-4">
				<h2 className="text-lg md:text-2xl font-semibold">
					{t("calendar:subscribe.subscribe_title")}
				</h2>
				<p className="text-sm text-muted-foreground mt-1">
					{t("calendar:subscribe.subscribe_description")}
				</p>
			</header>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Left: subscription and actions */}
				<div>
					<span className="block text-sm font-medium text-foreground mb-2">
						{t("calendar:subscribe.subscription_url")}
					</span>

					<div className="flex flex-col md:flex-row gap-2 flex-wrap">
						<input
							type="text"
							value={subscriptionUrl}
							readOnly
							className="flex-1 rounded border px-3 py-2 bg-muted/5 text-sm"
							aria-label={t("calendar:subscribe.subscription_url") || undefined}
						/>
						<Button onClick={() => copyToClipboard(subscriptionUrl)} size="sm">
							{t("calendar:subscribe.copy")}
						</Button>
						<Button
							onClick={() =>
								copyToClipboard(
									links.appleWebcal,
									"calendar:subscribe.copied_webcal",
								)
							}
							variant="outline"
							size="sm"
						>
							{t("calendar:subscribe.copy_webcal")}
						</Button>
					</div>

					<div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:gap-3 gap-2">
						<Button
							onClick={() => window.open(links.google, "_blank", "noopener")}
							size="sm"
						>
							{t("calendar:subscribe.add_google")}
						</Button>

						<Button
							onClick={() => window.open(links.outlook, "_blank", "noopener")}
							size="sm"
						>
							{t("calendar:subscribe.add_outlook")}
						</Button>
					</div>

					{/* Verify feed */}
					<div className="mt-4 border rounded p-3 bg-muted/5">
						<div className="flex items-center justify-between gap-3">
							<div>
								<p className="text-sm text-foreground">
									{t("calendar:subscribe.verify_help")}
								</p>
								{lastChecked && (
									<p className="text-xs text-muted-foreground mt-1">
										{t("calendar:subscribe.last_checked")}: {lastChecked}
									</p>
								)}
								{verifySuccess !== null && (
									<p
										className={`text-xs mt-1 ${
											verifySuccess ? "text-green-600" : "text-red-600"
										}`}
									>
										{verifySuccess
											? t("calendar:subscribe.feed_ok")
											: t("calendar:subscribe.feed_error")}
									</p>
								)}
							</div>
							<div className="flex items-center gap-2">
								<Button onClick={verifyFeed} disabled={isLoading} size="sm">
									{isLoading
										? t("calendar:subscribe.verifying")
										: t("calendar:subscribe.verify")}
								</Button>
							</div>
						</div>
					</div>
				</div>

				{/* Right: instructions */}
				<div>
					<h3 className="text-sm font-medium mb-2">
						{t("calendar:subscribe.how_to_add")}
					</h3>
					<ul className="text-sm space-y-2 text-foreground">
						<li>• {t("calendar:subscribe.instruction_google")}</li>
						<li>• {t("calendar:subscribe.instruction_outlook")}</li>
						<li>• {t("calendar:subscribe.instruction_apple")}</li>
					</ul>

					<div className="mt-4">
						<h4 className="text-sm font-medium mb-2">
							{t("calendar:subscribe.troubleshoot_title")}
						</h4>
						<ol className="list-decimal ml-5 text-sm text-foreground space-y-2">
							<li>{t("calendar:subscribe.troubleshoot_verify")}</li>
							<li>{t("calendar:subscribe.troubleshoot_click")}</li>
							<li>{t("calendar:subscribe.troubleshoot_contact")}</li>
						</ol>
					</div>
				</div>
			</div>
		</section>
	);
};

export default SubscribeInfo;
