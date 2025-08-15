import Link from "next/link";
import FLogga from "@/assets/f-logga";
import { useTranslation } from "react-i18next";

export const Footer = () => {
	const { t } = useTranslation("landingpage");
	return (
		<footer id="footer" className="px-10 md:px-0">
			<hr className="w-11/12 mx-auto" />

			<section className="container py-20 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-12 gap-y-8">
				<div className="col-span-full xl:col-span-2 flex font-bold text-xl">
					<Link href="/" className=" ">
						<FLogga className="w-8 h-8 mr-2" />
					</Link>
					<div className="text-primary text-2xl">
						{t("footer.title")} <br />
						<div className="text-sm text-gray-500 font-normal mt-3 select-all">
							F-sektionen <br />
							Mattehuset <br />
							Sölvegatan 18A <br />
							223 62 Lund, Sweden
						</div>
					</div>
				</div>

				<div className="flex flex-col gap-2">
					<h3 className="font-bold text-lg">{t("footer.follow_us")}</h3>
					<div>
						<Link
							href="https://github.com/fsek/"
							className="opacity-60 hover:opacity-100"
						>
							Github
						</Link>
					</div>

					<div>
						<Link
							href="https://www.instagram.com/fsektionen/"
							className="opacity-60 hover:opacity-100"
						>
							Instagram
						</Link>
					</div>

					<div>
						<Link
							href="https://www.linkedin.com/groups/3694965/"
							className="opacity-60 hover:opacity-100"
						>
							Linkedin
						</Link>
					</div>
				</div>

				<div className="flex flex-col gap-2">
					<h3 className="font-bold text-lg">{t("footer.other")}</h3>
					<div>
						<Link href="/nollning" className="opacity-60 hover:opacity-100">
							{t("footer.new-student")}
						</Link>
					</div>

					<div>
						<Link href="/foretag" className="opacity-60 hover:opacity-100">
							{t("footer.companies")}
						</Link>
					</div>

					<div>
						<Link href="/about" className="opacity-60 hover:opacity-100">
							{t("footer.about")}
						</Link>
					</div>
				</div>

				<div className="flex flex-col gap-2">
					<h3 className="font-bold text-lg">{t("footer.contact")}</h3>
					<div>
						<Link href="/contact" className="opacity-60 hover:opacity-100">
							{t("footer.contact_page")}
						</Link>
					</div>

					<div>
						<Link href="/contact#ordf" className="opacity-60 hover:opacity-100">
							{t("footer.contact_ordf")}
						</Link>
					</div>

					<div>
						<Link href="/contact#webmaster" className="opacity-60 hover:opacity-100">
							{t("footer.contact_webmaster")}
						</Link>
					</div>
				</div>

				<div className="flex flex-col gap-2">
					<h3 className="font-bold text-lg">{t("footer.old")}</h3>
					<div>
						<Link
							href="https://old.fsektionen.se"
							className="opacity-60 hover:opacity-100"
						>
							{t("footer.old_link")}
						</Link>
					</div>

					<div>
						<Link
							href="https://old.fsektionen.se/sida/styrdokument"
							className="opacity-60 hover:opacity-100"
						>
							{t("footer.old_styrdokument")}
						</Link>
					</div>
				</div>
			</section>

			<section className="container pb-14 text-center">
				<h3>
					&copy; {new Date().getFullYear()} {t("footer.copyright")}
				</h3>
			</section>
		</footer>
	);
};
