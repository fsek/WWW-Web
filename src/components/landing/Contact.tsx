import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import mh from "@/assets/landing/mh.jpg";

export const Contact = () => {
	const { t } = useTranslation("landingpage");
	return (
		<section
			id="contact"
			className="py-16 my-10 sm:my-15 relative bg-cover bg-center bg-no-repeat w-full"
			style={{ backgroundImage: `url(${mh.src})` }}
		>
			{/* Overlay for better text readability */}
			<div className="absolute inset-0 bg-black/50" />
			<div className="container lg:grid lg:grid-cols-2 place-items-center items-center relative z-10 p-6 lg:px-16 space-y-8 lg:space-y-0">
				<div className="lg:col-start-1">
					<h2 className="text-3xl md:text-4xl font-bold text-white">
						{t("contact.title")}
					</h2>
					<p className="text-white/90 text-xl mt-4 mb-8 lg:mb-0">
						{t("contact.description")}
					</p>
				</div>

				<div className="space-y-4 lg:col-start-2">
					<Link href="/contact" className="text-primary">
						<button
							type="button"
							className="md:mr-4 md:w-fit md:text-xl px-8 py-3 rounded-lg bg-white/20 text-white border border-white/40 backdrop-blur-sm transition hover:bg-white/30 hover:border-white/60 flex items-center gap-2 font-semibold shadow-lg"
						>
							{t("contact.button")}
							<ArrowRight className="inline-block size-fit" />
						</button>
					</Link>
				</div>
			</div>
		</section>
	);
};
