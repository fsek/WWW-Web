"use client";

import Link from "next/link";

import { NavBar } from "../components/NavBar";
import WaveAnimation from "../components/WaveAnimation";
import TwoColumnLayout from "../components/TwoColumnLayout";

import Footer from "@/components/Footer";
import CustomTitle from "@/components/CustomTitle";
import { useTranslation } from "react-i18next";

export default function MainLanding() {
	const { t } = useTranslation();
	return (
		<div className="flex flex-col min-h-screen">
			<NavBar />
			<div className="flex-grow">
				<p>
					{t("main_page.welcome")}
				</p>
				<CustomTitle
					text={t("main_page.title1")}
					className="mt-4"
				/>
				<CustomTitle text={t("main_page.title2")} className="mt-4" />
				<p>👉👈</p>
				<Link href="admin/documents">Goto news</Link>
			</div>
			<div className="">
				<WaveAnimation />
			</div>
			<TwoColumnLayout
				leftColumnContent={
					<>
						<h1 className="text-4xl font-bold">Welcome to the App</h1>
						<p className="mt-4">
							This is a simple two-column layout example using Tailwind CSS.
						</p>
					</>
				}
				rightColumnContent={
					<>
						<h2 className="text-2xl font-semibold">Right Column</h2>
						<p className="mt-4">
							This is the right column content. You can add any content here.
						</p>
					</>
				}
				className="p-14 gap-12"
			/>
			<Footer />
		</div>
	);
}
