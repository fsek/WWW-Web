
import Obfuscate from "react-obfuscate";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";


export default function EmergencyCard() {
  const { t } = useTranslation("contact");
  return (
    <Card className="px-8 md:px-12 w-full bg-destructive/10 border-destructive/30 dark:bg-destructive/50 border shadow-lg">
      <div className="text-2xl font-bold text-center text-destructive dark:text-destructive-foreground m-0 p-0">
        {t("emergency.title")}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 whitespace-pre-wrap wrap-normal">
        <div className="flex flex-col mt-3">
          <p className="text-base">
            <span className="font-bold">{t("emergency.text_ordf.self")}</span>
            <br />
            {t("emergency.text_ordf.name")} - Ester:{" "}
            <Obfuscate
              email="ordf@fsektionen.se"
              style={{ textDecoration: "underline" }}
            />
            <br />
            <Obfuscate
              tel="+46 073-642 16 17"
              style={{ textDecoration: "underline" }}
            />
          </p>
        </div>
        <div className="flex flex-col mt-3">
          <p className="text-base">
            <span className="font-bold">{t("emergency.text_foset.self")}</span>
            <br />
            <Obfuscate
              email="foset@fsektionen.se"
              style={{ textDecoration: "underline" }}
            />
            <br />
            Överfös Victor:{" "}
            <Obfuscate
              tel="+46 076-195 02 25"
              style={{ textDecoration: "underline" }}
            />
            <br />
            Cofös Tova:{" "}
            <Obfuscate
              tel="+46 070-957 88 52"
              style={{ textDecoration: "underline" }}
            />
          </p>
        </div>
        <div className="flex flex-col mt-3">
          <p className="text-base">
            <span className="font-bold">{t("emergency.text_car.self")}</span>
            <br />
            {t("emergency.text_car.name1")} - Vic:{" "}
            <Obfuscate
              email="bil@fsektionen.se"
              style={{ textDecoration: "underline" }}
            />
            <br />
            <Obfuscate
              tel="+46 076-020 82 17"
              style={{ textDecoration: "underline" }}
            />
            <br />
            {t("emergency.text_car.name2")} - Alva:{" "}
            <Obfuscate
              email="prylm@fsektionen.se"
              style={{ textDecoration: "underline" }}
            />
            <br />
            <Obfuscate
              tel="+46 070-794 98 92"
              style={{ textDecoration: "underline" }}
            />
            <br />
            {t("emergency.text_car.name3")} - Ester:{" "}
            <Obfuscate
              email="ordf@fsektionen.se"
              style={{ textDecoration: "underline" }}
            />
            <br />
            <Obfuscate
              tel="+46 073-642 16 17"
              style={{ textDecoration: "underline" }}
            />
          </p>
        </div>
      </div>
    </Card>
  );
}
