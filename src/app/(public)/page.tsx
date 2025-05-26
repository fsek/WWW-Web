import Link from "next/link";

import WaveAnimation from "@/components/WaveAnimation";
import TwoColumnLayout from "@/components/TwoColumnLayout";

import CustomTitle from "@/components/CustomTitle";
import { TitleWithTypewriter } from "@/components/Typewriter";

export default function MainLanding() {
	return (
		<>
			<div className="flex-grow">
				<p>
					Hej! 👋 Du 🫵 ser 👀 denna 📄 sida 📘 för 💡 att ✨ du 🫶 är 🧊 cool
					😎 och 🕸️ spindel 🕷️.
				</p>
				<TitleWithTypewriter
					staticText="Teknisk"
					strings={["fysik", "matematik", "nanovetenskap"]}
				/>
				<CustomTitle text="eller lite" className="mt-4" />
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
		</>
	);
}
