"use client";

import { I18nextProvider } from "react-i18next";
import initTranslations, { type Locale, type Namespace } from "@/app/i18n";
import { createInstance, type Resource } from "i18next";
import type { PropsWithChildren } from "react";

export default function TranslationsProvider({
	defaultLocale = "sv",
	children,
	namespaces,
	resources,
}: PropsWithChildren<{
	namespaces: Namespace[];
	resources: Resource;
	defaultLocale?: Locale;
}>) {
	const i18n = createInstance();

	initTranslations(namespaces, defaultLocale, i18n, resources);

	return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
