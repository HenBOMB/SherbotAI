# 🕵️ SherbotV2

[![Discord](https://img.shields.io/discord/670107546480017409?color=7289da&label=Discord&logo=discord&logoColor=white)](https://discord.gg/xTUMgmgFRt)


**SherbotV2** is a high-fidelity Discord bot designed to facilitate immersive, AI-powered **Murder Mystery** investigations. Built with Node.js and TypeScript, it leverages cutting-edge LLMs (Gemini, Ollama) to create dynamic suspect interactions and procedurally generated cases.

![SherbotV2 Banner](./public/banner.png)

Join our community: [Discord Server](https://discord.gg/xTUMgmgFRt)


---

## 🔍 Key Features

### ⚖️ Murder Mystery (MM) Engine
*   **Immersive Investigations**: Players move between dedicated Discord channels representing different rooms (e.g., `#📍┃kitchen`, `#📍┃study`).
*   **AI-Powered Interrogation**: Suspects are simulated by AI models, responding to player mentions in real-time. Confront them with evidence to force breakthroughs!
*   **Forensic Toolset**: Use specialized commands to uncover the truth:
    *   `dna`: Analyze chemical traces in a room.
    *   `footage`: Archive witness accounts and camera logs.
    *   `search`: Physically scour locations for hidden items.
    *   `analyze`: Conduct deep forensic reconstruction of evidence.
*   **Procedural Generation**: Admin-driven case generation with themes like *Noir*, *Modern*, and *Mansion*.
*   **Evidence System**: Collect, examine, and present physical evidence to suspects (Phoenix Wright style!).

### 🛠️ Additional Modules
*   **Daily Tips**: Automated community engagement and helpful server tips.
*   **Auto-Moderation**: Robust tools for maintaining server health.
*   **User Profiler**: Advanced activity tracking and user profiling.
*   **Web Dashboard**: Integrated API server (Express + Socket.io) for monitoring and management.

---

## 🚀 Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18+ recommended)
*   [SQLite3](https://sqlite.org/) (for local database)
*   Discord Bot Token & Application ID
*   Optional: [Google Generative AI API Key](https://ai.google.dev/) or a local [Ollama](https://ollama.com/) instance.

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/SherbotV2.git
    cd SherbotV2
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment**:
    Create a `.env` file in the root directory and populate it:
    ```env
    BOT_TOKEN=your_discord_bot_token
    CLIENT_ID=your_discord_client_id
    GEMINI_API_KEY=your_gemini_key (optional)
    N8N_WEBHOOK_URL=your_webhook (optional)
    DB_PATH=./database.sqlite
    ```

### Running the Bot

*   **Development Mode** (with hot-reload):
    ```bash
    npm run dev
    ```
*   **Build Project**:
    ```bash
    npm run build
    ```
*   **Production Start**:
    ```bash
    npm start
    ```

---

## 📜 Commands

### Player Commands (`/mm`)
| Command | Description |
| :--- | :--- |
| `/mm join/leave` | Join or leave the current investigation team. |
| `/mm status` | View the investigation clock and current funds. |
| `/mm look/search` | Inspect your current room and search for evidence. |
| `/mm dna/footage` | Use forensic tools to gather data (Costs pts). |
| `/mm examine` | Inspect evidence found in the case. |
| `/mm present` | Confront a suspect with evidence to increase pressure. |
| `/mm accuse` | Make a final verdict on the culprit. |

### Admin Commands (`/mma`)
| Command | Description |
| :--- | :--- |
| `/mma start` | Start a specific case from the database or files. |
| `/mma generate` | Procedurally create a new mystery case. |
| `/mma cleanup` | Remove all game-related channels/categories. |
| `/mma points` | Adjust the investigation funds. |

---

## 🏗️ Project Structure

```text
SherbotV2/
├── src/
│   ├── features/
│   │   ├── mm/          # Murder Mystery core logic
│   │   ├── ai.ts        # AI service integration
│   │   └── profiler.ts  # Activity tracking
│   ├── database.ts      # Sequelize models & initialization
│   ├── config.ts        # Environment configuration
│   └── index.ts         # Main entry point
├── data/                # Static case definitions (YAML)
├── public/              # Visual assets and thumbnails
└── package.json         # Dependencies and scripts
```

---

## 📄 License
This project is licensed under the **ISC License**.