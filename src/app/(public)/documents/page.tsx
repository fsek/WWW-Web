import { useTranslation } from "react-i18next";

export default function DocumentPage() {
  const { t } = useTranslation();
	return (
		<div>
			<h1 className="text-2xl font-bold">{t("main:documents.title")}</h1>
      <p className="text-neutral-500">
        {t("main:documents.title")}
      </p>
      <div className="flex flex-col gap-4">
        <p>
          Document 
        </p>
      </div>
		</div>
	);
}
