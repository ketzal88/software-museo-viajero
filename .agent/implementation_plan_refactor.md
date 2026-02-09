---
title: "Implementation Plan - Inbox & Calendar Refactor"
description: "Completed refactoring of Inbox, Calendar, Schools, and Venues modules to match the new 'Google Stitch' design system."
---

# Overview
This implementation successfully refactors the core modules of the Museo Viajero application to align with the provided design specifications. The focus was on creating a modern, card-based UI with a clean "Google Stitch" aesthetic, improving navigation, and enhancing the user experience for managing bookings, schools, and venues.

# Key Changes

## 1. Inbox & Directory Structure
- **Design Alignment**: Updated `InboxList` to use a card-based grid layout, displaying booking status, expiry, and quick actions.
- **Filtering**: Implemented status tabs and filter pills in the `InboxPage` header.
- **Route Organization**: Consolidated main application routes under `(dashboard)` group for consistent layout usage.

## 2. Calendar Module
- **Monthly View**: Implemented a full-height, responsive monthly calendar grid.
- **Visual Enhancements**:
    - Displays venue names for theater events.
    - Color-coded badges for Theater (Blue) vs. Travel (Indigo) events.
    - "Today" highlighting and smooth month navigation.
- **Sidebar Stats**: Added a summary sidebar (desktop) showing monthly stats for functions and visits.
- **Mobile Optimization**: Added a Floating Action Button (FAB) for quick event creation on mobile.

## 3. Schools Module
- **Search Integration**: Added a sticky search bar to filter schools by name, district, or contact.
- **Card Design**: Refactored `SchoolList` to use clean cards with:
    - "Private/Public" badges.
    - Quick action buttons for WhatsApp, Call, and Edit.
    - Empty state with "Create School" prompt.

## 4. Venues (Teatros) Module
- **Visual Grid**: Implemented `VenueList` with a grid layout featuring:
    - Image placeholders with gradient overlays.
    - Capacity badges and address details.
    - "Active" status indicators.
    - Integrated "Add New Venue" card within the grid.

## 5. Navigation & Layout
- **Sidebar**: Updated to match the "Google Stitch" design:
    - White/Dark background with border.
    - User profile section at the bottom.
    - "Management System" subtitle.
- **Layout Consistency**: Ensured consistent background colors and spacing across all dashboard pages.

# Next Steps
1. **Interactive Calendar**: Implement the `EventDay` detail view and "Create Event" wizard to fully utilize the calendar's navigation.
2. **Bookings Flow**: Connect the "Create Booking" actions in the Inbox to the improved `SchoolAutocomplete` and Calendar slots.
3. **Authentication**: Implement middleware or a dedicated auth wrapper to protect the `(dashboard)` routes.
4. **Data Integration**: Connect the `CalendarView` stats to real backend aggregations.
