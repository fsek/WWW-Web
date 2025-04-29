import { createInstance, type i18n, type Resource } from "i18next";
import { initReactI18next } from "react-i18next/initReactI18next";
import i18nConfig from "@/i18nConfig";
import resourcesToBackend from "i18next-resources-to-backend";

export type Locale = "en" | "sv";
export type Namespace = "admin" | "main" | "namnden" | "calendar";
// todo: add more namespaces
// If you add more you probably also have to add them to the layout.tsx file corresponding to the page you are on

export default async function initTranslations(
	locale: Locale,
	namespaces: Namespace[],
	i18nInstance?: i18n,
	resources?: Resource,
) {
	i18nInstance = i18nInstance || createInstance();

	i18nInstance.use(initReactI18next);

	if (!resources) {
		i18nInstance.use(
			resourcesToBackend(
				(locale: Locale, namespace: Namespace) =>
					import(`@/locales/${locale}/${namespace}.json`),
			),
		);
	}

	await i18nInstance.init({
		lng: locale,
		resources,
		fallbackLng: i18nConfig.defaultLocale,
		supportedLngs: i18nConfig.locales,
		defaultNS: namespaces[0],
		fallbackNS: namespaces[0],
		ns: namespaces,
		preload: resources ? [] : i18nConfig.locales,
	});

	return {
		i18n: i18nInstance,
		resources: i18nInstance.services.resourceStore.data,
		t: i18nInstance.t,
	};
}

// i18n
// 	.use(initReactI18next)
// 	.use(HttpBackend)
// 	.use(LanguageDetector)
// 	.init<FsBackendOptions>({
// 		backend: {
// 			loadPath: "/locales/{{lng}}/{{ns}}.json",
// 		},
// 		fallbackLng: "en",
// 		debug: true,
// 		ns: ["admin"],
// 		interpolation: {
// 			escapeValue: false, // react already escapes values
// 		},
// 	});
