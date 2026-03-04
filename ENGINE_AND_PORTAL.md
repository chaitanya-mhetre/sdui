# Engine-Level Tasks: Preview, Validation, Portal, Flutter SDK

This doc covers **engine-level** behaviour: how the preview renders, how code is validated before publishing, how the app connects to the portal, and how the **Flutter package** (outside this repo root) works with the portal.

---

## 1. Preview UI rendering

- **Single source of truth:** The editor uses one tree, **`rootNode`** (builder format: `componentType`, `props`, `children`), for both **Design** and **Code** views.
- **Design view:** Canvas uses `LayoutRenderer` with `rootNode` inside `DeviceFrame`. Drag-and-drop and property edits update `rootNode`.
- **Code view:** The code editor shows **Stac-style JSON** (serialized `rootNode` via `layoutToCode`). Edits are parsed with `codeToLayout` and applied to `rootNode`. The **preview panel** on the right uses the same pipeline: `PreviewCanvas` receives `rootNode` and renders it with `LayoutRenderer` inside `DeviceFrame` — so Design and Code previews match.
- **Component types:** The renderer normalizes REXA-style names (e.g. `scaffold`, `app_bar`) to registry IDs (`Scaffold`, `AppBar`) so both builder and REXA-style JSON render correctly. See `lib/renderer.tsx` (`REXA_TYPE_TO_REGISTRY`, `normalizeComponentType`).

**Relevant files:** `lib/renderer.tsx`, `lib/layoutCode.ts`, `components/builder/Canvas.tsx`, `components/builder/CodeView.tsx`, `components/builder/PreviewCanvas.tsx`, `store/builderStore.ts`.

---

## 2. Code / layout validation before publishing

- **When:** Validation runs **before** the Publish API is called and **again** on the server when publishing.
- **Client (Toolbar):**
  1. User clicks **Publish**.
  2. If there is no `rootNode`, the user is told to add content; no request is sent.
  3. `rootNode` is converted to REXA with **`builderRootToRexaJson`** (`lib/builderToRexa.ts`).
  4. **`validateRexaJson`** (`lib/rexa/validation.ts`) runs on that REXA payload (max depth 20, max nodes 500, required `type` field, known widget types).
  5. If validation fails, an alert shows the error and Publish is aborted.
  6. If there are only warnings, a confirm dialog asks whether to continue; then the request is sent with `rootNode`.
- **Server (publish route):**
  1. Accepts either **`rexaJson`** (REXA format) or **`rootNode`** (builder format).
  2. If **`rootNode`** is sent: converts to REXA with **`builderRootToRexaJson`**, then validates with **`validateRexaJson`**.
  3. If **`rexaJson`** is sent: validates as-is.
  4. If validation fails → 422 with message; otherwise the REXA JSON is stored in `LayoutVersion` and served to the Flutter SDK.

So: **proper validation before publishing** is done both in the UI (so the user sees errors immediately) and on the server (so invalid payloads are never stored).

**Relevant files:** `lib/builderToRexa.ts`, `lib/rexa/validation.ts`, `components/builder/Toolbar.tsx` (handlePublish), `app/api/layouts/[id]/publish/route.ts`.

---

## 3. How the app connects to the portal

- **Portal** = this Next.js app (dashboard, editor, APIs). Users sign in (Clerk), create projects, open the editor, design screens, save, and publish.
- **Flow:**
  1. **Dashboard** → list projects → open a project.
  2. **Editor** (`/dashboard/editor/[projectId]`) → Design or Code view, edit `rootNode`, Save (PATCH `/api/layouts/:id` with `rootNode`), Publish (POST `/api/layouts/:id/publish` with `rootNode` or `rexaJson`).
  3. **Publish** converts (if needed) to REXA, validates, and writes to **LayoutVersion** (immutable snapshot). The layout is then served at **GET `/api/v1/screens/:screenName?apiKey=:projectApiKey`**.
- **Flutter app connection:** The Flutter SDK (see below) calls that URL with the project’s **API key** (from Project Settings in the portal). No user session is required for the SDK; auth is by `apiKey` query param. The portal returns the published REXA JSON for the requested screen.

