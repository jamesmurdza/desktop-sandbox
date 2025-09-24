# Desktop Sandbox

A unified interface for Linux-based desktop sandbox providers. It can be used to create virtual desktop environments for AI agents to interact with graphical applications.

<p align="center">
  <img width="500" alt="screenshot" src="https://github.com/user-attachments/assets/02c63946-8f6d-4ede-b695-5ac089df04c6" />
</p>

This repository is based on [`sandboxjs`](https://github.com/jamesmurdza/sandboxjs), an abstraction layer for cloud sandbox providers.

## Usage

```ts
import { Sandbox } from "./src/index.js";

async function runExample() {
  // Create a new desktop sandbox
  const desktop = await Sandbox.create("e2b"); // or "daytona"

  // Perform basic desktop interactions
  await desktop.moveMouse(100, 100);
  await desktop.leftClick();
  await desktop.write("Hello from desktop sandbox!");
  const screenshot = await desktop.screenshot();

  // Destroy the sandbox when done
  await desktop.destroy();
}

runExample();
```

## Provider Support

| Provider    | Desktop Environment | VNC Streaming | Mouse Interaction | Keyboard Input | Screenshots |
| ----------- | ------------------- | ------------- | ----------------- | -------------- | ----------- |
| **E2B**     | ✅                  | ✅            | ✅                | ✅             | ✅          |
| **Daytona** | ✅                  | ✅            | ✅                | ✅             | ✅          |

## Getting Started

### 1. Set up environment variables

Create a `.env` file in the root directory of the project and add at least one of the following environment variables:

```shell
# Get an E2B API key here: https://e2b.dev/dashboard
E2B_API_KEY=
# Get a Daytona API key here: https://app.daytona.io/dashboard/keys
DAYTONA_API_KEY=
```

### 2. Install dependencies

```
npm install
```

### 3. Build the project

Compiles the TypeScript source files to JavaScript in the `dist/` directory.

```
npm run build
```

### 4. Run the example

After building, run the example script:

```
node dist/examples/run-desktop.js
```

### 5. Run tests

To run the test suite:

```
npm test
```

## Methods

### create

```ts
// Create default desktop sandbox
const desktop = await Sandbox.create("e2b"); // or "daytona"

// Create desktop sandbox with additional parameters
const e2bDesktop = await Sandbox.create("e2b", {
  template: "gitwit-desktop", // default template for desktop sandboxes
  resolution: [1280, 720], // set screen resolution
  dpi: 96,
  envs: { DISPLAY: ":0" }
});
```

### id

```ts
const sandboxId = desktop.id();
```

### suspend

```ts
await desktop.suspend();
```

### resume

```ts
await desktop.resume();
```

### destroy

```ts
await desktop.destroy();
```

### readFile

```ts
console.log(await desktop.readFile("/path/to/file"));
```

### writeFile

```ts
await desktop.writeFile("/path/to/file", "content");
```

### listFiles

```ts
console.log(await desktop.listFiles("/path/to/directory"));
```

### moveFile

```ts
await desktop.moveFile("/path/to/file", "/path/to/new/file");
```

### deleteFile

```ts
await desktop.deleteFile("/path/to/file");
```

### createDirectory

```ts
await desktop.createDirectory("/path/to/directory");
```

### getPreviewUrl

```ts
console.log(await desktop.getPreviewUrl(6080)); // VNC stream port
```

### runCommand

Execute commands in the sandbox with support for background execution and command options.

```ts
// Basic command execution
const { exitCode, output } = await desktop.runCommand("echo 'hello world'");
console.log(output); // "hello world"
console.log(exitCode); // 0

// Command with options
const result = await desktop.runCommand("ls -la", {
  cwd: "/tmp",
  envs: { MY_VAR: "value" },
  timeoutMs: 5000
});

// Background command execution
const { pid } = await desktop.runCommand("sleep 10", { background: true });
console.log(`Background process started with PID: ${pid}`);
```

### screenshot

```ts
const imageBytes = await desktop.screenshot();
// Save the screenshot, e.g., using Node.js fs
// writeFileSync("screenshot.png", Buffer.from(imageBytes));
```

### leftClick

```ts
await desktop.leftClick(); // Clicks at current mouse position
await desktop.leftClick(100, 100); // Moves mouse to 100, 100 and clicks
```

### doubleClick

```ts
await desktop.doubleClick();
await desktop.doubleClick(200, 200);
```

### rightClick

```ts
await desktop.rightClick();
await desktop.rightClick(300, 300);
```

### middleClick

```ts
await desktop.middleClick();
await desktop.middleClick(400, 400);
```

### scroll

```ts
await desktop.scroll('up', 2); // Scrolls up twice
await desktop.scroll('down'); // Scrolls down once (default amount)
```

### moveMouse

```ts
await desktop.moveMouse(500, 500);
```

### mousePress

```ts
await desktop.mousePress('left');
```

### mouseRelease

```ts
await desktop.mouseRelease('left');
```

### getCursorPosition

```ts
const { x, y } = await desktop.getCursorPosition();
console.log(`Cursor is at x: ${x}, y: ${y}`);
```

### getScreenSize

```ts
const { width, height } = await desktop.getScreenSize();
console.log(`Screen size: ${width}x${height}`);
```

### write

```ts
await desktop.write("Hello, World!");
await desktop.write("Another text", { chunkSize: 10, delayInMs: 100 });
```

### press

```ts
await desktop.press("enter");
await desktop.press(["control", "c"]);
```

### drag

```ts
await desktop.drag([10, 10], [100, 100]); // Drags from (10,10) to (100,100)
```

### wait

```ts
await desktop.wait(2000); // Waits for 2 seconds
```

### open

```ts
await desktop.open("https://google.com");
await desktop.open("/home/user/documents/report.pdf");
```

### getCurrentWindowId

```ts
const windowId = await desktop.getCurrentWindowId();
console.log(`Current window ID: ${windowId}`);
```

### getApplicationWindows

```ts
const firefoxWindows = await desktop.getApplicationWindows("firefox");
console.log(`Firefox window IDs: ${firefoxWindows}`);
```

### getWindowTitle

```ts
const title = await desktop.getWindowTitle("someWindowId");
console.log(`Window title: ${title}`);
```

### launch

```ts
await desktop.launch("firefox", "https://e2b.dev");
```

### stream (VNCServer)

The `stream` property provides methods to control the VNC server.

#### stream.start

```ts
await desktop.stream.start({ requireAuth: true });
```

#### stream.stop

```ts
await desktop.stream.stop();
```

#### stream.getAuthKey

```ts
const authKey = desktop.stream.getAuthKey();
```

#### stream.getUrl

```ts
const url = desktop.stream.getUrl({ authKey });
```

## Template Building

Build custom desktop templates from your projects.

> **Note:** Your project directory must contain a `Dockerfile` (or `*.Dockerfile` file).

```ts
import { buildTemplate } from "@gitwit/sandbox";

const templateDir = "./template" // Directory containing Dockerfile and other template files
const templateName = "gitwit-desktop" // Name for your custom template/snapshot

// Build E2B desktop template
await buildTemplate('e2b', templateDir, templateName, {
  cpuCount: 8,
  memoryMB: 8192,
  // teamId: 'your-team-id' // Optional: if you want to build for a specific team
});

// Build Daytona desktop snapshot
await buildTemplate('daytona', templateDir, templateName, {
  cpu: 4,
  memory: 8,
  disk: 8,
  gpu: 1
});

// Use built template
const desktopE2B = await Sandbox.create('e2b', { template: templateName }); // or "daytona"
```

## Licensing

Parts of this project are derived from the Dockerfile and TypeScript SDK in the [E2B Desktop SDK](https://github.com/e2b-dev/desktop/). The Dockerfile is under the [Apache License 2.0](./template/LICENSE) and the TypeScript SDK is under the [MIT License](./LICENSE).

## Future Plans

- Add support for watching file system changes
- Extend provider support
