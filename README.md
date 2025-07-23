# Asset Booking Application

The Asset Booking Application is a web-based platform designed to streamline asset management and booking for professionals such as lab technicians and engineers. It allows users to efficiently view, book, and manage assets, using AI-driven recommendations to enhance the user experience.

The application is built using Svelte for a responsive and modern frontend, while the backend leverages Supabase for persistent data storage and user authentication.

---

## Features

- View available assets with real-time status
- Book assets with date and purpose validation
- Visual calendar for date selection
- AI-driven booking recommendations (planned)
- Offline fallback with localStorage
- Fully integrated with Supabase for data and auth

---

## Project Modules

### AssetList
Displays available assets including:
- Name
- ID
- Calibration status

Data is fetched from Supabase or localStorage, with logging to indicate which source is used.

### BookingForm
Manages the booking process:
- Select booking date and time
- Enter purpose for booking
- Validated using Zod for reliability

### Calendar
- Visual date-picker to easily select booking dates
- Integrated with date-fns for seamless date manipulation

### Data Management
- Primary storage via Supabase
- Fallback to localStorage in offline/unavailable scenarios

### Backend Integration
- Supabase used for database operations and authentication
- localStorage ensures continuity when Supabase is down

### SQL Setup
Includes:
- Table creation scripts
- Indexing for performance
- Row-Level Security (RLS) policies
- Sample data insertion for testing

---

## Technology Stack

| Layer         | Technology               |
|---------------|---------------------------|
| Frontend      | [Svelte](https://svelte.dev) |
| Type System   | TypeScript               |
| Build Tool    | Vite                     |
| Validation    | Zod                      |
| Date Handling | date-fns                 |
| Preprocessing | svelte-preprocess        |
| Backend       | [Supabase](https://supabase.io) |
| Fallback      | localStorage             |

---

## Setup Instructions

1. Clone the repository  
   ```bash
   git clone https://github.com/your-username/asset-booking-app.git
   cd asset-booking-app
