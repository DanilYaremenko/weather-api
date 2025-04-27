# Weather API

A RESTful API service that fetches and stores weather data from OpenWeatherMap API, providing current, hourly, and daily weather forecasts for any location worldwide.

## Features

- Fetch weather data from OpenWeatherMap API by coordinates
- Store weather data in PostgreSQL database
- Retrieve stored weather data by coordinates
- Support for different data types:
  - Current weather conditions
  - Hourly forecast
  - Daily forecast
- Response formatting via interceptor for standardized output

## Tech Stack

- Node.js
- NestJS
- TypeScript
- PostgreSQL
- TypeORM
- Axios
- Docker & Docker Compose

## Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)
- Docker and Docker Compose (for containerized deployment)
- OpenWeatherMap API key with "One Call API 3.0" subscription

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd weather-api
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:

   ```bash
   cp .env.example .env
   ```

   Edit the `.env` file with your OpenWeatherMap API key and other settings as needed.

4. Start the PostgreSQL database using Docker:

   ```bash
   docker-compose up -d postgres
   ```

5. Start the application:

   ```bash
   npm run start:dev
   ```

## Running the app

```bash
# development mode
npm run start:dev

# debug mode
npm run start:debug

# production mode
npm run build
npm run start:prod
```

## Docker Deployment

To run the entire application stack using Docker:

```bash
docker-compose up -d
```

This will start both the PostgreSQL database and the Weather API service.

## API Endpoints

### Weather

- `GET /weather` - Get stored weather data by coordinates

  - Query parameters:
    - `lat` (required) - Latitude
    - `lon` (required) - Longitude
    - `part` (required) - Weather data type (`current`, `hourly`, or `daily`)

- `POST /weather` - Fetch fresh weather data from OpenWeatherMap API and store it
  - Request body:
    ```json
    {
      "lat": 51.5074,
      "lon": 0.1278,
      "part": "current"
    }
    ```

## Response Format

The API returns weather data in a standardized format:

```json
{
  "sunrise": 1627884600,
  "sunset": 1627938900,
  "temp": 25.7,
  "feels_like": 26.2,
  "pressure": 1015,
  "humidity": 60,
  "uvi": 6.2,
  "wind_speed": 4.5
}
```

For hourly and daily forecasts, an array of such objects is returned.

## Testing

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```
