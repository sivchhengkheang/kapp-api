# Kapp API

Kapp API is the unified backend service powering a suite of educational and puzzle games, including:

- **Typing Code Game**: A game where players type code snippets as fast and accurately as possible to earn score multipliers and power-ups.
- **Typing Math Game**: A fast-paced math game where players solve arithmetic problems and race against the clock.
- **Robot Brainiac**: A puzzle game where players input command sequences to navigate a robot through complex mazes efficiently.

## Features

- **Unified Authentication & Profiles**: A shared infrastructure allowing users to log in once and access all games seamlessly.
- **Global Leaderboards**: Cross-game and game-specific leaderboards tracking speed, accuracy, efficiency, and overall mastery.
- **Comprehensive Statistics**: Detailed tracking of user performance, problem attempt histories, wpm/ppm rates, and win streaks.
- **Robust Schema**: Built using Node.js, Express, and MongoDB (via Mongoose), leveraging highly optimized schemas for fast metric retrieval.

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB connection string

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/sivchhengkheang/kapp-api.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables by creating a `.env` file in the root directory:
   ```env
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```
4. Start the server:
   ```bash
   npm run start
   ```

## Architecture
The repository follows a clean, domain-driven structure:
- `/src/models`: Mongoose schemas grouped by game domains (`shared`, `typing-code`, `typing-math`, `robot-brainiac`).
- `/src/controllers`: Request handlers mapped strictly to their respective schemas.
- `/src/routers`: Express routers for organized API endpoint management.
- `/src/config`: Database connection and external service configs.
