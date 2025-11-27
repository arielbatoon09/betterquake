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

// Rate limit: 30 requests per 5 minutes per IP (slightly higher for details)
const RATE_LIMIT_CONFIG = {
  interval: 5 * 60 * 1000, // 5 minutes
  maxRequests: 30,
};

export async function GET(req: Request) {
  // Check rate limit
  const clientId = getClientIdentifier(req);
  const rateLimitResult = checkRateLimit(
    clientId,
    "/api/phivolcs/details",
    RATE_LIMIT_CONFIG
  );

  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult);
  }
  try {
    const { searchParams } = new URL(req.url);
    const pageUrl = searchParams.get("url");

    if (!pageUrl) {
      return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
    }

    const agent = new https.Agent({ rejectUnauthorized: false });
    const { data: html } = await axios.get(pageUrl, {
      httpsAgent: agent,
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    const $ = cheerio.load(html);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getTdText = (td: any) => {
      const parts: string[] = [];
      $(td)
        .contents()
        .each((_, el) => {
          if (el.type === "text") {
            parts.push($(el).text());
          } else if (el.type !== "comment") {
            parts.push($(el).text());
          }
        });
      return parts.join(" ").replace(/\s+/g, " ").trim();
    };

    const result: Record<string, string> = {};
    $("tr").each((_, tr) => {
      const tds = $(tr).find("td");
      if (tds.length < 2) return;
      const label = getTdText(tds[0]).replace(/:$/, "").trim();
      const value = getTdText(tds[1]).trim();
      if (label && value) result[label] = value;
    });

    const dateTime = result["Date/Time"] || null;
    const location = result["Location"] || null;

    let latitude: string | null = null;
    let longitude: string | null = null;
    let epicenter: { distance: string; direction: string; place: string } | null = null;

    if (location) {
      // normalize the string: replace non-standard degree symbols with plain °
      const loc = location.replace(/[^\x00-\x7F]/g, "°");

      // match latitude, longitude, and remaining epicenter info
      const match = loc.match(/([\d.]+)°[NS], ([\d.]+)°[EW] - (.+)/);
      if (match) {
        latitude = match[1];
        longitude = match[2];

        const epicMatch = match[3].match(/^([\d]+ km) (.+) of (.+)$/);
        if (epicMatch) {
          epicenter = {
            distance: epicMatch[1],
            direction: epicMatch[2],
            place: epicMatch[3],
          };
        } else {
          epicenter = { distance: "", direction: "", place: match[3] };
        }
      } else {
        epicenter = { distance: "", direction: "", place: loc };
      }
    }

    const depth = result["Depth of Focus (Km)"] || null;
    const magnitude = result["Magnitude"] || null;
    const expectingDamage = result["Expecting Damage"] || null;
    const expectingAftershocks = result["Expecting Aftershocks"] || null;
    const issuedOn = result["Issued On"] || null;
    const preparedBy = result["Prepared by"] || null;

    const imgSrc = $("img").first().attr("src");
    const mapImage = imgSrc ? new URL(imgSrc, pageUrl).toString() : null;

    const response = NextResponse.json({
      url: pageUrl,
      dateTime,
      latitude,
      longitude,
      epicenter,
      depth,
      magnitude,
      expectingDamage,
      expectingAftershocks,
      issuedOn,
      preparedBy,
      mapImage,
    });
    
    return addRateLimitHeaders(response, rateLimitResult);
  } catch (err) {
    console.error("PHIVOLCS scraping failed:", err);
    const errorResponse = NextResponse.json(
      { error: "Failed to fetch details" }, 
      { status: 500 }
    );
    return addRateLimitHeaders(errorResponse, rateLimitResult);
  }
}