"use client";

import { About } from "@/components/landing/About";
import { Cta } from "@/components/landing/Cta";
import { FAQ } from "@/components/landing/FAQ";
import { Features } from "@/components/landing/Features";

import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";

import { Services } from "@/components/landing/Services";
import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";

export default function Home() {
	return (
		<div className="relative flex min-h-screen flex-col items-center">
			<Navbar />

			<div className="flex-1">
				<Hero />
				<About />
				<HowItWorks />
				<Features />
				<Services />
				<Cta />
				<FAQ />
			</div>
			<Footer />
		</div>
	);
}
