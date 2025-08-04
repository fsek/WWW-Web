"use client";

import TitleBanner from "@/components/TitleBanner";
import CustomTitle from "@/components/CustomTitle";
import mh from "@/assets/mh.jpg";
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import EmergencyCard from './EmergencyCard';
import ContactCard from './ContactCard';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";

export default function ContactPage() {
	const { t } = useTranslation("contact");
	const router = useRouter();

	const [highlightedId, setHighlightedId] = useState<string | null>(null);

	useEffect(() => {
		const handleHashChange = () => {
			const hash = window.location.hash.replace("#", "");
			if (hash) {
				setHighlightedId(hash);
				// Remove highlight after 2s
				setTimeout(() => setHighlightedId(null), 2000);
			}
		};
		handleHashChange(); // run on mount
		window.addEventListener("hashchange", handleHashChange);
		return () => window.removeEventListener("hashchange", handleHashChange);
	}, []);

	return (
		<div className="flex flex-col min-h-screen">
			<TitleBanner
				title={t("title")}
				imageUrl={mh.src}
				className="relative h-[30vh] bg-cover bg-center"
			/>

			<div className="flex flex-col md:mx-[5%] lg:mx-[15%]">
				<div className="grid grid-cols-1 gap-4 px-4 md:px-12 pb-4 pt-10 w-full mx-auto">
					<EmergencyCard />
					<Card className="p-6 bg-card w-full flex flex-row">
						<div className="text-xl font-semibold">{t("note_title")}</div>
						{t("note_text")}
					</Card>
				</div>

				<div className="flex-grow">
					<div className="flex flex-col p-14 gap-4">
						<CustomTitle text={t("board.self")} size={4} id="board" className="scroll-mt-20" />
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							<ContactCard
								id="ordf"
								title={t("board.ordf")}
								fullName="Ester Hagberg Kuylenstierna"
								email="ordf@fsektionen.se"
								highlight={highlightedId === "ordf"}
							/>
							<ContactCard
								id="vice"
								title={t("board.vice")}
								fullName="Lovisa Werselius"
								email="viceordf@fsektionen.se"
								highlight={highlightedId === "vice"}
							/>
							<ContactCard
								id="preses"
								title={t("board.preses")}
								fullName="Malte Callsen"
								email="preses@fsektionen.se"
								highlight={highlightedId === "preses"}
							/>
							<ContactCard
								id="secretary"
								title={t("board.secretary")}
								fullName="Hugo Klaesson"
								email="sekreterare@fsektionen.se"
								highlight={highlightedId === "secretary"}
							/>
							<ContactCard
								id="board_members"
								title={t("board.board_members")}
								fullName="Rebecka Eldh, Sixten Georgsson, Samuel Eriksson, Elina Kazemi"
								email="styrelseledamoter@fsektionen.se"
								highlight={highlightedId === "board_members"}
							/>
						</div>

						<CustomTitle text={t("other.self")} size={4} id="other" className="scroll-mt-20" />
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							<ContactCard
								id="facilities"
								title={t("other.facilities")}
								fullName="Alva Rosberg"
								email="prylm@fsektionen.se"
								highlight={highlightedId === "facilities"}
							/>
							<ContactCard
								id="car"
								title={t("other.car")}
								fullName="Vic Kowalik"
								email="bil@fsektionen.se"
								highlight={highlightedId === "car"}
							/>
							<ContactCard
								id="festivities"
								title={t("other.festivities")}
								fullName="Ebba Wahlberg"
								email="sex@fsektionen.se"
								highlight={highlightedId === "festivities"}
							/>
							<ContactCard
								id="truth"
								title={t("other.truth")}
								fullName="Albin Kårlin"
								email="sanningsminister@fsektionen.se"
								highlight={highlightedId === "truth"}
							/>
							<ContactCard
								id="corp"
								title={t("other.corp")}
								fullName="David Mörtberg"
								email="naringslivsansvarig@fsektionen.se"
								highlight={highlightedId === "corp"}
							/>
							<ContactCard
								id="overfos"
								title={t("other.nollning")}
								fullName="Överfös Victor"
								email="overfos@fsektionen.se"
								highlight={highlightedId === "overfos"}
							/>
							<ContactCard
								id="cafe"
								title={t("other.cafe")}
								fullName="Ellen Boström"
								email="cafe@fsektionen.se"
								highlight={highlightedId === "cafe"}
							/>
							<ContactCard
								id="conscience"
								title={t("other.conscience")}
								fullName="Alicia Ahlgren"
								email="samvetsmastare@fsektionen.se"
								highlight={highlightedId === "conscience"}
							/>
							<ContactCard
								id="culture"
								title={t("other.culture")}
								fullName="Manne Mönster"
								email="km@fsektionen.se"
								highlight={highlightedId === "culture"}
							/>
							<ContactCard
								id="education"
								title={t("other.education")}
								fullName="Mattis Mattsson"
								email="um@fsektionen.se"
								highlight={highlightedId === "education"}
							/>
							<ContactCard
								id="treasurer"
								title={t("other.treasurer")}
								fullName="Anton Sundström"
								email="kass@fsektionen.se"
								highlight={highlightedId === "treasurer"}
							/>
						</div>

						<CustomTitle text={t("corp.self")} size={4} id="foretag" className="scroll-mt-20" />
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							<ContactCard
								id="naringslivsansvarig"
								title={t("corp.naringslivsansvarig")}
								fullName="David Mörtberg"
								email="naringslivsansvarig@fsektionen.se"
								highlight={highlightedId === "naringslivsansvarig"}
							/>
							<ContactCard
								id="naringslivsutskottet"
								title={t("corp.naringslivsutskottet")}
								fullName={t("corp.naringslivsutskottet")}
								email="naringslivsutskottet@fsektionen.se"
								highlight={highlightedId === "naringslivsutskottet"}
							/>
							<ContactCard
								id="farad"
								title={t("corp.farad")}
								fullName="Jacob Stelling"
								email="farad@fsektionen.se"
								highlight={highlightedId === "farad"}
							/>
						</div>

						<CustomTitle text={t("web.self")} size={4} id="web" className="scroll-mt-20" />
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							<ContactCard
								id="spindelforman"
								title={t("web.spider")}
								fullName="Manfred Malmros"
								email="spindelforman@fsektionen.se"
								highlight={highlightedId === "spindelforman"}
							/>
							<ContactCard
								id="webmaster"
								title={t("web.webmaster")}
								fullName={t("web.webmaster_full_name")}
								email="spindelman@fsektionen.se"
								highlight={highlightedId === "webmaster"}
							/>
						</div>
					</div>
				</div>
			</div>
		</div >
	);
}
