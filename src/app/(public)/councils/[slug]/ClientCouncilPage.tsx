"use client";
import CustomTitle from "@/components/CustomTitle";
import TwoColumnLayout from "@/components/TwoColumnLayout";
import mh from "@/assets/mh.jpg";
import TitleBanner from "@/components/TitleBanner";
import { Trans, useTranslation } from "react-i18next";
import {
	getAllCouncilsOptions,
	getAllUsersWithPostOptions,
} from "@/api/@tanstack/react-query.gen";
import { useQuery, useQueries } from "@tanstack/react-query";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import Link from "next/link";

export default function ClientCouncilPage({ slug }: { slug: string }) {
	const { t, i18n } = useTranslation();

	// fetch all councils
	const { data, error, isLoading } = useQuery({
		...getAllCouncilsOptions(),
		refetchOnWindowFocus: false,
	});

	// normalize helper and derive council & posts early
	const normalize = (str: string) =>
		str
			.toLowerCase()
			.replace(/å/g, "a")
			.replace(/ä/g, "a")
			.replace(/ö/g, "o")
			.replace(/ /g, "-")
			.replace(/é/g, "e");
	const council = (data || []).find(
		(c) => normalize(c.name_sv) === normalize(slug),
	);
	const posts = council?.posts || [];

	// always call useQueries (empty array if no posts)
	const postsUsersQueries = useQueries({
		queries: posts.map((post) => ({
			...getAllUsersWithPostOptions({ path: { post_id: post.id } }),
			refetchOnWindowFocus: false,
		})),
	});

	// early returns
	if (isLoading) return <LoadingErrorCard />;
	if (error || !data) return <LoadingErrorCard error={error || undefined} />;
	if (!council) return <LoadingErrorCard error="Council not found" />;

	return (
		<div className="flex flex-col min-h-screen">
			<TitleBanner
				title={i18n.language === "en" ? council.name_en : council.name_sv}
				imageUrl={mh.src}
				className="relative h-[30vh] bg-cover bg-center"
			/>
			<div className="flex-grow bg-white dark:bg-black p-14 gap-12 ">
				<TwoColumnLayout
					leftColumnContent={
						<>
							<CustomTitle
								text={t("utskott:about_title")}
								className="mt-4"
								size={3}
							/>
							<p className="mt-4">
								{/* {council.description || ( */}
								{/* <Trans i18nKey={`utskott:${slug}.about`}>
									Temporarily using a short info text */}
								{t(`utskott:${slug}.info`, "No text found :/")}
								{/* <Trans i18nKey={`utskott:${slug}.info`}>
									<a
										href="/admin"
										className="underline text-primary hover:text-orange-400"
										target="_blank"
										rel="noreferrer"
									>
										Ingen text kunde hittas :/
									</a>
								</Trans> */}
								{/* )} */}
							</p>
						</>
					}
					rightColumnContent={
						<>
							<CustomTitle
								text={t("utskott:contact_title")}
								className="mt-4"
								size={3}
							/>
							{/* Placeholder for contact info */}
							<p className="mt-4">{t(`utskott:${slug}.contact`)}</p>
							{t(`utskott:${slug}.contact2`, { defaultValue: "" }) && (
								<p className="mt-4">{t(`utskott:${slug}.contact2`)}</p>
							)}
						</>
					}
					className=""
				/>

				<CustomTitle text={t("utskott:poster")} />

				{/* Map out all the posts */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
					{posts.length > 0 ? (
						posts.map((post, idx) => {
							const { isLoading: usersLoading, data: users = [] } =
								postsUsersQueries[idx];
							return (
								<div
									key={post.id}
									className="border rounded-lg p-6 bg-gray-50 dark:bg-gray-900"
								>
									<CustomTitle
										size={2}
										text={i18n.language === "en" ? post.name_en : post.name_sv}
									/>
									<p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
										{i18n.language === "en"
											? post.description_en
											: post.description_sv}
									</p>
									<p className="mt-4 font-semibold">
										{t("utskott:post_contact")}:{" "}
										<Link
											href={`mailto:${post.email}`}
											className="italic text-primary hover:underline"
										>
											{post.email}
										</Link>
									</p>
									<p className="mt-4 font-semibold">
										{t("utskott:vemhar")}:{" "}
										{usersLoading ? (
											<span className="italic text-gray-400">
												{t("loading")}
											</span>
										) : users.length > 0 ? (
											users.map((u) => (
												<span
													key={u.id}
													className="italic text-primary hover:underline mr-2"
												>
													{u.first_name} {u.last_name}
												</span>
											))
										) : (
											<span className="italic text-orange-600">
												{t("utskott:no_user")}
											</span>
										)}
									</p>
								</div>
							);
						})
					) : (
						<p>{t("utskott:no_posts")}</p>
					)}
				</div>
			</div>
		</div>
	);
}
