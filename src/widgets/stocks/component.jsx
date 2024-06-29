import { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import classNames from "classnames";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

function parseWatchlist(watchlist) {
  let watchlistNumberOfFieldsWithQuantity = 0;
  let watchlistHasDuplicates = false;
  let dupeCheckMap = new Map();

  // Parse quantity if it exists, and check for duplicates
  const parsedWatchlist = watchlist.map((ticker) => {
    const tickerAndQuantity = ticker.split("*");

    const tickerSymbol = tickerAndQuantity[0];
    const quantity = tickerAndQuantity[1] ? tickerAndQuantity[1] : null;

    if (quantity) watchlistNumberOfFieldsWithQuantity += 1;

    if (dupeCheckMap.has(tickerSymbol)) {
      watchlistHasDuplicates = true;
    } else {
      dupeCheckMap.set(tickerSymbol);
    }

    return {
      ticker: tickerSymbol,
      quantity,
    };
  });

  dupeCheckMap = null;

  return { watchlistHasDuplicates, watchlistNumberOfFieldsWithQuantity, parsedWatchlist };
}

function MarketStatus({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data, error } = useWidgetAPI(widget, "stocks/market-status/us", {
    exchange: "US",
  });

  if (error || data?.error) {
    return <Container service={service} error={error} />;
  }

  if (!data) {
    return (
      <Container service={service}>
        <Block value={t("stocks.loading")} />
      </Container>
    );
  }

  const { isOpen } = data;

  if (isOpen) {
    return (
      <span className="inline-flex items-center rounded-md bg-green-500/10 px-2 py-1 text-xs font-medium text-green-400/90 ring-1 ring-inset ring-green-500/20 cursor-default">
        {t("stocks.open")}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-md bg-red-400/10 px-2 py-1 text-xs font-medium text-red-400/60 ring-1 ring-inset ring-red-400/10 cursor-defualt">
      {t("stocks.closed")}
    </span>
  );
}

function StockItem({
  service,
  ticker,
  quantity,
  // setCurrentValueAtPosition,
  // currentValueAtPosition,
  // listOfPositions,
  watchlistNumberOfFieldsWithQuantity,
  // setListOfPositions,
  // setTotalValueOfPositions,
}) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data, error } = useWidgetAPI(widget, "stocks/quote", { symbol: ticker });

  const valueOfPosition = parseFloat(data?.c) * parseFloat(quantity);

  // useEffect(() => {
  //   if (valueOfPosition > 0 && Number.isNaN(valueOfPosition) === false) {
  //     console.log("we setting!", valueOfPosition);
  //     setCurrentValueAtPosition(valueOfPosition);
  //   }
  //
  //   if (listOfPositions.length === watchlistNumberOfFieldsWithQuantity) {
  //     setTotalValueOfPositions(listOfPositions.reduce((acc, curr) => acc + curr, 0));
  //   }
  // }, [valueOfPosition, setListOfPositions, listOfPositions, watchlistNumberOfFieldsWithQuantity]);

  if (error || data?.error) {
    return <Container service={service} error={error} />;
  }

  if (!data) {
    return (
      <Container service={service}>
        <Block value={t("stocks.loading")} />
      </Container>
    );
  }

  return (
    <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded flex flex-1 items-center justify-between m-1 p-1 text-xs">
      <span className="font-thin ml-2 flex-none">{ticker}</span>
      <div className="flex items-center">
        <div
          className={
            watchlistNumberOfFieldsWithQuantity > 0
              ? "flex flex-col items-end leading-none text-right"
              : "flex flex-row-reverse mr-2 text-right"
          }
        >
          <span
            className={
              watchlistNumberOfFieldsWithQuantity > 0
                ? `font-bold ${data?.dp > 0 ? "text-emerald-300" : "text-rose-300"}`
                : `font-bold ml-2 w-10 ${data?.dp > 0 ? "text-emerald-300" : "text-rose-300"}`
            }
          >
            {data?.dp?.toFixed(2) ? `${data?.dp?.toFixed(2)}%` : "error"}
          </span>
          <span className="font-bold">
            {data.c
              ? t("common.number", {
                  value: data?.c,
                  style: "currency",
                  currency: "USD",
                })
              : "error"}
          </span>
        </div>
        {watchlistNumberOfFieldsWithQuantity > 0 && (
          <div className="w-32 flex flex-col items-end leading-none">
            <div className="mr-2">
              <span className="font-thin">{quantity && "x"}</span>
              <span className="font-thin pl-0.5">{quantity && quantity} </span>
            </div>
            <span className="font-bold ml-0.5 mr-2 text-right">
              {quantity &&
                t("common.number", {
                  value: valueOfPosition,
                  style: "currency",
                  currency: "USD",
                })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function TotalRow({ totalValueOfPositions }) {
  const { t } = useTranslation();

  // const totalValueOfPositions = useMemo(() => {
  //   return listOfPositions.reduce((acc, curr) => acc + curr, 0);
  // }, [listOfPositions]);
  // console.log("Total value of positions ->", totalValueOfPositions);

  return (
    <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 py-2 flex-1 flex flex-row items-center justify-between p-1 text-xs">
      <span className="font-thin pl-2">Total Value</span>

      <span className="flex flex-row font-bold text-right pr-2">
        {t("common.number", {
          value: totalValueOfPositions,
          style: "currency",
          currency: "USD",
        })}
      </span>
    </div>
  );
}

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const { watchlist, showUSMarketStatus } = widget;

  const [currentValueAtPosition, setCurrentValueAtPosition] = useState(null);
  const [totalValueOfPositions, setTotalValueOfPositions] = useState(null);
  const [listOfPositions, setListOfPositions] = useState([]);

  useEffect(() => {
    if (currentValueAtPosition) {
      setListOfPositions((prev) => [...prev, currentValueAtPosition]);
    }
  }, [currentValueAtPosition]);

  if (!watchlist || !watchlist.length) {
    return (
      <Container service={service}>
        <Block value={t("stocks.watchlistRequired")} />
      </Container>
    );
  }

  const { watchlistHasDuplicates, watchlistNumberOfFieldsWithQuantity, parsedWatchlist } = parseWatchlist(watchlist);

  if (watchlistHasDuplicates) {
    return (
      <Container service={service}>
        <Block value={t("stocks.hasDuplicates")} />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <div className={classNames(service.description ? "-top-10" : "-top-8", "absolute right-1 z-20")}>
        {showUSMarketStatus === true && <MarketStatus service={service} />}
      </div>

      <div className="flex flex-col w-full">
        {parsedWatchlist.map(({ ticker, quantity }) => (
          <StockItem
            key={ticker}
            service={service}
            ticker={ticker}
            quantity={quantity}
            watchlistNumberOfFieldsWithQuantity={watchlistNumberOfFieldsWithQuantity}
            setCurrentValueAtPosition={setCurrentValueAtPosition}
            currentValueAtPosition={currentValueAtPosition}
            listOfPositions={listOfPositions}
            setListOfPositions={setListOfPositions}
            setTotalValueOfPositions={setTotalValueOfPositions}
          />
        ))}

        <TotalRow listOfPositions={listOfPositions} totalValueOfPositions={totalValueOfPositions} />
      </div>
    </Container>
  );
}
