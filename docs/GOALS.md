# UniKanban — Goals

## Overview

UniKanban is a Kanban board application built with the **Unapi** pattern.
It serves as both a useful productivity tool and a reference implementation demonstrating how to build self-documented, type-safe, transport-agnostic APIs in TypeScript/JavaScript.

## What is Unapi?

Unapi is a way of describing APIs for your services, UI widgets, and forms in a self-documented way.
It insists on a **single source of truth** for your API docs and types.

You define your API once — the schema, types, validation, and documentation all live together.
Everything else (CLI, MCP, HTTP server, OpenAPI docs) is generated or derived automatically.

## Core Principles

### 1. CLI as a thin wrapper
Your CLI application should be a thin wrapper around your API, generating docs on the fly including `--help`.
We use [yargs](https://yargs.js.org/) for CLI scaffolding — commands, options, and help text are derived from Unapi definitions, not hand-written.

### 2. End-to-end type safety
Your TypeScript application should always have correct types for the backend, similar to [tRPC](https://trpc.io/).
Types are inferred from Unapi definitions — no code generation, no manual synchronization.

### 3. MCP as a thin wrapper
Your [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) server should be a thin wrapper around your API.
Tools, resources, and prompts are derived from the same Unapi definitions.

### 4. Auto-generated API docs
You can easily generate [OpenAPI](https://www.openapis.org/) or [AsyncAPI](https://www.asyncapi.com/) documentation from your Unapi definitions.

### 5. Transport agnostic
We should be able to use different transports for communication:
- **HTTP** — REST and WebSocket
- **stdio** — for CLI and MCP integrations
- **IPC** — for inter-process communication

### 6. Streaming capabilities
Not only REST request/response but also pub/sub.
Real-time updates (e.g. board changes) are first-class citizens, not an afterthought.

## Modes of Operation

UniKanban can run in multiple modes:

| Mode | Runtime | Description |
|------|---------|-------------|
| **Headless** | Node.js | Programmatic usage — import the client library and call API directly |
| **CLI** | Node.js | Send commands via terminal, auto-generated from Unapi definitions |
| **Browser** | Browser | Web-based Kanban board UI |
| **TUI** | Terminal | Terminal UI for the Kanban board |

Users should be able to work with this app by either importing the client library or using the CLI interface.

## Architecture Vision

```
┌─────────────────────────────────────────────────┐
│                  Unapi Definitions               │
│         (schema, types, validation, docs)        │
└──────────────────────┬──────────────────────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
    ┌──────────┐ ┌──────────┐ ┌──────────┐
    │   CLI    │ │   MCP    │ │  HTTP    │
    │ (yargs)  │ │ (stdio)  │ │ (REST/  │
    │          │ │          │ │  WS)    │
    └──────────┘ └──────────┘ └──────────┘
          │            │            │
          └────────────┼────────────┘
                       ▼
              ┌────────────────┐
              │  Kanban Domain │
              │  (Board, Col,  │
              │   Card, etc.)  │
              └────────────────┘
```

Each transport layer is a thin adapter — the business logic and API contract live entirely in the Unapi definitions and the domain layer.
