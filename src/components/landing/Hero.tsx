import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import TypewriterClient from "typewriter-effect";
import bannerImg from "@/assets/landing/banner.jpg";
import Image from "next/image";

export const Hero = () => {
	const { t } = useTranslation("landingpage");
	return (
		<section className="relative items-center place-items-center py-20 md:py-50 gap-10 w-full flex flex-col">
			{/* Fullwidth background image */}
			<Image
				src={bannerImg.src}
				alt="Cool cat"
				width={1920}
				height={600}
				className="absolute inset-0 w-full h-full object-cover z-0"
			/>
			{/* Dark overlay for text legibility */}
			<div
				className="absolute inset-0 w-full h-full z-10 pointer-events-none"
				style={{
					background:
						"linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.5) 100%)",
				}}
			/>

			<div className="container relative z-20 text-center lg:text-start space-y-6">
				<div className="backdrop-blur-xs bg-white/10 border border-white/20 rounded-2xl p-8 md:p-12 shadow-xl space-y-8 w-full lg:w-6/10">
					<div className="text-5xl md:text-6xl font-bold flex flex-wrap items-start gap-2 flex-col justify-start">
						<div className="inline to-primary/70 from-primary bg-gradient-to-t text-transparent bg-clip-text">
							{t("hero.title_static")}
						</div>
						<TypewriterClient
							options={{
								autoStart: true,
								loop: true,
								delay: 75,
								strings: [
									t("hero.title_dynamic_1"),
									t("hero.title_dynamic_2"),
									t("hero.title_dynamic_3"),
								],
								wrapperClassName: "text-primary justify-start",
								cursorClassName: "text-primary animate-blink",
								cursor: "|",
							}}
						/>
					</div>

					<p className="text-xl text-white md:w-10/12 mx-auto lg:mx-0">
						{t("hero.description")}
					</p>

					<div className="space-y-4 md:space-y-0 md:space-x-4 pt-4">
						<Button className="w-full md:w-auto">
							<Link href="/nollning">{t("hero.new-student")}</Link>
						</Button>
						<Button className="w-full md:w-auto">
							<Link href="/foretag">{t("hero.companies")}</Link>
						</Button>
						<Button variant="outline" className="w-full md:w-auto">
							<Link href="/login?next=/home">{t("hero.login")}</Link>
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
};
