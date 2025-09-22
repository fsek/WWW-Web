"use client";

import { useQuery } from "@tanstack/react-query";
import { getGuildMeetingOptions } from "@/api/@tanstack/react-query.gen";
import { useTranslation } from "react-i18next";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import TwoColumnLayout from "@/components/TwoColumnLayout";
import Markdown from "react-markdown";
import CustomTitle from "@/components/CustomTitle";

export default function GuildMeetingPage() {
	const { t, i18n } = useTranslation();
	const { data, error, isPending } = useQuery({
		...getGuildMeetingOptions(),
		refetchOnWindowFocus: false,
	});

	if (isPending) return <LoadingErrorCard />;
	if (error) return <LoadingErrorCard error={error} />;
	if (!data) return <div className="p-8">{t("guild_meeting.not_found")}</div>;

	const title = i18n.language === "en" ? data.title_en : data.title_sv;
	const description =
		i18n.language === "en" ? data.description_en : data.description_sv;
	const dateDescription =
		i18n.language === "en"
			? data.date_description_en
			: data.date_description_sv;

	return (
		<div className="max-w-full md:max-w-4xl mx-auto p-8 space-y-6">
			<CustomTitle text={title} size={5} />
			<TwoColumnLayout
				leftColumnContent={
					<>
						<div className="text-lg font-semibold mb-2">
							{t("guild_meeting.important_dates")}
						</div>
						<div className="prose dark:prose-invert text-sm">
							<Markdown>{dateDescription}</Markdown>
						</div>
					</>
				}
				rightColumnContent={
					<div className="prose dark:prose-invert">
						<Markdown>{description}</Markdown>
					</div>
				}
				leftFlex={1}
				rightFlex={5}
			/>
		</div>
	);
}
