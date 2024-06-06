import useSWR from "swr";
import { useState } from "react";
import { useTranslation } from "next-i18next";
import { FaChartLine } from "react-icons/fa6";

import Error from "../widget/error";
import Container from "../widget/container";
import PrimaryText from "../widget/primary_text";
import SecondaryText from "../widget/secondary_text";
import WidgetIcon from "../widget/widget_icon";
import Raw from "../widget/raw";

function Widget({ options }) {
  const { t, i18n } = useTranslation();

  const [viewingPercentChange, setViewingPercentChange] = useState(false);

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
      <span key={stock.ticker} className="flex flex-col items-center justify-center w-5 divide-y dark:divide-white/20">
        <span className="text-theme-800 dark:text-theme-200 text-sm font-medium">{stock.ticker}</span>
        {!viewingPercentChange ? (
          <SecondaryText>{stock.currentPrice}</SecondaryText>
        ) : (
          <SecondaryText>{stock.percentChange}%</SecondaryText>
        )}
      </span>
    ));
    return (
      <Container>
        <Raw>
          <button
            type="button"
            onClick={() => (viewingPercentChange ? setViewingPercentChange(false) : setViewingPercentChange(true))}
            className="flex items-center justify-center w-full h-full hover:outline-none focus:outline-none"
          >
            <FaChartLine className="information-widget-icon flex-none mr-3 w-5 h-5 text-theme-800 dark:text-theme-200" />
            <div className="flex flex-wrap items-center pl-1 gap-x-7 mr-3">{stocks}</div>
          </button>
        </Raw>
      </Container>
    );
  }
}

export default function Stocks({ options }) {
  return <Widget options={{ ...options }} />;
}
