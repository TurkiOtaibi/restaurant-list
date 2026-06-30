import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

let apiProcess: ChildProcessWithoutNullStreams | undefined;
let apiOutput = "";
let apiExited = false;
let apiReady = false;

export async function ensureE2eApiServer(): Promise<void> {
  if (apiReady && (await isReady())) {
    return;
  }

  if (await isReady()) {
    apiReady = true;
    return;
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

    const spawnedProcess = spawn(process.env.PYTHON ?? "python", [backendScript], {
      env: { ...process.env },
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
      apiReady = false;
      apiOutput += `\nAPI exited with code ${code ?? "null"} and signal ${signal ?? "null"}.`;
    });
  }

  await waitForApi();
  apiReady = true;
}

export function stopE2eApiServer(): void {
  const currentProcess = apiProcess;
  apiProcess = undefined;
  apiReady = false;
  apiExited = false;
  currentProcess?.kill();
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
    const response = await fetch("http://localhost:8000/health/ready");
    return response.ok;
  } catch {
    return false;
  }
}
