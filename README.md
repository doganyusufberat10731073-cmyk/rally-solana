⚡ Rally - Hybrid Web3 Event & Activity Platform

> Built for the Solana Colosseum Hackathon (Crypto World's Fair) & Superteam Türkiye x Arf University Track.

Rally is a hybrid Web3 dApp engineered for campus ecosystems, student clubs, and decentralized community building. It combines the high-speed querying, search, and indexing advantages of a Web2 backend with the trustless, immutable guarantees of a custom Solana on-chain program.



🚀 Key Features

- **Decentralized Event Verification:** Activities, capacity restrictions, and states are committed on-chain via Solana PDAs.
- **Sybil-Resistant & Trustless RSVPs:** Participants join using deterministic Program Derived Addresses, eliminating centralized manipulation and attendance spoofing.
- **High-Performance Hybrid Architecture:** A NestJS + PostgreSQL indexer tracks real-time chain events, offloading heavy search and filtering while Solana serves as the immutable source of truth.
- **Native Web3 Integration:** Seamless Phantom and Solflare wallet authentication with instant feedback and sub-second Devnet finality.



🏛️ Architecture & Responsibility Flow


┌───────────────────────┐
│ React 18 + Vite (UI)  │ ── 1. Sign Instruction ──► ┌─────────────────────────┐
│ @solana/wallet-adapter│                            │ Solana Anchor Program   │
└──────────┬────────────┘                            │ (Devnet Source of Truth)│
           │                                         └────────────┬────────────┘
     2. Send Hash & PDA                                           │
           │                                                      │
           ▼                                                      │
┌───────────────────────┐                                         │
│ NestJS + Prisma ORM   │ ◄────────── 3. Index & Verify ──────────┘
│ PostgreSQL Database   │
└───────────────────────┘

⚙️ Solana Smart Contract (Anchor)
Network: Solana Devnet

Program ID: DkzLzgXKWj6yXkBYbEJEfP9ZSeQgcJjYs2e4hGueEPaW

Framework: Anchor (Rust)

Program Derived Accounts (PDAs)
Activity Account:

Seeds: ["activity", creator_pubkey, activity_id.to_le_bytes()]

Data: creator, activity_id, max_participants, current_participants, status, bump

Participant Account:

Seeds: ["participant", activity_account_pubkey, user_pubkey()]

Data: activity, user, joined_at, bump

On-Chain Instructions
create_activity: Initializes the activity account and sets capacity bounds.

join_activity: Derives a participant PDA, verifies capacity constraints, and increments participant count.

leave_activity: Closes participant PDA, refunds rent lamports, and decrements count.

cancel_activity: Restricts execution to the creator to cancel the event.

complete_activity: Marks event state as completed on-chain.

📂 Repository Structure
Plaintext
├── programs/rally/       # Anchor smart contract source code (Rust)
├── tests/                # Anchor integration tests
├── rally-backend/        # NestJS API, Prisma schema, indexer, and database logic
├── rally/                # React (TypeScript) + Vite frontend with Tailwind CSS
├── Anchor.toml           # Anchor workspace configuration
└── Cargo.toml            # Rust workspace dependencies

🛠️ Local Development Setup

Prerequisites
Node.js (v18+)

Rust & Cargo

Solana CLI (v1.18+)

Anchor CLI (v0.30+)

PostgreSQL

1. Backend Setup

cd rally-backend
npm install
npx prisma migrate dev --name init
npm run start:dev

2. Frontend Setup

cd rally
npm install
npm run dev

3. Smart Contract Verification

To inspect or test the deployed Solana program locally:

anchor test

👥 Team:

Yusuf Berat Doğan - Core Architecture, Smart Contracts & Integration

Zehra Aydoğdu - Full-Stack Engineering & Frontend Integration