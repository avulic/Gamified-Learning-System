# RPG Game Project

This project consists of three main components: Vue.js frontend, RPGJS game engine, and Node.js backend. Each component has its own development server.

## Prerequisites

- Node.js (version 18 or higher)
- npm (usually comes with Node.js)
- Mongo
  

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/avulic/Gamified-Learning-System
   cd Gamified-Learning-System
   ```

2. Run file "run-all-dev.bat" that will start all project:
   Win:
   ```
   .\run-all-dev.bat
   ```

2. Or build Docker images (!!! Game doesnt work):
   In root
   ```
   docker-compose build
   ```

## Running separately

You need to run all three components simultaneously for the full development environment.

### 1. Vue.js Frontend

```
cd Client/CRUD
npm run dev
```

The Vue.js development server will start, typically on `http://localhost:8080`.

### 2. RPGJS Game Engine

```
cd Game/rpg-game
npm run dev
```

The RPGJS development server will start, typically on `http://localhost:3000`.

### 3. Node.js Backend

```
cd Server
npm run dev
```

The Node.js development server will start, typically on `http://localhost:4000`.



## Accessing the Application

- Vue.js Frontend: `http://localhost:8080`
- RPGJS Game: `http://localhost:3000`
- Node.js API: `http://localhost:4000`

User generated on seed:
  Username: "look in mongo db for username"
  Pasword:password123

## Development

Make sure to keep all three servers running while developing. Changes in each project should hot-reload automatically.

## Troubleshooting

If you encounter any issues:

1. Ensure all dependencies are installed in each project directory.
2. Check if the ports are not in use by other applications.
3. Look at the console output for each service for any error messages.


## License

[Include your license information here]
