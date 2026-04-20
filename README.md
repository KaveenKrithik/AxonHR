# AxonHR | Workflow Designer Prototype

<img src="./public/docs/logo.png" width="180" alt="AxonHR Logo" />

## Introduction
The AxonHR Workflow Designer is a high-fidelity prototype developed specifically for the HR Automation Case Study. This application enables HR professionals to design, validate, and simulate complex operational workflows through a modern, interactive canvas interface.

---

## 1. Functional Requirements Compliance
The application satisfies all core requirements specified in the project brief:

### Core Node Registry
*   **Trigger (Start)**: Customizable entry point for onboarding or leave triggers.
*   **Decision (Approval)**: Multi-path logic supporting Manager, HRBP, and Director roles.
*   **Human Step (Sign-off)**: Targeted approvals requiring explicit human interaction.
*   **Integration (Slack/Email)**: Pre-configured nodes for automated communication.
*   **Automated Action**: Dynamic tasks linked to the mock API layer.
*   **Termination (End)**: Secure exit points with intelligence summary flags.

### Data Management & Configuration
*   **Reactive Sidebar**: Context-aware property sheets for each node type.
*   **Type-Safe Forms**: Built with Zod validation to ensure data integrity.
*   **Graph Persistence**: Full serialization support for saving and loading complex states.
*   **Visual Logic**: Automated "Yes/No" branch generation for decision nodes.

---

## 2. Advanced Feature Suite (Value Adds)
In addition to the core requirements, several "Power User" features have been implemented to elevate the designer to a $10M SaaS-grade experience:

### Spotlight Command Center (`⌘K`)
![Spotlight Search](./public/docs/SpotlightSearch.png)
A unified command palette that allows for instant node insertion, template application, and canvas navigation.

### Natural Language "Quick Build"
![Quick Build](./public/docs/QuickBuild.png)
An innovative text-to-graph parser that allows users to type flows like `Start -> Task -> Approval -> End` to generate functional workflows instantly.

### Tredence Intelligence Summary
![Summary Cloud](./public/docs/Summary.png)
A context-aware summary engine that translates complex graph logic into human-readable project briefs on hover.

---

## 3. Technical Architecture & Mock API Layer

To ensure the prototype behaves like a production system, a lightweight **Mock API Layer** has been implemented in `src/api/client.ts`. This layer facilitates all data-driven interactions within the designer.

### API Endpoints Implementation
*   **`GET /automations`**: 
    *   **Purpose**: Providing dynamic metadata for automated workflow steps.
    *   **Payload**: Returns an array of action objects (e.g., `send_email`, `generate_doc`) each defining its required parameters.
    *   **Integration**: The `AutomationNode` dynamically generates its configuration form based on this response.
*   **`POST /simulate`**:
    *   **Purpose**: Processing and validating the complete workflow state.
    *   **Logic**: The mock endpoint receives the full JSON representation of the canvas (nodes and edges) and performs **Topological Sorting** to determine the valid execution sequence.
    *   **Response**: Returns a step-by-step execution log including node-level status (`passed`, `failed`, `skipped`) and simulated durations.

### Simulation Engine & Logic
![Simulation Sandbox](./public/docs/Sandbox.png)
The simulation logic is built on a directed acyclic graph (DAG) model:
1.  **Validation**: Every simulation request triggers a graph integrity check (cycles, orphans, start/end node presence).
2.  **Topological Sort**: Determines the logical order of HR operations.
3.  **Step Execution**: Cycles through the ordered nodes, applying business rules (like auto-approval thresholds) to generate the final simulation trace.

---

## 4. Frontend Stack & State Management

### Essential Keyboard Shortcuts
| Shortcut | Action |
| :--- | :--- |
| `⌘K` | Toggle Spotlight Search / Command Palette |
| `⌘Z` | Undo last canvas action |
| `⌘Y` | Redo last canvas action |
| `S` | Enable Selection Mode |
| `P` | Enable Pan (Hand) Mode |
| `Del` | Delete selected node/edge |
| `Esc` | Deselect current node |

### Local Setup
1.  **Extract** the project archive.
2.  **Install**: Run `npm install` in the project root.
3.  **Launch**: Run `npm run dev` to start the development server.
4.  **Access**: Navigate to `http://localhost:5173`.

---

Developed by the AxonHR Engineering Team for Tredence Analytics.
