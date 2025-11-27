import axios from "axios";
import * as cheerio from "cheerio";
import { NextResponse } from "next/server";
import https from "https";
import {
  checkRateLimit,
  createRateLimitResponse,
  addRateLimitHeaders,
  getClientIdentifier,
} from "@/lib/rate-limit";

// Rate limit: 20 requests per 5 minutes per IP
const RATE_LIMIT_CONFIG = {
  interval: 5 * 60 * 1000, // 5 minutes
  maxRequests: 20,
};

export async function GET(req: Request) {
  // Check rate limit
  const clientId = getClientIdentifier(req);
  const rateLimitResult = checkRateLimit(
    clientId,
    "/api/phivolcs/latest",
    RATE_LIMIT_CONFIG
  );

  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult);
  }
  try {
    const URL = "https://earthquake.phivolcs.dost.gov.ph";

    // create agent to bypass SSL verification
    const agent = new https.Agent({
      rejectUnauthorized: false,
    });

    const { data: html } = await axios.get(URL, {
      httpsAgent: agent,
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const $ = cheerio.load(html);
    const rows = $("table tr");

    const earthquakes: any[] = [];

    rows.each((i, row) => {
      const columns = $(row).find("td");
      if (columns.length < 6) return;

      const dateText = $(columns[0]).text().trim();
      const magnitude = $(columns[4]).text().trim();
      const latitude = $(columns[1]).text().trim();
      const longitude = $(columns[2]).text().trim();
      const depth = $(columns[3]).text().trim();
      const location = $(columns[5]).text().trim();

      const href = $(columns[0]).find("a").attr("href")?.trim() || null;

      const isHeaderOrBlank =
        !dateText ||
        dateText.match(/^[A-Z]+\s20\d{2}$/) ||
        !magnitude ||
        isNaN(parseFloat(magnitude));

      if (isHeaderOrBlank) return;

      earthquakes.push({
        date: dateText,
        magnitude: parseFloat(magnitude),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        depth,
        location,
        detailsUrl: href
          ? `https://earthquake.phivolcs.dost.gov.ph/${href.replace(/\\/g, "/")}`
          : null,
      });
    });

    const response = NextResponse.json({ 
      count: earthquakes.length, 
      data: earthquakes 
    });
    
    return addRateLimitHeaders(response, rateLimitResult);
  } catch (err) {
    console.error("PHIVOLCS scraping failed:", err);
    const errorResponse = NextResponse.json(
      { error: "Failed to fetch PHIVOLCS data" },
      { status: 500 }
    );
    return addRateLimitHeaders(errorResponse, rateLimitResult);
  }
}