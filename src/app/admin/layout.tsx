import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import initTranslations, { type Locale, type Namespace } from "../i18n";
import TranslationsProvider from "@/components/TranslationsProvider";
import LoginWall from "@/components/LoginWall";

const locale = "sv" satisfies Locale;
const i18nNamespaces = ["admin"] satisfies Namespace[];

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { resources } = await initTranslations(locale, i18nNamespaces);

	return (
		<TranslationsProvider
			namespaces={i18nNamespaces}
			locale={locale}
			resources={resources}
		>
			<LoginWall>
				<SidebarProvider>
					<AdminSidebar />
					<main>
						<SidebarTrigger />
						{children}
					</main>
				</SidebarProvider>
			</LoginWall>
		</TranslationsProvider>
	);
}
