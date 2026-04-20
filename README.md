# AxonHR | Workflow Builder for HR

![AxonHR Brand](./public/docs/logo.png)

> **"HR automation shouldn't feel like a spreadsheet. It should feel like a superpower."**

AxonHR is my take on the future of internal HR operations. Instead of static forms and rigid flows, I've built a dynamic, keyboard-first environment where HR admins can draft, validate, and simulate complex workflows with the speed of a software engineer.

---

## 🎨 The Vision: Speed + Precision

I built AxonHR around a single core philosophy: **Frictionless Creation**. Every design decision—from the "Greptile Green" aesthetic to the sub-pixel grid canvas—was made to ensure that the interface disappears, leaving only the logic behind.

### ⚡ Power-User Command Center
![Spotlight Search](./public/docs/SpotlightSearch.png)
The heart of the app is the **Spotlight Search (`⌘K`)**. Inspired by tools like Raycast and Linear, it’s not just a search bar—it’s a command palette. You can search for nodes, apply templates, or use the **Quick Build** feature to transform a single line of text into a multi-node workflow instantly.

### ✨ AI-Driven "Quick Build"
![Quick Build Action](./public/docs/QuickBuild.png)
Why drag-and-drop when you can just type? With the **Quick Build** feature, I've implemented a natural language parser that understands flow semantics. Type `Start -> Verify Document -> Approval -> End` and watch the canvas populate itself.

---

## 🏗️ Technical Foundation

### The Canvas Engine
![Canvas Overview](./public/docs/req_canvas.png)
Built on **React Flow**, the canvas handles hundreds of nodes with ease. I've implemented:
*   **Topological Sorting**: The engine understands the "execution order" of your graph, not just the visual layout.
*   **Hotkeys for Everything**: `S` for Select, `P` for Pan, `Del` to prune. The **Shortcuts Legend** in the bottom-right keeps the power at your fingertips.

### Deep Configuration
![Node Config](./public/docs/req_forms.png)
Every node is a specialized HR unit. Whether it's setting an **Auto-Approve Threshold** on an Approval node or configuring dynamic parameters for a **Mock API action**, the sidebar responds instantly to your selection with type-safe, validated forms.

---

## 🧠 Intelligence & Analytics

### The Summary Cloud
![Intelligence Report](./public/docs/Summary.png)
HR logic can get complex. That’s why I added the **Summary Cloud**. Hover over the canvas to reveal a high-level plain-English breakdown of your entire workflow. One click lets you copy the summary to your clipboard for status updates or documentation.

### Ready-to-Go Templates
![Workflow Templates](./public/docs/Templates.png)
I've pre-loaded the system with standard HR patterns (Onboarding, Leave Approval, Offboarding). These aren't just static images—they are fully functional, interactive graphs that you can apply with a single click.

---

## 🛠️ How to Run

1.  **Clone** the repository.
2.  **Install**: `npm install`.
3.  **Launch**: `npm run dev`.
4.  **Explore**: Open `http://localhost:5173`. Use **`⌘K`** to start your first flow.

---

## 💡 Final Thoughts on Architecture

*   **State**: I chose **Zustand + Immer** for a lightweight yet robust state management system that supports infinite Undo/Redo.
*   **Validation**: Every time you move a node, a background validator checks for orphaned edges, missing connections, or logic loops.
*   **Branding**: The "Greptile Green" theme isn't just for show; it provides the high contrast needed for long-duration technical work.

Developed with ❤️ for the Tredence Analytics HR Ops Team.
