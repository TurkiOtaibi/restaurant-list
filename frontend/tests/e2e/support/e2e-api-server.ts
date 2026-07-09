import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

let apiProcess: ChildProcessWithoutNullStreams | undefined;
let apiOutput = "";
let apiExited = false;
const E2E_API_PORT = process.env.E2E_API_PORT ?? "8000";
const API_BASE_URL = process.env.E2E_API_BASE_URL ?? `http://localhost:${E2E_API_PORT}`;

export async function ensureE2eApiServer(): Promise<void> {
  if (apiProcess) {
    if (await isReady()) {
      return;
    }

    await waitForApi();
    return;
  }

  if (await isReady()) {
    throw new Error(
      `E2E refuses to reuse an existing API at ${API_BASE_URL}. ` +
        "Stop that process or configure a different E2E_API_BASE_URL."
    );
  }

  if (!apiProcess) {
    apiOutput = "";
    apiExited = false;

    const backendScript = path.resolve(
      process.cwd(),
      "..",
      "backend",
      "scripts",
      "start_e2e_api.py"
    );

    const childEnv = { ...process.env };
    delete childEnv.DATABASE_URL;
    if (process.env.E2E_DATABASE_URL === undefined) {
      delete childEnv.E2E_DATABASE_URL;
    }

    const spawnedProcess = spawn(process.env.PYTHON ?? "python", [backendScript], {
      env: childEnv,
      stdio: "pipe"
    });
    apiProcess = spawnedProcess;

    spawnedProcess.stdout.on("data", (chunk) => {
      apiOutput += chunk.toString();
    });
    spawnedProcess.stderr.on("data", (chunk) => {
      apiOutput += chunk.toString();
    });
    spawnedProcess.on("exit", (code, signal) => {
      if (apiProcess !== spawnedProcess) {
        return;
      }
      apiExited = true;
      apiProcess = undefined;
      apiOutput += `\nAPI exited with code ${code ?? "null"} and signal ${signal ?? "null"}.`;
    });
  }

  await waitForApi();
}

export async function stopE2eApiServer(): Promise<void> {
  const currentProcess = apiProcess;
  apiProcess = undefined;
  if (!currentProcess || currentProcess.exitCode !== null) {
    apiExited = false;
    return;
  }

  await new Promise<void>((resolve) => {
    const timeout = setTimeout(resolve, 5_000);
    currentProcess.once("exit", () => {
      clearTimeout(timeout);
      resolve();
    });
    currentProcess.kill();
  });
  apiExited = false;
}

async function waitForApi(): Promise<void> {
  for (let attempt = 0; attempt < 240; attempt += 1) {
    if (apiExited) {
      throw new Error(apiOutput);
    }

    if (await isReady()) {
      return;
    }

    await delay(500);
  }

  throw new Error(`Timed out waiting for the real API.\n${apiOutput}`);
}

async function isReady(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health/ready`);
    return response.ok;
  } catch {
    return false;
  }
}
