"use client";

import { About } from "@/components/landing/About";
import { Contact } from "@/components/landing/Contact";
import { Hero } from "@/components/landing/Hero";
import { Utskott } from "@/components/landing/Utskott";
import { Companies } from "@/components/landing/Companies";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/landing/Navbar";
import { WhatWeDo } from "@/components/landing/WhatWeDo";
import { Nollning } from "@/components/landing/Nollning";
import Sponsors from "@/components/landing/Sponsors";

// using https://github.com/fredygerman/next-js-shadcn-landing-page
export default function Home() {
	return (
		<div className="relative flex min-h-screen flex-col">
			<Navbar />

			<div className="flex-1">
				<div className="flex flex-col items-center">
					<Hero />
					<About />
					<Sponsors />
					<WhatWeDo />
					<Utskott />
					<Nollning />
					<Companies />
					<Contact />
					<Footer />
				</div>
			</div>
		</div>
	);
}
