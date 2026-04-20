# AxonHR | Workflow Designer Prototype

<img src="./public/docs/logo.png" width="180" alt="AxonHR Logo" />

## Project Overview
AxonHR is a high-fidelity workflow automation designer built for the HR Automation Case Study. This document outlines how all project deliverables and functional requirements have been satisfied.

---

## 1. Deliverables Checklist
The following components are present in the provided repository:
*   [x] **React Application**: Built with React 18 and Vite for optimized performance.
*   [x] **React Flow Canvas**: A highly interactive workspace featuring 12+ custom node types.
*   [x] **Node Configuration Forms**: Type-safe, dynamic editing panels for every node type.
*   [x] **Mock API Integration**: A lightweight async API layer simulating backend services.
*   [x] **Sandbox Simulation Panel**: A dedicated environment for graph testing and execution logs.
*   [x] **Architecture Documentation**: Comprehensive README detailing design choices and stack.

---

## 2. Functional Requirements
The prototype fulfills all technical specifications for the HR Workflow Designer:

### 2.1 Workflow Canvas Actions
![Canvas Interface](./public/docs/req_canvas.png)
*   **Drag & Drop**: Seamlessly add nodes from the categorized sidebar.
*   **Edge Connectivity**: Create logical connections between HR steps.
*   **State Management**: Select nodes for focused editing via the Side Panel.
*   **Lifecycle Control**: Full support for node/edge deletion and canvas clearing.
*   **Real-time Validation**: Background constraints (e.g., ensuring a Start node exists).

### 2.2 Node Configuration Details (Key Requirement)
Every node features a specialized editing form with controlled components and Zod validation:

| Node Type | Implementation Detail |
| :--- | :--- |
| **Start Node** | Configurable Title and Metadata (Key-Value Editor). |
| **Task Node** | Title (Req), Description, Assignee, and Date integration. |
| **Approval Node** | Manager/HRBP/Director Role selection + Auto-Approve Threshold. |
| **Automated Step** | Action selection from API list + Dynamic Parameter generation. |
| **End Node** | Custom End Message + Performance Summary Toggle flag. |

---

## 3. Mock API Layer Implementation
A lightweight API client is implemented in `src/api/client.ts` to simulate microservices:

*   **`GET /automations`**: Returns a list of mock automated actions (Send Email, Generate Doc, etc.) with their required parameters. These define the dynamic UI of the Automated Step nodes.
*   **`POST /simulate`**: Receives the serialized workflow JSON and returns a step-by-step mock execution trace.

---

## 4. Sandbox Simulation
![Simulation Results](./public/docs/Sandbox.png)

The **Sandbox Simulation** panel facilitates end-to-end workflow testing:
*   **Graph Serialization**: Converts the React Flow state into a clean JSON structure for API transfer.
*   **Validation Engine**: Detects structural errors (loops, orphaned nodes) before execution.
*   **Execution Log**: Provides a timeline UI showing a step-by-step trace of node statuses and durations.
*   **Logic Sorting**: Uses **Topological Sorting** to ensure nodes are executed in the correct dependency order.

---

## 5. Architectural Standards
The project is designed with scalability and modularity as core priorities:
*   **Folder Structure**: Clear separation between `components`, `store`, `types`, and `api`.
*   **Logic Separation**: Canvas state (React Flow) is decoupled from data logic (Zustand) and API mocks.
*   **Reusable Abstractions**: The `NodeShell` component and `NODE_REGISTRY` allow for effortless addition of new node types.
*   **Type Safety**: Comprehensive TypeScript interfaces for all nodes, edges, and simulation results.

---

## 6. Premium "Power User" Features (Add-ons)

### Spotlight Command Center (`⌘K`)
![Spotlight Search](./public/docs/SpotlightSearch.png)
A unified command palette that allows for instant node insertion, template application, and canvas navigation.

### Natural Language "Quick Build"
![Quick Build](./public/docs/QuickBuild.png)
An innovative text-to-graph parser that transforms semantic input (e.g., `Start -> Task -> Approval -> End`) into functional graph structures.

### Intelligence Summary Cloud
![Summary Cloud](./public/docs/Summary.png)
A context-aware summary engine that translates complex graph logic into human-readable project briefs on hover.

### Global Templates Library
![Templates Library](./public/docs/Templates.png)
Pre-configured HR patterns (Onboarding, Leave Approval) that can be applied with a single click via the templates menu.

---

## 7. Operational Guide

| Shortcut | Action |
| :--- | :--- |
| `⌘K` | Command Palette (Search/Build) |
| `⌘Z` / `⌘Y` | Undo / Redo timeline |
| `S` / `P` | Selection / Pan Mode |
| `Del` | Delete selected element |
| `Esc` | Clear selection |

### Local Setup
1. `npm install`
2. `npm run dev`
3. Open `http://localhost:5173`
