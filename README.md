# BetterQuake 🌍

A modern, real-time earthquake monitoring application for the Philippines, powered by data from PHIVOLCS (Philippine Institute of Volcanology and Seismology).

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38bdf8?style=flat-square&logo=tailwindcss)

## ✨ Features

### 🔍 **Advanced Filtering**
- Search earthquakes by location
- Filter by minimum magnitude (2.0+, 3.0+, 4.0+, 5.0+, 6.0+, 7.0+)
- Sort by date or magnitude (ascending/descending)
- Real-time filter counter

### 📄 **Pagination**
- Configurable page sizes (10, 20, 50, 100 items)
- Smart navigation controls
- Responsive design for all screen sizes

### 💾 **Smart Caching**
- Automatic 5-minute data caching using localStorage
- Reduces server load and API requests
- Cache status indicator
- Auto-refresh every 5 minutes

### 📊 **Data Visualization**
- Real-time statistics dashboard
- Magnitude-based color coding
- Interactive earthquake cards
- Detailed earthquake information modal

### 🛡️ **Rate Limiting**
- Protection against API abuse
- Per-IP rate limiting
- Graceful error handling

### 📅 **Data Period Indicator**
- Shows current month of displayed data
- Indicates when viewing current vs historical data

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/better-quake.git
cd better-quake
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔌 API Endpoints

### Get Latest Earthquakes
```
GET /api/phivolcs/latest
```

**Rate Limit:** 20 requests per 5 minutes per IP

**Response:**
```json
{
  "count": 150,
  "data": [
    {
      "date": "27 November 2025 - 10:04 AM",
      "magnitude": 4.2,
      "latitude": 14.5995,
      "longitude": 120.9842,
      "depth": "10 km",
      "location": "Manila Bay",
      "detailsUrl": "https://earthquake.phivolcs.dost.gov.ph/..."
    }
  ]
}
```

**Rate Limit Headers:**
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Unix timestamp when the limit resets

### Get Earthquake Details
```
GET /api/phivolcs/details?url=<earthquake_url>
```

**Rate Limit:** 30 requests per 5 minutes per IP

**Parameters:**
- `url` (required): The details URL from the earthquake list

**Response:**
```json
{
  "url": "https://...",
  "dateTime": "27 November 2025 - 10:04 AM",
  "latitude": "14.60",
  "longitude": "120.98",
  "epicenter": {
    "distance": "15 km",
    "direction": "Northwest",
    "place": "Manila Bay"
  },
  "depth": "10 km",
  "magnitude": "4.2",
  "expectingDamage": "No",
  "expectingAftershocks": "Yes",
  "issuedOn": "27 November 2025 - 10:15 AM",
  "preparedBy": "PHIVOLCS Staff",
  "mapImage": "https://..."
}
```

## 🛡️ Rate Limiting

BetterQuake implements rate limiting to prevent abuse and ensure fair usage:

### Limits
- **Latest Earthquakes API**: 20 requests per 5 minutes
- **Earthquake Details API**: 30 requests per 5 minutes

### Rate Limit Response
When rate limit is exceeded, the API returns a `429 Too Many Requests` response:

```json
{
  "error": "Too many requests",
  "message": "Rate limit exceeded. Please try again in 120 seconds.",
  "limit": 20,
  "remaining": 0,
  "resetAt": "2025-11-27T10:20:00.000Z"
}
```

### Client-Side Caching
The application automatically caches data for 5 minutes to minimize API requests and stay within rate limits.

## 🎨 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [TailwindCSS 4](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Icons**: [Lucide Icons](https://lucide.dev/)
- **Data Fetching**: [Axios](https://axios-http.com/)
- **Web Scraping**: [Cheerio](https://cheerio.js.org/)

## 📁 Project Structure

```
better-quake/
├── app/
│   ├── api/
│   │   └── phivolcs/
│   │       ├── latest/route.ts       # Latest earthquakes API
│   │       └── details/route.ts      # Earthquake details API
│   ├── globals.css                   # Global styles
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Main dashboard page
├── components/
│   ├── ui/                           # ShadCN UI components
│   ├── earthquake-list.tsx           # Earthquake list component
│   ├── earthquake-filters.tsx        # Filter controls
│   ├── earthquake-details-dialog.tsx # Details modal
│   └── pagination.tsx                # Pagination component
├── lib/
│   ├── cache-utils.ts                # localStorage caching utilities
│   ├── earthquake-utils.ts           # Date parsing & formatting
│   ├── rate-limit.ts                 # Rate limiting logic
│   ├── types.ts                      # TypeScript interfaces
│   └── utils.ts                      # General utilities
└── public/                           # Static assets
```

## 🔧 Configuration

### Rate Limit Configuration
Edit rate limits in the API route files:

**`app/api/phivolcs/latest/route.ts`:**
```typescript
const RATE_LIMIT_CONFIG = {
  interval: 5 * 60 * 1000, // 5 minutes
  maxRequests: 20,         // 20 requests
};
```

**`app/api/phivolcs/details/route.ts`:**
```typescript
const RATE_LIMIT_CONFIG = {
  interval: 5 * 60 * 1000, // 5 minutes
  maxRequests: 30,         // 30 requests
};
```

### Cache Duration
Edit cache duration in `lib/cache-utils.ts`:

```typescript
export const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting a Pull Request.

### Quick Start for Contributors

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your PR follows our coding standards and includes appropriate tests.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 📚 Documentation

- [Contributing Guidelines](CONTRIBUTING.md) - How to contribute
- [Code of Conduct](CODE_OF_CONDUCT.md) - Community standards
- [Security Policy](SECURITY.md) - Security practices and reporting
- [Changelog](CHANGELOG.md) - Project history and updates

## 🙏 Acknowledgments

- Data provided by [PHIVOLCS](https://earthquake.phivolcs.dost.gov.ph) (Philippine Institute of Volcanology and Seismology)
- UI components from [ShadCN UI](https://ui.shadcn.com/)

## ⚠️ Disclaimer

This application is for informational purposes only. For official earthquake information and safety guidelines, please visit [PHIVOLCS](https://www.phivolcs.dost.gov.ph/) directly.

---

Built with ❤️ using Next.js and TypeScript
