import cachedFetch from "utils/proxy/cached-fetch";
import { getSettings } from "utils/config/config";

export default async function handler(req, res) {
  const { watchlist, provider, cache } = req.query;

  if (!watchlist) {
    return res.status(400).json({ error: "Missing Watchlist" });
  }

  if (!provider) {
    return res.status(400).json({ error: "Missing Provider" });
  }

  const settings = getSettings();

  const { finnhub } = settings?.providers;

  if (!finnhub) {
    return res.status(400).json({ error: "Invalid Provider" });
  }

  const watchlistArr = watchlist.split(",") || [watchlist];

  if (finnhub) {
  const apiKey = finnhub
    const results = await Promise.all(
      watchlistArr.map(async (ticker) => {
        const apiUrl = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${apiKey}`;

        const { c, dp } = await cachedFetch(apiUrl, cache || 1);

        return { ticker, currentPrice: `${c.toFixed(2)}`, percentChange: dp.toFixed(2) };
      }),
    );

    return res.send({
      stocks: results,
    });
  }

  return res.status(400).json({ error: "Invalid configuration" });
}
