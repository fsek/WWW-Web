"use client";

import {
	GitHubLogoIcon,
	InstagramLogoIcon,
	LinkedInLogoIcon,
	TwitterLogoIcon,
} from "@radix-ui/react-icons";
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
				<div>
					<h1 className="text-l font-bold ml-6">F-sektionen 1961</h1>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<h3 className="text-l font-bold mb-4">Address</h3>
						<p> Mattehuset</p>
						<p> Sölvegatan 18A</p>
						<p>223 62 Lund, Sweden</p>
					</div>

					<div>
						<h3 className="text-l font-bold mb-4">
							{t("main:footer.contact")}{" "}
						</h3>
						<p> {t("main:footer.emergencycontact")}</p>
						<p> {t("main:footer.companies")}</p>
					</div>
					<div className="">
						<div className="pb-6">
							<h3 className="text-l font-bold mb-4">
								{t("main:footer.ansvar")}{" "}
							</h3>
							<p> Esther Hagberg</p>
							<p> ordf@fsektionen.se</p>
						</div>

						<div>
							<h3 className="text-l font-bold mb-4">
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
