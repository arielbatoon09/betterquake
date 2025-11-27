# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of BetterQuake

## [1.0.0] - 2025-11-27

### Added
- 🎉 Initial release of BetterQuake
- Real-time earthquake monitoring from PHIVOLCS data
- Modern, responsive UI with TailwindCSS and ShadCN
- Advanced filtering system
  - Search by location
  - Filter by minimum magnitude
  - Sort by date or magnitude
- Pagination with configurable page sizes (10, 20, 50, 100)
- Smart caching system
  - 5-minute localStorage cache
  - Auto-refresh mechanism
  - Cache status indicators
- Interactive earthquake cards with detailed information
- Earthquake details modal with comprehensive data
- Statistics dashboard
  - Total earthquakes count
  - Major earthquakes (≥5.0) counter
  - Last 24 hours activity tracker
- Data period indicator showing current month
- Rate limiting protection
  - 20 requests per 5 minutes for latest endpoint
  - 30 requests per 5 minutes for details endpoint
  - Per-IP tracking
  - Standard rate limit headers
- Graceful error handling and user feedback
- Mobile-responsive design

### API Endpoints
- `GET /api/phivolcs/latest` - Fetch latest earthquakes
- `GET /api/phivolcs/details?url=` - Fetch earthquake details

### Components
- `EarthquakeList` - Main list component with loading states
- `EarthquakeFilters` - Advanced filtering controls
- `EarthquakeDetailsDialog` - Detailed earthquake information modal
- `Pagination` - Customizable pagination component

### Utilities
- Date parsing for PHIVOLCS format
- Relative time display (e.g., "5m ago")
- Magnitude color coding and labeling
- Rate limiting system
- Cache management utilities

### Documentation
- Comprehensive README with features and API docs
- Contributing guidelines
- Code of Conduct
- Security policy
- MIT License

### Dependencies
- Next.js 16.0.5
- React 19.2.0
- TypeScript 5
- TailwindCSS 4
- ShadCN UI components
- Axios for HTTP requests
- Cheerio for web scraping
- Lucide React for icons

---

## Legend

- `Added` for new features
- `Changed` for changes in existing functionality
- `Deprecated` for soon-to-be removed features
- `Removed` for now removed features
- `Fixed` for any bug fixes
- `Security` for vulnerability fixes

[Unreleased]: https://github.com/yourusername/better-quake/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/yourusername/better-quake/releases/tag/v1.0.0

