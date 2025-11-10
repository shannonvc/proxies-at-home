# Gemini Notes: Proxxied Migration

## Project Overview

*   **Project:** Proxxied - A web-based MTG proxy printing tool.
*   **URL:** https://proxxied.com
*   **Core Functionality:**
    *   Import decklists.
    *   Fetch card images from Scryfall.
    *   Arrange cards on a 3x3 grid. (Defaul, custom layouts supported)
    *   Drag and drop cards to rearrange.
    *   Customize bleed edges and cut guides.
    *   Export to a high-resolution PDF.
*   **Current Tech Stack (Client):**
    *   React, TypeScript, Vite
    *   TailwindCSS, Flowbite
    *   Zustand for state management
    *   `@dnd-kit` for drag and drop
    *   `jspdf`, `html2pdf.js`, `pdf-lib` for PDF generation
    *   Canvas API for image processing

## Migration Goal

*   **Target Framework:** Angular (v20+)
*   **Key Principles:**
    *   **Zoneless:** For improved performance.
    *   **Signals:** For modern, fine-grained state management.
    *   **Standalone Components:** For a more modular and streamlined architecture.
    *   **Best Practices:** Adhere to modern Angular standards.
    *   **Signal View Queries:** Use `viewChild`, `viewChildren`, `contentChild`, `contentChildren` for querying elements.
    *   **New Control Flow:** Prefer `@for`, `@if`, `@switch` over `*ngFor`, `*ngIf`, `*ngSwitch`.

## Migration Plan Summary

1.  **Setup:**
    *   New Angular workspace (`ng new`).
    *   Install and configure TailwindCSS and Flowbite.
    *   Identify and install Angular equivalents for key libraries:
        *   `@angular/cdk/drag-drop` (for `@dnd-kit`)
        *   `HttpClient` (for `axios`)
        *   Angular icon library (for `lucide-react`)
        *   Keep framework-agnostic libraries (`jspdf`, `jszip`, `pdf-lib`).

2.  **Architecture:**
    *   Implement a zoneless application bootstrap.
    *   Use signals as the primary state management tool.
    *   Convert React components to Angular standalone components.
    *   Re-create services (`SettingsService`, `CardsService`) using signals.

3.  **Execution Phases:**
    *   **Phase 1: Core & Layout:** Set up the basic app shell, styling, and routing.
    *   **Phase 2: Feature Migration:** Iteratively migrate components, services, and helpers.
    *   **Phase 3: Testing:** Write unit and E2E tests.

4.  **Key Files:**
    *   The main migration plan is located in `ANGULAR_MIGRATION_PLAN.md`.
    *   The original React application is in the `/client` directory.

5.  **Verify (Standards):** VERY IMPORTANT: After making code changes, execute the project-specific build, linting and type-checking commands (e.g., 'tsc', 'npm run lint', 'ruff check .') that you have identified for this project (or obtained from the user). This ensures code quality and adherence to standards. If unsure about these commands, you can ask the user if they'd like you to run them and if so how to.
    *   **Note:** When verifying Angular applications, use `ng build` instead of `ng serve` to check for compilation errors in a non-interactive environment.
