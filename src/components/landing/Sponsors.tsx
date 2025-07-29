import { useTranslation } from "react-i18next";
import Image from "next/image";

import janestreet from "@/assets/landing/janestreet.png";
import mh from "@/assets/landing/mh.jpg";
import Link from "next/link";
const Sponsors = () => {
	const { t } = useTranslation("landingpage");
	return (
		<section
			className="py-16 relative bg-cover bg-center bg-no-repeat w-full"
			style={{ backgroundImage: `url(${mh.src})` }}
		>
			{/* Overlay for better readability */}
			<div className="absolute inset-0 bg-black/50" />

			<div className="container lg:grid lg:grid-cols-2 place-items-center items-center relative z-10 p-6 lg:px-16 space-y-8 lg:space-y-0">
				<div className="lg:col-start-1">
					<h2 className="text-4xl md:text-5xl font-bold text-white text-center lg:text-left break-words whitespace-normal">
						{t("sponsors")}
					</h2>
				</div>

				<div className="lg:col-start-2 flex justify-center lg:justify-end">
					<div className="flex flex-wrap justify-center gap-6">
						<div className="flex flex-col items-center group w-48 h-40">
							<Link
								href="https://www.janestreet.com/"
								className="transition-transform hover:scale-105 hover:shadow-lg rounded-lg p-4 bg-white/20 backdrop-blur-sm border border-white/40 hover:bg-white/30 hover:border-white/60 w-full h-full flex items-center justify-center"
							>
								<Image
									src={janestreet}
									alt="Jane Street Logo"
									className="w-32 sm:w-40 md:w-40 h-auto object-contain filter brightness-0 invert transition-all duration-300 group-hover:brightness-100 group-hover:invert-0"
								/>
							</Link>
						</div>
						{/* Add more sponsors here as needed */}
					</div>
				</div>
			</div>
		</section>
	);
};

export default Sponsors;
