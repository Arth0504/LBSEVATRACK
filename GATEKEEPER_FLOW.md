# Gatekeeper Flow Specification

## Overview
This document outlines the end-to-end flow for Gatekeeper Management and Verification in SevaTrack.

## 1. Admin Actions (Gatekeeper Management)
### Create Gatekeeper
- Admin navigates to "Gatekeeper Management".
- Admin inputs Name, Email, Password, and selects an assigned Temple.
- Backend creates a User with role = `gate` and `temple` reference.

### Edit / Delete
- Admin can reassign a gatekeeper to a different temple.
- Admin can update the gatekeeper's details or delete the account.

## 2. Gatekeeper Actions
### Login
- Gatekeeper uses the standard login page (`/login`).
- Upon successful login, the system detects `role === 'gate'` and redirects them to the Gatekeeper Dashboard (`/gate`).

### Dashboard & Verification
- **Context Limitation**: Gatekeepers can ONLY see and verify bookings for their assigned temple.
- **QR Scanning**: When scanning a QR code, the system cross-references the booking's `temple` ID with the Gatekeeper's `temple` ID.
- If the booking belongs to a different temple, verification is **REJECTED** with an appropriate error message.
- If it matches and the slot is valid, an `EntryLog` is created marking the `scannedBy` as the Gatekeeper.

## 3. Analytics
- The Admin Dashboard "Gate Activity" will display the Temple Name, the Assigned Gatekeeper, and the count of verified entries (Status: Online/Offline based on recent activity).
