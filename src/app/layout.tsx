import QueryClientProvider from "@/components/QueryClientProvider";
import "./globals.css";
import { client } from "@/api";
import { NavigationMenuDemo } from "../components/NavBar";
import initTranslations, { type Locale, type Namespace } from "./i18n";
import TranslationsProvider from "@/components/TranslationsProvider";

const locale = "sv" satisfies Locale;
const i18nNamespaces = ["main"] satisfies Namespace[];

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	client.setConfig({ baseUrl: "http://host.docker.internal:8000" });

	// FIXME: TEMPORARY
	const { resources } = await initTranslations(locale, i18nNamespaces);

	return (
		<TranslationsProvider
			namespaces={i18nNamespaces}
			locale={locale}
			resources={resources}
		>
			<QueryClientProvider>
				<html lang="en">
					<head>
						<title>F-sektionen WWW-Web</title>
						<link rel="preconnect" href="https://fonts.googleapis.com" />
						<link rel="preconnect" href="https://fonts.gstatic.com" />
						<link
							href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
							rel="stylesheet"
						/>
					</head>
					<body>
						<div id="root">{children}</div>
					</body>
				</html>
			</QueryClientProvider>
		</TranslationsProvider>
	);
}
