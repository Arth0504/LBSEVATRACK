# Reporting Module Specification

## Overview
The Reporting Module is designed to provide comprehensive insights into SevaTrack's operations. It allows Admins to view daily, weekly, monthly, and custom date range statistics, filter by temple, and export the data into Excel and PDF formats.

## Data Points (Metrics)
1. **Total Bookings**: Number of bookings made within the selected timeframe.
2. **Total Members**: Total count of individuals associated with the bookings (adults + children + seniors).
3. **Verified Entries**: Number of bookings successfully scanned and verified at the gate.
4. **Pending Entries**: Bookings made but not yet verified.
5. **Temple Wise Statistics**: Breakdown of bookings and entries per temple.
6. **Slot Wise Statistics**: Breakdown of bookings and entries per time slot.

## Filters
- **Date Range**: Daily, Weekly, Monthly, Yearly, Custom.
- **Temple**: Specific temple or "All Temples".

## Export Formats
### 1. Excel Export (.xlsx)
- Generated on the client-side using `xlsx`.
- Contains multiple sheets: Summary, Booking Details, Temple Breakdown.

### 2. PDF Export (.pdf)
- Generated on the client-side using `jspdf` and `jspdf-autotable`.
- Formatted as a professional report with a header, summary statistics, and data tables.

## API Endpoints (Planned)
- `GET /api/reports/summary` (aggregated counts)
- `GET /api/reports/temple-wise` (aggregation grouped by temple)
- `GET /api/reports/slot-wise` (aggregation grouped by slot)
