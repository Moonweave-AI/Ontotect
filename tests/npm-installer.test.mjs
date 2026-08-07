import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { access, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";


const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CLI = join(ROOT, "bin", "ontotect.js");
const SOURCE = join(ROOT, "ontotect");
const SUITE = JSON.parse(await readFile(join(SOURCE, "assets", "skill-suite.json"), "utf8"));
const SKILLS = SUITE.skills;
const SKILL_NAMES = SKILLS.map((skill) => skill.name);
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


function projectSkillRoots(projectRoot) {
  return {
    cursor: join(projectRoot, ".cursor", "skills"),
    codex: join(projectRoot, ".agents", "skills"),
    kilo: join(projectRoot, ".kilo", "skills"),
    opencode: join(projectRoot, ".opencode", "skills"),
    claude: join(projectRoot, ".claude", "skills")
  };
}


function userSkillRoots(home) {
  return {
    cursor: join(home, ".cursor", "skills"),
    codex: join(home, ".agents", "skills"),
    kilo: join(home, ".kilo", "skills"),
    opencode: join(home, ".config", "opencode", "skills"),
    claude: join(home, ".claude", "skills")
  };
}


function projectCommandRoots(projectRoot) {
  return {
    kilo: join(projectRoot, ".kilo", "commands"),
    opencode: join(projectRoot, ".opencode", "commands")
  };
}


function userCommandRoots(home) {
  return {
    kilo: join(home, ".config", "kilo", "commands"),
    opencode: join(home, ".config", "opencode", "commands")
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


async function assertCoreCopy(destination) {
  const sourceFiles = await collectFiles(SOURCE);
  const destinationFiles = await collectFiles(destination);
  assert.deepEqual(destinationFiles, [".ontotect-suite.json", ...sourceFiles].sort());
  const state = JSON.parse(await readFile(join(destination, ".ontotect-suite.json"), "utf8"));
  assert.deepEqual(state.skills, SKILL_NAMES);
  for (const relativePath of sourceFiles) {
    assert.deepEqual(
      await readFile(join(destination, relativePath)),
      await readFile(join(SOURCE, relativePath)),
      relativePath
    );
  }
}


async function assertGeneratedSkill(destination, entry) {
  const sourceFiles = await collectFiles(SOURCE);
  const destinationFiles = await collectFiles(destination);
  const focusedFiles = sourceFiles.filter(
    (relativePath) => relativePath !== join("scripts", "install_skill.py")
  );
  assert.deepEqual(destinationFiles, focusedFiles, `${entry.name}: file set`);
  const skillText = await readFile(join(destination, "SKILL.md"), "utf8");
  assert.match(skillText, new RegExp(`^---\\r?\\nname: ${entry.name}\\r?$`, "m"));
  assert.ok(skillText.includes(`# ${entry.display_name}`));
  assert.ok(skillText.includes(`selected operation to \`${entry.command}\``));
  assert.ok(skillText.includes("Do not fall back to\n`help` or `router`"));
  assert.equal(await exists(join(destination, "scripts", "install_skill.py")), false);
  const metadata = await readFile(join(destination, "agents", "openai.yaml"), "utf8");
  assert.ok(metadata.includes(entry.display_name));
  assert.ok(metadata.includes(`$${entry.name}`));
  for (const relativePath of focusedFiles) {
    if (relativePath === "SKILL.md" || relativePath === join("agents", "openai.yaml")) {
      continue;
    }
    assert.deepEqual(
      await readFile(join(destination, relativePath)),
      await readFile(join(SOURCE, relativePath)),
      `${entry.name}: ${relativePath}`
    );
  }
}


test("list exposes the complete discoverable skill suite", () => {
  const result = run(["list", "--json"]);
  assert.equal(result.status, 0, result.stderr);
  const payload = parseJson(result);
  assert.equal(payload.count, 20);
  assert.deepEqual(payload.skills.map((skill) => skill.name), SKILL_NAMES);
  assert.equal(payload.invocation.codex, "$<skill-name> or /skills");
  const root = payload.skills.find((skill) => skill.name === "ontotect");
  const review = payload.skills.find((skill) => skill.name === "ontotect-review");
  assert.equal(root.command, "router");
  assert.equal(root.dispatch, "conditional");
  assert.equal(review.command, "review");
  assert.equal(review.dispatch, "fixed");
  assert.equal(
    payload.skills.find((skill) => skill.name === "ontotect-stage-release").command,
    "stage release"
  );
});


test("full plan is read-only and includes skills plus command adapters", async (t) => {
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
  assert.equal(payload.suite, "full");
  assert.equal(payload.targets.length, 5);
  assert.equal(payload.suite_targets.length, 5);
  assert.ok(payload.suite_targets.every((target) => target.count === 19));
  assert.equal(payload.command_targets.length, 2);
  assert.ok(payload.command_targets.every((target) => target.count === 20));
  for (const root of Object.values(projectSkillRoots(projectRoot))) {
    assert.equal(await exists(join(root, "ontotect")), false);
    assert.equal(await exists(join(root, "ontotect-review")), false);
  }
  for (const root of Object.values(projectCommandRoots(projectRoot))) {
    assert.equal(await exists(join(root, "ontotect-review.md")), false);
  }
});


test("project scope maps all five hosts and two explicit command systems", async (t) => {
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
  const skillRoots = projectSkillRoots(projectRoot);
  assert.deepEqual(
    Object.fromEntries(payload.targets.map((target) => [target.agent, dirname(target.destination)])),
    skillRoots
  );
  assert.deepEqual(
    Object.fromEntries(payload.command_targets.map((target) => [target.agent, target.destination])),
    projectCommandRoots(projectRoot)
  );
});


test("install creates twenty independently discoverable Cursor skills", async (t) => {
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
  assert.equal(payload.targets[0].status, "installed");
  assert.equal(payload.suite_targets[0].status, "installed");
  assert.equal(payload.suite_targets[0].count, 19);
  assert.equal(payload.command_targets.length, 0);

  const root = projectSkillRoots(projectRoot).cursor;
  await assertCoreCopy(join(root, "ontotect"));
  for (const entry of SKILLS.filter((skill) => skill.name !== "ontotect")) {
    await assertGeneratedSkill(join(root, entry.name), entry);
  }
});


test("core mode installs only the canonical skill", async (t) => {
  const projectRoot = await sandbox(t);
  const result = run([
    "install",
    "--agents",
    "kilo",
    "--project-root",
    projectRoot,
    "--suite",
    "core",
    "--commands",
    "none",
    "--json"
  ]);
  assert.equal(result.status, 0, result.stderr);
  const payload = parseJson(result);
  assert.equal(payload.suite_targets.length, 0);
  assert.equal(payload.command_targets.length, 0);
  const root = projectSkillRoots(projectRoot).kilo;
  assert.equal(await exists(join(root, "ontotect", "SKILL.md")), true);
  assert.equal(await exists(join(root, "ontotect-review")), false);
});


test("Kilo and OpenCode receive systematic slash adapters", async (t) => {
  const projectRoot = await sandbox(t);
  const result = run([
    "install",
    "--agents",
    "kilo,opencode",
    "--project-root",
    projectRoot,
    "--json"
  ]);
  assert.equal(result.status, 0, result.stderr);
  const payload = parseJson(result);
  assert.ok(payload.command_targets.every((target) => target.status === "installed"));
  for (const root of Object.values(projectCommandRoots(projectRoot))) {
    const commandFiles = (await readdir(root)).filter((name) => name.startsWith("ontotect"));
    assert.equal(commandFiles.length, SKILLS.length);
    for (const entry of SKILLS) {
      const body = await readFile(join(root, `${entry.name}.md`), "utf8");
      assert.ok(body.includes(`Load the installed \`${entry.name}\` skill`));
      assert.ok(body.includes("$ARGUMENTS"));
      assert.ok(body.includes(entry.instruction));
    }
  }
});


test("one existing suite or command target blocks the whole install", async (t) => {
  const projectRoot = await sandbox(t);
  const protectedCommand = join(projectCommandRoots(projectRoot).kilo, "ontotect-review.md");
  await mkdir(dirname(protectedCommand), { recursive: true });
  await writeFile(protectedCommand, "do not overwrite implicitly\n", "utf8");

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
  assert.equal(await readFile(protectedCommand, "utf8"), "do not overwrite implicitly\n");
  assert.equal(await exists(join(projectSkillRoots(projectRoot).cursor, "ontotect")), false);
  assert.equal(await exists(join(projectSkillRoots(projectRoot).kilo, "ontotect")), false);

  const forced = run([
    "install",
    "--agents",
    "kilo",
    "--project-root",
    projectRoot,
    "--force",
    "--json"
  ]);
  assert.equal(forced.status, 0, forced.stderr);
  assert.notEqual(await readFile(protectedCommand, "utf8"), "do not overwrite implicitly\n");
});


test("force performs a clean managed refresh without deleting unknown siblings", async (t) => {
  const projectRoot = await sandbox(t);
  const first = run([
    "install",
    "--agents",
    "kilo",
    "--project-root",
    projectRoot,
    "--json"
  ]);
  assert.equal(first.status, 0, first.stderr);

  const skillRoot = projectSkillRoots(projectRoot).kilo;
  const commandRoot = projectCommandRoots(projectRoot).kilo;
  const core = join(skillRoot, "ontotect");
  const statePath = join(core, ".ontotect-suite.json");
  const staleName = "ontotect-old";
  const unknownName = "ontotect-custom";
  await writeFile(join(core, "stale-sentinel.txt"), "remove me\n", "utf8");
  await mkdir(join(skillRoot, staleName), { recursive: true });
  await writeFile(join(skillRoot, staleName, "SKILL.md"), "managed stale\n", "utf8");
  await writeFile(join(commandRoot, `${staleName}.md`), "managed stale\n", "utf8");
  await mkdir(join(skillRoot, unknownName), { recursive: true });
  await writeFile(join(skillRoot, unknownName, "SKILL.md"), "unknown sibling\n", "utf8");
  const previousState = JSON.parse(await readFile(statePath, "utf8"));
  previousState.skills.push(staleName);
  previousState.commands.push(staleName);
  await writeFile(statePath, `${JSON.stringify(previousState, null, 2)}\n`, "utf8");

  const refreshed = run([
    "install",
    "--agents",
    "kilo",
    "--project-root",
    projectRoot,
    "--suite",
    "core",
    "--commands",
    "none",
    "--force",
    "--json"
  ]);
  assert.equal(refreshed.status, 0, `${refreshed.stdout}\n${refreshed.stderr}`);
  assert.equal(await exists(join(core, "stale-sentinel.txt")), false);
  assert.equal(await exists(join(skillRoot, "ontotect-review")), false);
  assert.equal(await exists(join(skillRoot, staleName)), false);
  assert.equal(await exists(join(commandRoot, "ontotect-review.md")), false);
  assert.equal(await exists(join(commandRoot, `${staleName}.md`)), false);
  assert.equal(await exists(join(skillRoot, unknownName, "SKILL.md")), true);
  const currentState = JSON.parse(await readFile(statePath, "utf8"));
  assert.deepEqual(currentState, { skills: ["ontotect"], commands: [] });
});


test("symlinked host roots are rejected before any external write", async (t) => {
  const sandboxRoot = await sandbox(t);
  const projectRoot = join(sandboxRoot, "project");
  const outside = join(sandboxRoot, "outside");
  await mkdir(join(projectRoot, ".cursor"), { recursive: true });
  await mkdir(outside, { recursive: true });
  await symlink(outside, join(projectRoot, ".cursor", "skills"), process.platform === "win32" ? "junction" : "dir");

  const result = run([
    "install",
    "--agents",
    "cursor",
    "--project-root",
    projectRoot,
    "--json"
  ]);
  assert.notEqual(result.status, 0);
  assert.match(parseJson(result).error, /symlink|junction|reparse/i);
  assert.deepEqual(await readdir(outside), []);
});


test("wrong target types fail global preflight before earlier hosts are written", async (t) => {
  const projectRoot = await sandbox(t);
  const codexTarget = join(projectSkillRoots(projectRoot).codex, "ontotect");
  await mkdir(dirname(codexTarget), { recursive: true });
  await writeFile(codexTarget, "not a directory\n", "utf8");

  const result = run([
    "install",
    "--agents",
    "cursor,codex",
    "--project-root",
    projectRoot,
    "--force",
    "--json"
  ]);
  assert.notEqual(result.status, 0);
  assert.match(parseJson(result).error, /must be a directory/i);
  assert.equal(await exists(join(projectSkillRoots(projectRoot).cursor, "ontotect")), false);
  assert.equal(await readFile(codexTarget, "utf8"), "not a directory\n");
});


test("user scope uses documented skill and command roots", async (t) => {
  const fakeHome = await sandbox(t);
  const env = {
    ...process.env,
    HOME: fakeHome,
    USERPROFILE: fakeHome,
    HOMEDRIVE: "",
    HOMEPATH: ""
  };
  const result = run(["plan", "--agents", "all", "--scope", "user", "--json"], { env });
  assert.equal(result.status, 0, result.stderr);
  const payload = parseJson(result);
  const skillRoots = userSkillRoots(fakeHome);
  assert.deepEqual(
    Object.fromEntries(payload.targets.map((target) => [target.agent, dirname(target.destination)])),
    skillRoots
  );
  assert.deepEqual(
    Object.fromEntries(payload.command_targets.map((target) => [target.agent, target.destination])),
    userCommandRoots(fakeHome)
  );
});


test("invalid commands and options fail without writing", async (t) => {
  const projectRoot = await sandbox(t);
  const cases = [
    ["deploy", "--json"],
    ["plan", "--agents", "unknown", "--project-root", projectRoot, "--json"],
    ["plan", "--scope", "global", "--project-root", projectRoot, "--json"],
    ["plan", "--suite", "partial", "--project-root", projectRoot, "--json"],
    ["plan", "--commands", "legacy", "--project-root", projectRoot, "--json"],
    ["install", "--unexpected", "--project-root", projectRoot, "--json"],
    ["install", "--agents", "--json"],
    ["help", "--scope", "project", "--json"],
    ["list", "--agents", "all", "--json"]
  ];
  for (const args of cases) {
    const result = run(args);
    assert.equal(result.status, 2, `${args.join(" ")}\n${result.stdout}\n${result.stderr}`);
    const payload = parseJson(result);
    assert.equal(payload.exit_code, 2);
  }
  for (const root of Object.values(projectSkillRoots(projectRoot))) {
    assert.equal(await exists(root), false);
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
  assert.ok(packageJson.files.includes("ontotect/assets/"));
  assert.equal(packageJson.dependencies, undefined);
  assert.equal(packageJson.devDependencies, undefined);
  assert.equal(packageJson.scripts.postinstall, undefined);
  assert.equal(packageJson.scripts.preinstall, undefined);
});


test("a locally packed tarball installs the full suite through npx", async (t) => {
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
  const packagePaths = packReport.files.map((file) => file.path);
  const forbidden = packagePaths.filter(
    (path) =>
      /(^|\/)(__pycache__|book|paper|tools|book-to-skill|tmp|tests|node_modules)(\/|$)/.test(path) ||
      /\.(pdf|epub|mobi|azw3?|docx?|rtf|pyc|tgz)$/.test(path)
  );
  assert.deepEqual(forbidden, []);
  assert.ok(packagePaths.includes("ontotect/assets/skill-suite.json"));
  assert.ok(packagePaths.includes("ontotect/assets/command-adapter.md"));

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
  assert.ok(payload.targets.every((target) => target.status === "installed"));
  assert.ok(payload.suite_targets.every((target) => target.status === "installed"));
  assert.ok(payload.command_targets.every((target) => target.status === "installed"));

  for (const root of Object.values(projectSkillRoots(projectRoot))) {
    for (const name of SKILL_NAMES) {
      assert.equal(await exists(join(root, name, "SKILL.md")), true, `${root}: ${name}`);
    }
  }
  for (const root of Object.values(projectCommandRoots(projectRoot))) {
    for (const name of SKILL_NAMES) {
      assert.equal(await exists(join(root, `${name}.md`)), true, `${root}: ${name}`);
    }
  }
});
