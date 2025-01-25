import i18n from "i18next";
import { useTranslation, initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import type { FsBackendOptions } from "i18next-fs-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
	.use(initReactI18next)
	.use(HttpBackend)
	.use(LanguageDetector)
	.init<FsBackendOptions>({
		backend: {
			loadPath: "/locales/{{lng}}/{{ns}}.json",
		},
		fallbackLng: "en",
		debug: true,
		ns: ["admin"],
		interpolation: {
			escapeValue: false, // react already escapes values
		},
	});

export default i18n;
