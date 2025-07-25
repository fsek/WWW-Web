import QueryClientProvider from "@/components/QueryClientProvider";
import "./globals.css";
import { client } from "@/api";
import initTranslations, { type Locale, type Namespace } from "./i18n";
import TranslationsProvider from "@/components/TranslationsProvider";
import ClientProvider from "@/components/ClientProvider";
import { ThemeProvider } from "next-themes";

// Default locale as fallback
const defaultLocale = "sv" satisfies Locale;
const i18nNamespaces = [
	"main",
	"namnden",
	"admin",
	"calendar",
	"utskott",
	"landingpage",
	"user-settings",
	"notfound",
] satisfies Namespace[];

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	client.setConfig({ baseUrl: "http://host.docker.internal:8000" });

	// Initialize translations with default locale
	const { i18n, resources } = await initTranslations(
		i18nNamespaces,
		defaultLocale,
	);

	return (
		<TranslationsProvider namespaces={i18nNamespaces} resources={resources}>
			<QueryClientProvider>
				{/* SuppressHydrationWarning is only one layer deep, and required by <ThemeProvider> */}
				<html lang={i18n.language} suppressHydrationWarning>
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
							<ClientProvider>
								<div id="root" className="flex flex-col min-h-screen">
									<div className="flex-grow">{children}</div>
								</div>
							</ClientProvider>
						</ThemeProvider>
					</body>
				</html>
			</QueryClientProvider>
		</TranslationsProvider>
	);
}
