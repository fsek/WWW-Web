import { createInstance, type i18n, type Resource } from "i18next";
import { initReactI18next } from "react-i18next/initReactI18next";
import i18nConfig from "@/i18nConfig";
import resourcesToBackend from "i18next-resources-to-backend";
import LanguageDetector from "i18next-browser-languagedetector";

export type Locale = "en" | "sv";
export type Namespace =
	| "admin"
	| "main"
	| "namnden"
	| "calendar"
	| "utskott"
	| "landingpage"
	| "user-settings"
	| "notfound"
	| "contact";

// If you add more you probably also have to add them to the layout.tsx file corresponding to the page you are on
// (or only the main one, try that first)

export default async function initTranslations(
	locale: Locale,
	namespaces: Namespace[],
	i18nInstance?: i18n,
	resources?: Resource,
) {
	const guaranteedI18nInstance = i18nInstance || createInstance();

	guaranteedI18nInstance.use(initReactI18next);

	guaranteedI18nInstance.use(LanguageDetector);

	if (!resources) {
		guaranteedI18nInstance.use(
			resourcesToBackend(
				(locale: Locale, namespace: Namespace) =>
					import(`@/locales/${locale}/${namespace}.json`),
			),
		);
	}

	const detectionOptions = {
		order: ["querystring", "cookie", "localStorage", "navigator", "htmlTag"],
		caches: ["cookie", "localStorage"],
		cookieMinutes: 60 * 24 * 365, // 1 year
		load: "languageOnly",
		// cimode can be used in dev for i18n to test translations, we don't but might as well support it
		excludeCacheFor: ["cimode"],
	};

	await guaranteedI18nInstance.init({
		lng: locale,
		resources,
		fallbackLng: i18nConfig.defaultLocale,
		supportedLngs: i18nConfig.locales,
		defaultNS: namespaces[0],
		fallbackNS: namespaces[0],
		ns: namespaces,
		preload: resources ? [] : i18nConfig.locales,
		react: {
			useSuspense: false,
		},
		detection: detectionOptions,
	});

	return {
		i18n: guaranteedI18nInstance,
		resources: guaranteedI18nInstance.services.resourceStore.data,
		t: guaranteedI18nInstance.t,
	};
}
