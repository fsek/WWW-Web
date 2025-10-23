"use client";

import FLogga from "@/assets/f-logga";
import {
	GitHubLogoIcon,
	InstagramLogoIcon,
	LinkedInLogoIcon,
} from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

type NavItem = {
	self: string;
	desc: string;
	href?: string;
};

type NavSection = {
	self: string;
} & Record<string, NavItem>;

export function Footer() {
	const { t } = useTranslation();
	const navbarData = t("navbar", { returnObjects: true }) as Record<
		string,
		NavSection
	>;

	const sections = Object.entries(navbarData).filter(
		([, value]) =>
			typeof value === "object" && value !== null && !Array.isArray(value),
	);

	return (
		<footer className="bg-neutral-50 dark:bg-neutral-800 py-8 px-4 w-full text-sm text-neutral-600 dark:text-neutral-400 border-t border-neutral-200 dark:border-neutral-700">
			<div className="max-w-screen-xl mx-auto space-y-8">
				<div className="flex gap-8 flex-col-reverse md:flex-row">
					<div className="md:basis-xs lg:basis-sm flex flex-col gap-4 md:gap-8">
						<FLogga className="size-16" />
						<div>
							F-sektionen <br />
							Mattehuset <br />
							Sölvegatan 18A <br />
							223 62 Lund, Sweden
						</div>
						<div className="flex space-x-4 mt-auto">
							<a
								href="https://github.com/fsek/"
								target="_blank"
								rel="noopener noreferrer"
							>
								<GitHubLogoIcon className="text-foreground size-4" />
							</a>
							<a
								href="https://www.instagram.com/fsektionen/"
								target="_blank"
								rel="noopener noreferrer"
							>
								<InstagramLogoIcon className="text-foreground size-4" />
							</a>
							<a
								href="https://www.linkedin.com/groups/3694965/"
								target="_blank"
								rel="noopener noreferrer"
							>
								<LinkedInLogoIcon className="text-foreground size-4" />
							</a>
						</div>
					</div>
					<div className="columns-[18ch] gap-4 space-y-8 flex-1">
						{sections.map(([sectionKey, section]) => {
							const items = Object.entries(section).filter(
								([key]) => key !== "self",
							) as [string, NavItem][];

							return (
								<div key={sectionKey} className="break-inside-avoid-column">
									<h3 className="font-medium mb-3 text-foreground">
										{section.self}
									</h3>
									<ul className="space-y-2">
										{items.map(([itemKey, item]) => {
											const isExternal =
												typeof item.href === "string" &&
												item.href.startsWith("https://");
											return (
												<li key={itemKey}>
													<Link
														href={item.href || "#"}
														className="hover:text-foreground"
													>
														{item.self}
													</Link>
													{isExternal && (
														<ExternalLink
															className="inline w-3.5 h-3.5 ml-1"
															aria-label="External link"
														/>
													)}
												</li>
											);
										})}
									</ul>
								</div>
							);
						})}

						{/* <div>
						<div className="pb-6">
							<h3 className="text-l font-bold mb-1">
								{t("main:footer.ansvar")}{" "}
							</h3>
							<p> Esther Hagberg</p>
							<p> ordf@fsektionen.se</p>
						</div>

						<div>
							<h3 className="text-l font-bold mb-1">
								{t("main:footer.webansvar")}{" "}
							</h3>
							<p> Benjamin Halasz</p>
							<p> spindelforman@fsektionen.se</p>
						</div>
					</div> */}
					</div>
				</div>

				<div className="text-center">
					&copy; {new Date().getFullYear()} F-sektionen. {t("footer.copyright")}
				</div>
			</div>
		</footer>
	);
}
