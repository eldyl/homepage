import cachedFetch from "utils/proxy/cached-fetch";
import { getSettings } from "utils/config/config";

export default async function handler(req, res) {
  const { watchlist, provider, cache } = req.query;

  if (!provider) {
    return res.status(400).json({ error: "Missing provider" });
  }

  if (provider !== "finnhub") {
    return res.status(400).json({ error: "Missing valid provider" });
  }

  if (!watchlist) {
    return res.status(400).json({ error: "Missing Watchlist" });
  }

  const providersInConfig = getSettings()?.providers;

  let apiKey;
  Object.entries(providersInConfig).forEach(([key, val]) => {
    if (key === provider) apiKey = val;
  });

  if (typeof apiKey === "undefined") {
    return res.status(400).json({ error: "Missing or invalid API Key for provider" });
  }

  const watchlistArr = watchlist.split(",") || [watchlist];

  if (watchlistArr.length > 6) {
    return res.status(400).json({ error: "Only 6 items are allowed in the watchlist" });
  }

  const hasDuplicates = new Set(watchlistArr).size !== watchlistArr.length;

  if (hasDuplicates) {
    return res.status(400).json({ error: "Duplicate items are not allowed in watchlist" });
  }

  if (provider === "finnhub") {
    // Finnhub allows up to 30 calls/second
    // https://finnhub.io/docs/api/rate-limit
    if (watchlistArr.length > 6) res.status(400).json({ error: "Max items in watchlist is 6" });

    const results = await Promise.all(
      watchlistArr.map(async (ticker) => {
        // https://finnhub.io/docs/api/quote
        const apiUrl = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${apiKey}`;

        // Finnhub free accounts allow up to 60 calls/minute
        // https://finnhub.io/pricing
        const { c, dp } = await cachedFetch(apiUrl, cache || 1);

        // API sometimes returns 200, but values returned are `null`
        if (c === null || dp === null) {
          return { ticker, currentPrice: "error", percentChange: "error" };
        }

        // Rounding percentage, but we want it back to a number for comparison
        return { ticker, currentPrice: c.toFixed(2), percentChange: parseFloat(dp.toFixed(2)) };
      }),
    );

    return res.send({
      stocks: results,
    });
  }

  return res.status(400).json({ error: "Invalid configuration" });
}
