import useSWR from "swr";
import { useState } from "react";
import { useTranslation } from "next-i18next";
import { FaChartLine } from "react-icons/fa6";

import Error from "../widget/error";
import Container from "../widget/container";
import PrimaryText from "../widget/primary_text";
import WidgetIcon from "../widget/widget_icon";
import Raw from "../widget/raw";

function Widget({ options }) {
  const { t, i18n } = useTranslation();

  const [viewingPercentChange, setViewingPercentChange] = useState(false);

  const { color } = options;

  const { data, error } = useSWR(
    `/api/widgets/stocks?${new URLSearchParams({ lang: i18n.language, ...options }).toString()}`,
  );

  if (error || data?.error) {
    return <Error options={options} />;
  }

  if (!data) {
    return (
      <Container>
        <WidgetIcon icon={FaChartLine} />
        <PrimaryText>{t("stocks.loading")}...</PrimaryText>
      </Container>
    );
  }

  if (data) {
    const stocks = data.stocks.map((stock) => (
      <div
        key={stock.ticker}
        className="bg-theme-200/50 dark:bg-theme-900/20 rounded h-full text-xs px-1 w-[4.75rem] flex flex-col items-center justify-center"
      >
        <span className="text-theme-800 dark:text-theme-200 text-xs">{stock.ticker}</span>
        {!viewingPercentChange ? (
          <span
            className={
              color
                ? `text-xs ${stock.percentChange < 0 ? "text-rose-300/70" : "text-emerald-300/70"}`
                : "text-theme-800/70 dark:text-theme-200/50 text-xs"
            }
          >
            {t("common.number", {
              value: stock.currentPrice,
              style: "currency",
              currency: "USD",
            })}
          </span>
        ) : (
          <span
            className={
              color
                ? `text-xs ${stock.percentChange < 0 ? "text-rose-300/70" : "text-emerald-300/70"}`
                : "text-theme-800/70 dark:text-theme-200/70 text-xs"
            }
          >
            {stock.percentChange}%
          </span>
        )}
      </div>
    ));

    return (
      <Container>
        <Raw>
          <button
            type="button"
            onClick={() => (viewingPercentChange ? setViewingPercentChange(false) : setViewingPercentChange(true))}
            className="flex items-center w-full h-full hover:outline-none focus:outline-none"
          >
            <FaChartLine className="flex-none w-5 h-5 text-theme-800 dark:text-theme-200 mr-2" />
            <div className="flex flex-wrap items-center gap-0.5">{stocks}</div>
          </button>
        </Raw>
      </Container>
    );
  }
}

export default function Stocks({ options }) {
  return <Widget options={{ ...options }} />;
}