**Relevant files:** `app/api/v1/screens/[screenName]/route.ts`, `app/api/layouts/[id]/publish/route.ts`, `app/dashboard/editor/[projectId]/page.tsx`.

---

## 4. How the Flutter package works (outside this root)

The Flutter package lives **outside** this app’s root folder:

- From this repo root: **`cd ..`** → you are in the parent folder (e.g. `Chaitanya/`).
- The package is in **`flutter_sdk/`** (sibling to `app/`), e.g.  
  `Chaitanya/flutter_sdk/rexa_renderer/`.

**Structure (typical):**

```
Chaitanya/
├── app/                    ← This Next.js app (portal)
│   ├── app/api/v1/screens/ ← Flutter hits this
│   └── ...
└── flutter_sdk/
    └── rexa_renderer/      ← Flutter package
        ├── lib/
        │   ├── rexa_renderer.dart
        │   └── src/
        │       ├── fetcher/layout_fetcher.dart   ← HTTP GET to portal
        │       ├── models/rexa_layout.dart       ← RexaNode, RexaLayoutResponse
        │       ├── parser/
        │       ├── registry/
        │       ├── widgets/
        │       └── rexa_screen.dart
        ├── pubspec.yaml
        └── README.md
```

**How the package connects to the portal:**

1. **RexaLayoutFetcher** (in `lib/src/fetcher/layout_fetcher.dart`):
   - **baseUrl** = portal origin, e.g. `https://your-rexa-portal.com`.
   - **apiKey** = project API key from the portal (Project Settings).
   - Fetches: **GET `{baseUrl}/api/v1/screens/{screenName}?apiKey={apiKey}`**.

2. **RexaScreen** widget:
   - Takes `fetcher` and `screenName` (e.g. `'home'`).
   - Calls `fetcher.fetchScreen(screenName)`.
   - On success, parses the JSON into `RexaNode` and builds the Flutter widget tree via the registry.
   - Caching (e.g. SharedPreferences), ETag, and stale-while-revalidate are handled in the fetcher.

3. **Portal response** (from `app/api/v1/screens/[screenName]/route.ts`):
   - Validates `apiKey` → project, checks project status.
   - Loads the latest active **LayoutVersion** for that project and `screenName`.
   - Returns JSON: `{ success: true, screen, version, publishedAt, layout }` where **layout** is the **REXA JSON** (same format the builder publishes after conversion).

So: **Design/Code in portal → Publish → REXA stored → Flutter SDK GET /api/v1/screens/:name?apiKey= → same REXA JSON → Flutter renders**. The package does not depend on this repo’s source; it only needs the portal URL and the project API key.

**Using the package in a Flutter app:**

```dart
final fetcher = RexaLayoutFetcher(
  baseUrl: 'https://your-portal.com',  // this app’s origin
  apiKey: projectApiKey,                // from portal project settings
);

// In a screen:
RexaScreen(fetcher: fetcher, screenName: 'home')
```

**Relevant files (in repo):** `app/api/v1/screens/[screenName]/route.ts`.  
**Relevant files (Flutter, in parent folder):** `../flutter_sdk/rexa_renderer/lib/src/fetcher/layout_fetcher.dart`, `rexa_screen.dart`, `models/rexa_layout.dart`, `README.md`.

---

## Summary

| Topic | What happens |
|--------|----------------|
| **Preview rendering** | One tree (`rootNode`), same `LayoutRenderer` in Design and Code; REXA-type names normalized so preview matches. |
| **Validation before publish** | Client: convert `rootNode` → REXA, run `validateRexaJson`, block or confirm. Server: accept `rootNode` or `rexaJson`, convert if needed, validate, store REXA. |
| **Portal connection** | Dashboard → Editor → Save/Publish → LayoutVersion; Flutter uses GET `/api/v1/screens/:name?apiKey=` with project API key. |
| **Flutter package** | Lives in **`../flutter_sdk/rexa_renderer`**; uses `baseUrl` + `apiKey` to fetch REXA JSON from the portal and render with `RexaScreen` / `RexaRenderer`. |
