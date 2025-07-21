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
	| "landingpage";

// If you add more you probably also have to add them to the layout.tsx file corresponding to the page you are on
// (or only the main one, try that first)

export default async function initTranslations(
	namespaces: Namespace[],
	defaultLocale: Locale = "sv",
	i18nInstance?: i18n,
	resources?: Resource,
) {
	const instance = i18nInstance || createInstance();

	if (!instance.isInitialized) {
		instance.use(initReactI18next);

		instance.use(LanguageDetector);

		if (!resources) {
			instance.use(
				resourcesToBackend(
					(locale: Locale, namespace: Namespace) =>
						import(`@/locales/${locale}/${namespace}.json`),
				),
			);
		}

		const detectionOptions = {
			order: ["querystring", "cookie", "localStorage", "navigator", "htmlTag"],
			caches: ["cookie", "localStorage"],
			load: "languageOnly",
			// Don't detect from path, subdomain, or querystring (no internationalized routing)
			excludeCacheFor: ["cimode"],
		};

		await instance.init({
			lng: undefined,
			resources,
			fallbackLng: defaultLocale,
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
	}

	return {
		i18n: instance,
		resources: instance.services.resourceStore.data,
		t: instance.t,
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
