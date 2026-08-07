import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { access, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";


const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CLI = join(ROOT, "bin", "ontotect.js");
const SOURCE = join(ROOT, "ontotect");
const AGENTS = ["cursor", "codex", "kilo", "opencode", "claude"];
const IGNORED_DIRECTORIES = new Set(["__pycache__", ".pytest_cache", ".mypy_cache", ".ruff_cache"]);
const IGNORED_FILES = new Set([".DS_Store", "Thumbs.db"]);


function packageManagerInvocation(name) {
  if (process.platform !== "win32") {
    return { command: name, prefix: [] };
  }
  const npmCli =
    process.env.npm_execpath ??
    join(dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js");
  const cli = name === "npm" ? npmCli : join(dirname(npmCli), "npx-cli.js");
  assert.ok(existsSync(cli), `cannot locate ${name} JavaScript entry point: ${cli}`);
  return { command: process.execPath, prefix: [cli] };
}


function run(args, options = {}) {
  return spawnSync(process.execPath, [CLI, ...args], {
    cwd: options.cwd ?? ROOT,
    env: options.env ?? process.env,
    encoding: "utf8"
  });
}


function parseJson(result) {
  assert.equal(result.stderr, "", `unexpected stderr: ${result.stderr}`);
  return JSON.parse(result.stdout);
}


async function exists(path) {
  try {
    await access(path);
    return true;
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}


async function sandbox(t) {
  const root = await mkdtemp(join(tmpdir(), "ontotect-npm-test-"));
  const withinTemp = relative(resolve(tmpdir()), resolve(root));
  assert.ok(withinTemp && !withinTemp.startsWith("..") && !isAbsolute(withinTemp));
  t.after(async () => {
    const checked = relative(resolve(tmpdir()), resolve(root));
    assert.ok(checked && !checked.startsWith("..") && !isAbsolute(checked));
    await rm(root, { recursive: true, force: true });
  });
  return root;
}


function projectDestinations(projectRoot) {
  return {
    cursor: join(projectRoot, ".cursor", "skills", "ontotect"),
    codex: join(projectRoot, ".agents", "skills", "ontotect"),
    kilo: join(projectRoot, ".kilo", "skills", "ontotect"),
    opencode: join(projectRoot, ".opencode", "skills", "ontotect"),
    claude: join(projectRoot, ".claude", "skills", "ontotect")
  };
}


function userDestinations(home) {
  return {
    cursor: join(home, ".cursor", "skills", "ontotect"),
    codex: join(home, ".agents", "skills", "ontotect"),
    kilo: join(home, ".kilo", "skills", "ontotect"),
    opencode: join(home, ".config", "opencode", "skills", "ontotect"),
    claude: join(home, ".claude", "skills", "ontotect")
  };
}


async function collectFiles(root, prefix = "") {
  const files = [];
  const entries = await readdir(join(root, prefix), { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && IGNORED_DIRECTORIES.has(entry.name)) {
      continue;
    }
    if (entry.isFile() && (IGNORED_FILES.has(entry.name) || entry.name.endsWith(".pyc"))) {
      continue;
    }
    const relativePath = join(prefix, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(root, relativePath)));
    } else if (entry.isFile()) {
      files.push(relativePath);
    } else {
      throw new Error(`unexpected non-file entry in fixture: ${relativePath}`);
    }
  }
  return files.sort();
}


test("plan is a dry run and writes no destination", async (t) => {
  const projectRoot = await sandbox(t);
  const result = run([
    "plan",
    "--agents",
    "all",
    "--scope",
    "project",
    "--project-root",
    projectRoot,
    "--json"
  ]);
  assert.equal(result.status, 0, result.stderr);
  const payload = parseJson(result);
  assert.equal(payload.command, "plan");
  assert.equal(payload.dry_run, true);
  assert.deepEqual(payload.agents, AGENTS);
  assert.equal(payload.targets.length, 5);
  for (const destination of Object.values(projectDestinations(projectRoot))) {
    assert.equal(await exists(destination), false, destination);
  }
});


test("project scope maps all five hosts exactly like the Python installer", async (t) => {
  const projectRoot = await sandbox(t);
  const result = run([
    "install",
    "--dry-run",
    "--agents",
    "cursor,codex,kilo,opencode,claude",
    "--project-root",
    projectRoot,
    "--json"
  ]);
  assert.equal(result.status, 0, result.stderr);
  const payload = parseJson(result);
  const expected = projectDestinations(projectRoot);
  assert.deepEqual(
    Object.fromEntries(payload.targets.map((target) => [target.agent, target.destination])),
    expected
  );
});


test("install copies the complete skill with byte-identical files", async (t) => {
  const projectRoot = await sandbox(t);
  const result = run([
    "install",
    "--agents",
    "cursor",
    "--project-root",
    projectRoot,
    "--json"
  ]);
  assert.equal(result.status, 0, result.stderr);
  const payload = parseJson(result);
  assert.equal(payload.dry_run, false);
  assert.equal(payload.targets[0].status, "installed");

  const destination = projectDestinations(projectRoot).cursor;
  const sourceFiles = await collectFiles(SOURCE);
  const destinationFiles = await collectFiles(destination);
  assert.deepEqual(destinationFiles, sourceFiles);
  for (const relativePath of sourceFiles) {
    const expected = await readFile(join(SOURCE, relativePath));
    const actual = await readFile(join(destination, relativePath));
    assert.deepEqual(actual, expected, relativePath);
  }
});


test("existing destination blocks the whole install unless force is explicit", async (t) => {
  const projectRoot = await sandbox(t);
  const first = run([
    "install",
    "--agents",
    "cursor",
    "--project-root",
    projectRoot,
    "--json"
  ]);
  assert.equal(first.status, 0, first.stderr);

  const destinations = projectDestinations(projectRoot);
  const protectedFile = join(destinations.cursor, "SKILL.md");
  await writeFile(protectedFile, "do not overwrite implicitly\n", "utf8");

  const blocked = run([
    "install",
    "--agents",
    "cursor,kilo",
    "--project-root",
    projectRoot,
    "--json"
  ]);
  assert.equal(blocked.status, 1);
  const blockedPayload = parseJson(blocked);
  assert.match(blockedPayload.error, /refusing implicit overwrite/i);
  assert.equal(await readFile(protectedFile, "utf8"), "do not overwrite implicitly\n");
  assert.equal(await exists(destinations.kilo), false, "preflight must prevent a partial multi-host install");

  const forced = run([
    "install",
    "--agents",
    "cursor",
    "--project-root",
    projectRoot,
    "--force",
    "--json"
  ]);
  assert.equal(forced.status, 0, forced.stderr);
  assert.deepEqual(await readFile(protectedFile), await readFile(join(SOURCE, "SKILL.md")));
});


test("user scope uses the five documented home roots", async (t) => {
  const fakeHome = await sandbox(t);
  const env = {
    ...process.env,
    HOME: fakeHome,
    USERPROFILE: fakeHome,
    HOMEDRIVE: "",
    HOMEPATH: ""
  };
  const result = run(["plan", "--agents", "all", "--scope", "user", "--json"], {
    env
  });
  assert.equal(result.status, 0, result.stderr);
  const payload = parseJson(result);
  const expected = userDestinations(fakeHome);
  assert.deepEqual(
    Object.fromEntries(payload.targets.map((target) => [target.agent, target.destination])),
    expected
  );
  for (const destination of Object.values(expected)) {
    assert.equal(await exists(destination), false);
  }
});


test("invalid commands and options fail without writing", async (t) => {
  const projectRoot = await sandbox(t);
  const cases = [
    ["deploy", "--json"],
    ["plan", "--agents", "unknown", "--project-root", projectRoot, "--json"],
    ["plan", "--scope", "global", "--project-root", projectRoot, "--json"],
    ["install", "--unexpected", "--project-root", projectRoot, "--json"],
    ["install", "--agents", "--json"],
    ["help", "--scope", "project", "--json"]
  ];
  for (const args of cases) {
    const result = run(args);
    assert.equal(result.status, 2, `${args.join(" ")}\n${result.stdout}\n${result.stderr}`);
    const payload = parseJson(result);
    assert.equal(payload.exit_code, 2);
    assert.equal(typeof payload.error, "string");
  }
  for (const destination of Object.values(projectDestinations(projectRoot))) {
    assert.equal(await exists(destination), false);
  }
});


test("package metadata is an explicit zero-dependency whitelist", async () => {
  const packageJson = JSON.parse(await readFile(join(ROOT, "package.json"), "utf8"));
  assert.equal(packageJson.name, "@moonweave-ai/ontotect");
  assert.equal(packageJson.type, "module");
  assert.equal(packageJson.license, "MIT");
  assert.equal(packageJson.repository.url, "git+https://github.com/Moonweave-AI/Ontotect.git");
  assert.deepEqual(packageJson.publishConfig, {
    access: "public",
    registry: "https://registry.npmjs.org/"
  });
  assert.deepEqual(packageJson.bin, { ontotect: "bin/ontotect.js" });
  assert.ok(Array.isArray(packageJson.files));
  assert.ok(packageJson.files.includes("LICENSE"));
  assert.ok(packageJson.files.includes("ontotect/SKILL.md"));
  assert.ok(packageJson.files.includes("README.zh-CN.md"));
  assert.ok(packageJson.files.includes("docs/assets/ontotect-banner.svg"));
  assert.ok(packageJson.files.includes("ontotect/scripts/*.py"));
  assert.ok(!packageJson.files.includes("ontotect/scripts/"));
  assert.equal(packageJson.dependencies, undefined);
  assert.equal(packageJson.devDependencies, undefined);
  assert.equal(packageJson.engines, undefined);
  assert.equal(packageJson.scripts.postinstall, undefined);
});


test("a locally packed tarball installs all five hosts through npx", async (t) => {
  const tempRoot = await sandbox(t);
  const projectRoot = join(tempRoot, "project");
  const cacheRoot = join(tempRoot, "npm-cache");
  await mkdir(projectRoot, { recursive: true });
  const isolatedEnv = {
    ...process.env,
    npm_config_cache: cacheRoot,
    npm_config_audit: "false",
    npm_config_fund: "false",
    npm_config_update_notifier: "false"
  };
  const npm = packageManagerInvocation("npm");
  const npx = packageManagerInvocation("npx");

  const packed = spawnSync(
    npm.command,
    [...npm.prefix, "pack", ROOT, "--pack-destination", tempRoot, "--ignore-scripts", "--json"],
    { cwd: ROOT, env: isolatedEnv, encoding: "utf8" }
  );
  assert.equal(packed.status, 0, `${packed.stdout}\n${packed.stderr}`);
  const packReport = JSON.parse(packed.stdout)[0];
  assert.equal(packReport.name, "@moonweave-ai/ontotect");
  const packagePaths = packReport.files.map((file) => file.path);
  const forbidden = packagePaths.filter(
    (path) =>
      /(^|\/)(__pycache__|book|paper|tools|book-to-skill|tmp|tests|node_modules)(\/|$)/.test(path) ||
      /\.(pdf|epub|mobi|azw3?|docx?|rtf|pyc|tgz)$/.test(path)
  );
  assert.deepEqual(forbidden, []);
  assert.ok(packagePaths.includes("README.zh-CN.md"));
  assert.ok(packagePaths.includes("LICENSE"));
  assert.ok(packagePaths.includes("docs/assets/ontotect-banner.svg"));

  const tarball = join(tempRoot, packReport.filename);
  const executed = spawnSync(
    npx.command,
    [
      ...npx.prefix,
      "--yes",
      "--ignore-scripts",
      "--offline",
      "--package",
      tarball,
      "ontotect",
      "install",
      "--agents",
      "all",
      "--scope",
      "project",
      "--project-root",
      projectRoot,
      "--json"
    ],
    { cwd: ROOT, env: isolatedEnv, encoding: "utf8" }
  );
  assert.equal(executed.status, 0, `${executed.stdout}\n${executed.stderr}`);
  const payload = JSON.parse(executed.stdout);
  assert.equal(payload.targets.length, 5);
  assert.ok(payload.targets.every((target) => target.status === "installed"));

  const sourceFiles = await collectFiles(SOURCE);
  for (const [agent, destination] of Object.entries(projectDestinations(projectRoot))) {
    const destinationFiles = await collectFiles(destination);
    assert.deepEqual(destinationFiles, sourceFiles, `${agent}: relative file set`);
    for (const relativePath of sourceFiles) {
      assert.deepEqual(
        await readFile(join(destination, relativePath)),
        await readFile(join(SOURCE, relativePath)),
        `${agent}: ${relativePath}`
      );
    }
  }
});
