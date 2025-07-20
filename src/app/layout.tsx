import QueryClientProvider from "@/components/QueryClientProvider";
import "./globals.css";
import { client } from "@/api";
import initTranslations, { type Locale, type Namespace } from "./i18n";
import TranslationsProvider from "@/components/TranslationsProvider";
import { ThemeProvider } from "next-themes";
import { headers } from "next/headers";

const i18nNamespaces = [
	"main",
	"namnden",
	"admin",
	"calendar",
	"utskott",
	"landingpage",
] satisfies Namespace[];

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	client.setConfig({ baseUrl: "http://host.docker.internal:8000" });

	const headersList = await headers();
	const initialLanguage =
		(headersList.get("x-initial-language") as Locale) || "en";

	const { resources } = await initTranslations(initialLanguage, i18nNamespaces);

	return (
		<TranslationsProvider
			namespaces={i18nNamespaces}
			locale={initialLanguage}
			resources={resources}
		>
			<QueryClientProvider>
				{/* SuppressHydrationWarning is only one layer deep, and required by <ThemeProvider> */}
				<html lang={initialLanguage} suppressHydrationWarning>
					<head>
						<title>Nya F-sektionen</title>
						<link rel="preconnect" href="https://fonts.googleapis.com" />
						<link rel="preconnect" href="https://fonts.gstatic.com" />
						<link
							href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
							rel="stylesheet"
						/>
					</head>
					<body>
						<ThemeProvider attribute="class">
							<div id="root" className="flex flex-col min-h-screen">
								<div className="flex-grow">{children}</div>
							</div>
						</ThemeProvider>
					</body>
				</html>
			</QueryClientProvider>
		</TranslationsProvider>
	);
}
