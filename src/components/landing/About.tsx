import { useTranslation } from "react-i18next";
import Link from "next/link";

import Image from "next/image";
import mh from "@/assets/landing/mh.jpg";

export const About = () => {
	const { t } = useTranslation("landingpage");
	return (
		<section id="about" className="container py-15 sm:py-24 px-10 md:px-0">
			<Link href="/about" className="group block" tabIndex={-1}>
				<div className="bg-muted/50 border rounded-lg py-12 transition-shadow group-hover:shadow-lg">
					<div className="px-6 flex flex-col-reverse md:flex-row gap-8 md:gap-12">
						<Image
							src={mh.src}
							height={400}
							width={300}
							alt="Matematikhuset, LTH"
							className="w-[300px] object-contain rounded-lg"
						/>
						<div className="bg-green-0 flex flex-col justify-between">
							<div className="pb-6">
								<h2 className="text-3xl md:text-4xl font-bold">
									<span className="bg-gradient-to-r from-[#fe5f75] to-[#fc9840] bg-no-repeat bg-bottom bg-[length:100%_6px] group-hover:bg-[length:100%_100%] transition-[background-size]">
										{t("about.title")}
									</span>
								</h2>
								<p className="text-xl text-muted-foreground mt-4">
									{t("about.description")}
								</p>
							</div>
						</div>
					</div>
				</div>
			</Link>
		</section>
	);
};
