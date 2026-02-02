"use client";
import { I18nextProvider } from "react-i18next";
import initTranslations, { type Locale, type Namespace } from "@/app/i18n";
import { createInstance, type Resource } from "i18next";
import type { PropsWithChildren } from "react";

export default function TranslationsProvider({
	children,
	locale,
	namespaces,
	resources,
}: PropsWithChildren<{
	locale: Locale;
	namespaces: Namespace[];
	resources: Resource;
}>) {
	const i18n = createInstance();

	initTranslations(locale, namespaces, i18n, resources);

	return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
