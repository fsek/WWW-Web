"use client";

import {
	GitHubLogoIcon,
	InstagramLogoIcon,
	LinkedInLogoIcon,
	TwitterLogoIcon,
} from "@radix-ui/react-icons";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export function Footer() {
	return (
		<div className="">
			<App />
		</div>
	);
}

const App = () => {
	const { t } = useTranslation();

	return (
		<footer className="bg-sidebar text-foreground py-8 w-full">
			<div className="flex justify-between">
				<div className="flex">
					<h1 className="text-l  ml-6">F-sektionen </h1>
					<h2 className="text-l font-thin ml-3"> 1961 </h2>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 m-2">
					<div>
						<h3 className="text-l font-bold mb-1">Address</h3>
						<p> Mattehuset</p>
						<p> Sölvegatan 18A</p>
						<p>223 62 Lund, Sweden</p>
					</div>

					{/* <div>
						<h3 className="text-l font-bold mb-1">
							{t("main:footer.contact")} <ArrowLeft />
						</h3>
						<p>
							{" "}
							{t("main:footer.emergencycontact")}
							<ArrowLeft />
						</p>
						<p>
							{" "}
							{t("main:footer.companies")}
							<ArrowLeft />
						</p>
					</div> */}
					<div>
						<h3 className="text-l font-bold mb-1">
							<a href="/contact" className="hover:underline flex items-center">
								{t("main:footer.contact")}
								<ArrowRight className="ml-1 w-4 h-4" />
							</a>
						</h3>
						<p>
							<a
								href="mailto:emergency@fsektionen.se"
								className="hover:underline flex items-center"
							>
								{t("main:footer.emergencycontact")}
								<ArrowRight className="ml-1 w-4 h-4" />
							</a>
						</p>
						<p>
							<span className="flex items-center">
								{t("main:footer.companies")}
								<ArrowRight className="ml-1 w-4 h-4" />
							</span>
						</p>
					</div>

					<div className="">
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
					</div>
				</div>
			</div>
			<div>
				<div className="flex space-x-4 ml-6">
					<a
						href="https://github.com"
						target="_blank"
						rel="noopener noreferrer"
					>
						<GitHubLogoIcon className="text-foreground text-2xl hover:text-gray-300" />
					</a>
					<a
						href="https://twitter.com"
						target="_blank"
						rel="noopener noreferrer"
					>
						<TwitterLogoIcon className="text-foreground text-2xl hover:text-gray-300" />
					</a>
					<a
						href="https://instagram.com"
						target="_blank"
						rel="noopener noreferrer"
					>
						<InstagramLogoIcon className="text-foreground text-2xl hover:text-gray-300" />
					</a>
					<a
						href="https://linkedin.com"
						target="_blank"
						rel="noopener noreferrer"
					>
						<LinkedInLogoIcon className="text-foreground text-2xl hover:text-gray-300" />
					</a>
				</div>
			</div>
		</footer>
	);
};

export default App;
