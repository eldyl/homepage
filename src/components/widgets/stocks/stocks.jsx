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

  let [viewingPercentChange, setViewingPercentChange] = useState(false);

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
      <Container key={stock.ticker}>
        <PrimaryText>{stock.ticker}</PrimaryText>
        {!viewingPercentChange ? (
          <SecondaryText>{stock.currentPrice}</SecondaryText>
        ) : (
          <SecondaryText>{stock.percentChange}%</SecondaryText>
        )}
      </Container>
    ));

    return (
      <Container>
        <Raw>
          <button
            type="button"
            onClick={() => (viewingPercentChange ? setViewingPercentChange(false) : setViewingPercentChange(true))}
            className="flex items-center justify-center hover:outline-none focus:outline-none"
          >
            <WidgetIcon icon={FaChartLine} />
            {stocks}
          </button>
        </Raw>
      </Container>
    );
  }
}

export default function Stocks({ options }) {
  return <Widget options={{ ...options }} />;
}
