# AxonHR - HR Workflow Designer Module

Welcome to **AxonHR**, a production-grade HR Workflow Designer module built with React and React Flow. This prototype enables HR administrators to visually create, validate, and simulate complex internal workflows (like employee onboarding, leave approvals, and offboarding).

This was developed as the assignment for the **Tredence Studio AI Engineering Internship (2025 Cohort)**.

## Architecture & Tech Stack

This project is built to simulate a high-quality SaaS workflow builder with strict modularity.

- **Frontend Core**: React 18 with TypeScript. Bootstrapped with Vite.
- **Canvas Engine**: `reactflow` (v11) handling DAG layout, edge routing, dragging, and selection.
- **State Management**: `zustand`. The `workflowStore` holds the canvas state (nodes, edges) and encapsulates logic to update deeply nested node configurations, undo/redo tracking, and execution statuses.
- **UI Framework**: Tailwind CSS providing a custom "Zapier-inspired" dark UI shell wrapped around a clean white canvas.
- **Mock API Layer**: A standalone REST-like local mock client (`src/api/client.ts`) that realistically mimics `GET /automations` and POST `simulate`.

## Folder Structure

The project has strict separation between canvas logic, panel states, and API mocks:

```text
src/
├── api/             # Local mock API layer (simulates fetching actions and running logic)
├── components/
│   ├── canvas/      # React Flow provider, canvas settings
│   ├── nodes/       # Node visual definitions (shape adjustments, custom badge shells)
│   ├── panels/      # Right-side dynamic Configuration Form, Sandbox Simulator UI
│   ├── sidebar/     # Drag & drop Library, Templates Modal, Spotlight Search
│   └── ui/          # Generic atomic components
├── store/           # Zustand stores (workflow state, UI state variables)
├── types/           # Strict definitions for node schemas (TypeScript)
└── utils/           # Graph topology validator (cycles, isolated nodes checker)
```

## How to Run

1. Clone the repository natively.
2. Install dependencies (Node environment required) using npm, bun, or yarn:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the web app mapped by the console (usually `http://localhost:8080/` or `5173`).

## Key Features & Design Decisions

- **Dynamic Node Forms**: Clicking any node opens a dynamic right-side config panel that adjusts precisely based on Node type (e.g., metadata Key-Values for 'Start', Automation Actions for 'System', thresholds for 'Approval'). Validations dynamically appear inline.
- **Topological Simulation Layer**: The Sandbox maps out the drawn generic graph, passes it to the `POST /simulate` mock API which strictly topologically sorts the DAG, processes threshold parameters, and steps through the response data array.
- **Smart Validation Engine**: The sandbox actively halts simulations if there are cyclical loops or isolated nodes detached from the Start node. Custom warnings pinpoint directly to the failing node ID.
- **UX Innovation**: Implemented an Omni-bar spotlight search (`Cmd+K`), completely custom styled scrollbars, a Zapier-styled bottom-float palette, animated Auto-refitting viewport on template load, and "Diamond" logic forks to exceed baseline UX requirements visually.

## What's Completed vs. Future Additions

**✅ Completed (Meeting Core Requirements):**
- Drag-and-drop workflow canvas with exact required custom nodes.
- Full suite of dynamic configuration forms targeting custom configurations per node type.
- Functional simulated `/simulate` and `/automations` API endpoints mapping.
- Working Sandbox testing panel tracking step-by-step histories natively.
- *Bonus functionality completed*: Export/Import JSON, Node Templates loaded out of the mock, Undo/Redo Engine, Minimap, Spotlight feature.

**🚀 What I would add with more time:**
- **Auto-layout algorithm**: Integrate `dagre-js` or `elkjs` to organize messy canvas graphs instantly into a neat top-down flow with a "Clean up" button.
- **Backend Persistence**: Connect to a proper PostgreSQL instance via Prisma/TRPC.
- **Real-time Collaboration**: Tie the absolute x/y node coordinates into WebSockets or CRDTs (like Yjs) so two HR Admins can pair-edit workflows simultaneously.
