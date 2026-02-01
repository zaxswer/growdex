# Growdex

**Real-Time DeFi Intelligence Hub**

Growdex is a cutting-edge platform that provides real-time APY (Annual Percentage Yield) tracking for leading stablecoins on the Aave Protocol. Built for traders and DeFi enthusiasts who need instant access to supply and borrow rates to make informed decisions.

![Growdex](public/dark_wordmark.png)

---

## 🌟 Features

### Real-Time Data Monitoring
- **Live APY Tracking**: Monitor supply and borrow APY rates updated in real-time from Aave smart contracts
- **WebSocket Integration**: Instant updates without page refreshes for seamless user experience
- **Multi-Token Support**: Track USDT, USDC, USDe, and crvUSD stablecoins simultaneously

### Intelligent Analytics
- **Risk Assessment**: Each token displays risk levels (low/medium/high) to help users understand safety profiles
- **Smart Recommendations**: AI-powered insights provide actionable trading suggestions based on market conditions
- **Historical Data**: Access historical APY trends through the backend data retention system

### Modern User Experience
- **Responsive Design**: Fully optimized for desktop and mobile devices
- **Dark Theme**: Beautiful glassmorphism UI with signature pink accent colors
- **Real-Time Status**: Live connection indicators show data feed status at all times

---

## 🏗️ Architecture

### Frontend
Built with **Next.js 16** and **TypeScript**, the frontend provides a modern, responsive interface:

- **Home Page**: Hero section showcasing the platform with tracked token display
- **About Page**: Comprehensive information about Growdex features and functionality
- **APY Dashboard**: Real-time table displaying current supply and borrow rates

### Backend Services

#### WebSocket Server
- Manages real-time client connections
- Broadcasts APY updates via Redis pub/sub
- Supports subscription management for specific tokens
- Handles historical data queries

#### Blockchain Listener
- Monitors Aave Protocol smart contracts on Ethereum mainnet
- Listens for `ReserveDataUpdated` events
- Converts on-chain rates to human-readable APY percentages
- Stores data in Redis with automatic cleanup

#### Data Layer
- **Redis**: High-performance data storage for current and historical APY data
- **Pub/Sub**: Real-time message broadcasting between services
- **7-Day Retention**: Automatic historical data management

---


## 🚀 Getting Started

### Prerequisites

- **Bun** (latest version) - Fast JavaScript runtime and package manager
- **Redis** - In-memory data store
- **Ethereum Node** - WebSocket connection to Ethereum mainnet (e.g., Infura, Alchemy)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd growdex
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Ethereum WebSocket URL
   ETH_WS_URL=wss://mainnet.infura.io/ws/v3/YOUR_PROJECT_ID
   
   # Redis Connection
   REDIS_URL=redis://localhost:6379
   
   # WebSocket Server Port
   WS_PORT=8080
   ```

### Running the Application

#### Start Redis


#### Start Redis
```bash
redis-server
```

#### Start the Blockchain Listener
```bash
bun run backend/blockchain-listener.ts
```

This service connects to Ethereum mainnet and monitors Aave smart contracts for APY updates.

#### Start the WebSocket Server
```bash
bun run backend/websocket-server.ts
```

The WebSocket server will start on port 8080 (or your configured WS_PORT).

#### Start the Frontend Development Server
```bash
bun dev
```

The application will be available at `http://localhost:3000`

---

## 📊 Tracked Assets

Growdex currently monitors the following stablecoins on Aave Protocol:

| Asset | Contract Address | Type |
|-------|-----------------|------|
| **USDT** (Tether) | `0xdAC17F958D2ee523a2206206994597C13D831ec7` | Stablecoin |
| **USDC** (USD Coin) | `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` | Stablecoin |
| **USDe** | `0x4c9EDD5852cd905f086C759E8383e09bff1E68B3` | Synthetic Dollar |
| **crvUSD** | `0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E` | Curve Stablecoin |

All rates are fetched from the **Aave V3 Pool** contract at:
`0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2`

---

## 🛠️ Technology Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Hooks** - State management and side effects

### Backend
- **Bun** - Fast JavaScript/TypeScript runtime
- **Ethers.js** - Ethereum library for smart contract interaction
- **WebSocket (ws)** - Real-time bidirectional communication
- **Redis (ioredis)** - In-memory data structure store
- **dotenv** - Environment variable management

### Smart Contracts
- **Aave Protocol V3** - Decentralized lending protocol
- **Ethereum Mainnet** - Layer 1 blockchain network

---

## 📡 WebSocket API

### Connection
Connect to the WebSocket server:
```javascript
const ws = new WebSocket('ws://localhost:8080');
```

### Message Types

#### Request Current APY
```json
{
  "type": "current"
}
```

**Response:**
```json
{
  "type": "current",
  "data": {
    "USDT": {
      "supply": 2.65,
      "borrow": 4.06,
      "timestamp": 1707000000000
    },
    "USDC": { ... },
    "USDe": { ... },
    "crvUSD": { ... }
  }
}
```

