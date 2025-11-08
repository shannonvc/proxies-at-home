# Angular Migration Plan for Proxxied

This document outlines the plan to migrate the Proxxied React application to Angular, following modern best practices such as standalone components, signals, and a zoneless architecture.

## 1. Project Setup

1.  **Create a new Angular workspace:**
    ```bash
    ng new proxxied-angular --standalone --routing --style=scss --ssr=false
    ```
    *   `--standalone`: Use standalone APIs.
    *   `--routing`: Create a routing module.
    *   `--style=scss`: Use SCSS for styling.
    *   `--ssr=false`: We can add SSR later if needed.

2.  **Install dependencies:**
    *   **UI Framework:** Since the project uses TailwindCSS and Flowbite, we will use the same.
        ```bash
        npm install -D tailwindcss postcss autoprefixer
        npx tailwindcss init
        ```
        Then, configure `tailwind.config.js` and `styles.scss`. We will also need to install `flowbite` and `flowbite-angular`.
    *   **State Management:** The current project uses Zustand. We will replace this with Angular's built-in signals
    *   **Drag and Drop:** The project uses `@dnd-kit`. We will use the Angular CDK's Drag and Drop module (`@angular/cdk/drag-drop`).
    *   **PDF Generation:** The project uses `jspdf` and `html2pdf.js`. We can continue to use these libraries.
    *   **Image Processing:** The project uses the `Canvas API` and `pdf-lib`. These are framework-agnostic and can be reused.
    *   **Other dependencies:**
        *   `axios` will be replaced with Angular's `HttpClient`.
        *   `file-saver` can be kept.
        *   `jszip` can be kept.
        *   `lucide-react` will be replaced with an Angular icon library like `angular-feather`.

## 2. Application Architecture

*   **Zoneless:** We will configure the application to be zoneless for better performance. This will be done in `main.ts`:
    ```typescript
    bootstrapApplication(AppComponent, {
      providers: [
        provideRouter(routes),
        provideZoneChangeDetection({ eventCoalescing: true, runCoalescing: true }),
      ],
    });
    ```
*   **Signals:** We will use signals for state management within components and services. This will be the primary way of managing state.
*   **Standalone Components:** All components, directives, and pipes will be standalone.
*   **Component Structure:** We will follow a similar component structure to the React application, but with an Angular-idiomatic approach.

## 3. Migration Steps

### Phase 1: Core Setup and Layout

1.  **Setup TailwindCSS and Flowbite:** Configure styling to match the current application.
2.  **Create the main layout:** Create a main `AppComponent` that will hold the main layout, including the header, sidebar, and main content area.
3.  **Setup routing:** Create the basic routes for the application. The main page will be the `ProxyBuilderPage`.

### Phase 2: Feature Migration

This will be an iterative process of migrating each feature from the React application to the new Angular application.

1.  **State Management (`/store`):**
    *   `settings.ts`: Create a `SettingsService` that uses signals to manage the application settings.
    *   `cards.ts`: Create a `CardsService` to manage the card list, including fetching, adding, and removing cards.
    *   `loading.ts`: Create a `LoadingService` to manage the loading state of the application.
    *   `artworkModal.ts`: Create a service to manage the state of the artwork modal.

2.  **Components (`/components`):**
    *   Migrate each React component to an Angular standalone component.
    *   Prioritize migrating the main components first, such as `PageView`, `UploadSection`, and `PageSettingsControls`.
    *   Replace React-specific hooks and libraries with Angular equivalents (e.g., `@dnd-kit` with `@angular/cdk/drag-drop`).

3.  **Helpers (`/helpers`):**
    *   The helper functions are mostly plain TypeScript and can be migrated with minimal changes.
    *   We will need to adapt the code that interacts with the DOM or framework-specific APIs.
    *   The web workers (`bleed.worker.ts`, `pdf.worker.ts`) can be reused. We will need to set up the Angular `web-worker` configuration.

4.  **Pages (`/pages`):**
    *   `ProxyBuilderPage.tsx`: This is the main page of the application. We will create a new `ProxyBuilderPageComponent` and compose it from the migrated components.

### Phase 4: Testing

1.  **Unit Tests:** Write unit tests for services and components using Jest (or the default Karma/Jasmine setup).
2.  **E2E Tests:** Write end-to-end tests using a framework like Cypress or Playwright to ensure the application works as expected.

## 4. Best Practices

*   **OnPush Change Detection:** All components will use `ChangeDetectionStrategy.OnPush`.
*   **Async Pipe:** We will use the `async` pipe to handle observables and promises in templates.
*   **Typed Forms:** We will use typed forms for all forms in the application.
*   **Lazy Loading:** We will lazy load feature modules and components where appropriate.

This plan provides a high-level overview of the migration process. Each step will require more detailed planning and execution.