#### Subscribe to Specific Tokens
```json
{
  "type": "subscribe",
  "tokens": ["USDT", "USDC"]
}
```

#### Real-Time Updates
Automatically received when subscribed:
```json
{
  "type": "update",
  "data": {
    "token": "USDT",
    "supply": 2.65,
    "borrow": 4.06,
    "supplyDelta": 0.05,
    "borrowDelta": -0.02,
    "timestamp": 1707000000000
  }
}
```

#### Request Historical Data
```json
{
  "type": "history",
  "token": "USDT",
  "hours": 24
}
```

---

## 🎨 Design Philosophy

Growdex embraces a modern Web3 aesthetic with:

- **Dark Mode First**: Elegant dark theme optimized for extended viewing
- **Glassmorphism**: Frosted glass effects with backdrop blur
- **Pink Accents**: Signature `#fe1f70` brand color for emphasis
- **Grid Patterns**: Subtle tech-inspired background elements
- **Smooth Animations**: Polished transitions and hover effects
- **Mobile-First**: Responsive design that works seamlessly on all devices

---

## 🏗️ Project Structure

```
growdex/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Home page with hero section
│   ├── about/               # About page
│   │   └── page.tsx
│   ├── apy/                 # APY dashboard
│   │   └── page.tsx
│   ├── components/          # Reusable components
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── globals.css          # Global styles and animations
│   └── layout.tsx           # Root layout component
├── backend/                 # Backend services
│   ├── blockchain-listener.ts  # Aave contract monitor
│   ├── websocket-server.ts     # WebSocket server
│   ├── types.ts                # Shared TypeScript types
│   └── frontend-client.ts      # Frontend utilities
├── public/                  # Static assets
│   ├── dark_logo.png
│   ├── dark_wordmark.png
│   └── hero video.mp4
└── package.json
```

---

## 📈 Data Flow

1. **Blockchain Listener** monitors Aave smart contracts for `ReserveDataUpdated` events
2. When an event is detected, it converts the on-chain rate to APY percentage
3. Updated APY data is stored in **Redis** with timestamp
4. A message is published to Redis pub/sub channel
5. **WebSocket Server** receives the pub/sub message
6. Server broadcasts the update to all subscribed **Frontend Clients**
7. React components update the UI in real-time without page refresh

---

## 🔧 Configuration

### Redis Keys Structure
- Current APY: `aave:apy:{token}` (hash)
- Historical Data: `aave:history:{token}` (sorted set)
- Pub/Sub Channel: `aave:updates`

### Data Retention
- Historical data is automatically cleaned up after 7 days
- Current APY values are always available
- Cleanup runs periodically in the blockchain listener

---

## 🎯 Use Cases

### For Traders
- Monitor real-time lending rates across multiple stablecoins
- Identify optimal yield farming opportunities
- Track borrow costs for leveraged positions

### For DeFi Enthusiasts
- Understand Aave Protocol rate dynamics
- Analyze supply and demand trends
- Research stablecoin performance

### For Developers
- Reference implementation for Aave Protocol integration
- WebSocket architecture for real-time blockchain data
- Next.js and TypeScript best practices

---

## 🤝 Credits

**Developed by [EXPOSE](https://expose.software)**  
For **MERGE CONFLICT** hackathon by **.mdg**

---

## 💡 Technical Highlights

### Smart Contract Integration
- Direct interaction with Aave V3 Pool contract
- Event-based monitoring for efficient data updates
- Automatic retry logic for network resilience

### Performance Optimizations
- Redis caching for instant data access
- WebSocket connections for minimal latency
- Efficient state management in React

### Developer Experience
- TypeScript for type safety
- Bun for fast build and runtime
- Hot reload for rapid development
- Consistent code formatting

---

## 🐛 Troubleshooting

### WebSocket Connection Issues
If you see "WebSocket Connection Issue" on the APY page:

1. Ensure the WebSocket server is running:
   ```bash
   bun run backend/websocket-server.ts
   ```

2. Check if Redis is running:
   ```bash
   redis-cli ping
   ```
   Should return `PONG`

3. Verify the blockchain listener is connected:
   - Check terminal output for "Connected to Ethereum WebSocket"
   - Ensure your `ETH_WS_URL` is valid

### No Data Showing
If APY values show as "< 0.01%":

1. Wait for the first blockchain event (may take a few minutes)
2. Check Redis for data:
   ```bash
   redis-cli HGETALL aave:apy:USDT
   ```
3. Verify your Ethereum node connection is working

### Build Errors
If you encounter build errors:

1. Clear Next.js cache:
   ```bash
   rm -rf .next
   ```

2. Reinstall dependencies:
   ```bash
   rm -rf node_modules
   bun install
   ```

---

## 📚 Learn More

### Aave Protocol
- [Aave Documentation](https://docs.aave.com/)
- [Aave V3 Smart Contracts](https://github.com/aave/aave-v3-core)

### Technologies
- [Next.js Documentation](https://nextjs.org/docs)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [Redis Documentation](https://redis.io/docs/)
- [Bun Documentation](https://bun.sh/docs)

---

**Built with ❤️ for the DeFi community**

