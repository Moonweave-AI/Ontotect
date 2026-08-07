#!/usr/bin/env node

import { constants } from "node:fs";
import { randomUUID } from "node:crypto";
import {
  access,
  copyFile,
  lstat,
  mkdir,
  readFile,
  readdir,
  realpath,
  rename,
  rm,
  stat,
  writeFile
} from "node:fs/promises";
import { homedir } from "node:os";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const SKILL_NAME = "ontotect";
const AGENTS = ["cursor", "codex", "kilo", "opencode", "claude"];
const COMMANDS = new Set(["install", "plan", "list", "help"]);
const SCOPES = new Set(["project", "user"]);
const SUITE_OPTIONS = new Set(["full", "core"]);
const COMMAND_OPTIONS = new Set(["auto", "none"]);
const COMMAND_AGENTS = new Set(["kilo", "opencode"]);
const SKILL_COMMANDS = new Set([
  "help",
  "router",
  "status",
  "build",
  "review",
  "repair",
  "optimize",
  "refactor",
  "validate",
  "govern",
  "release",
  "stage",
  "stage charter",
  "stage reuse",
  "stage conceptualize",
  "stage formalize",
  "stage implement",
  "stage verify",
  "stage release"
]);
const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = join(PACKAGE_ROOT, SKILL_NAME);
const SUITE_MANIFEST = join(SOURCE, "assets", "skill-suite.json");
const COMMAND_TEMPLATE = join(SOURCE, "assets", "command-adapter.md");
const INSTALL_STATE_FILE = ".ontotect-suite.json";
const SKILL_NAME_PATTERN = /^ontotect(?:-[a-z0-9-]+)?$/;
const IGNORED_DIRECTORY_NAMES = new Set([
  "__pycache__",
  ".pytest_cache",
  ".mypy_cache",
  ".ruff_cache"
]);
const IGNORED_FILE_NAMES = new Set([".DS_Store", "Thumbs.db"]);

class CliError extends Error {
  constructor(message, exitCode = 2) {
    super(message);
    this.name = "CliError";
    this.exitCode = exitCode;
  }
}

function helpText() {
  return `Ontotect skill-suite installer

Usage:
  ontotect help
  ontotect list [--json]
  ontotect plan [options]
  ontotect install [options]

Commands:
  help       Show this help. Never installs anything.
  list       List every discoverable Ontotect skill and command entry.
  plan       Show exact destinations. Never writes files.
  install    Install the complete skill suite and supported command adapters.

Options:
  --agents <list>        Comma-separated cursor,codex,kilo,opencode,claude,all
                         (default: all)
  --scope <scope>        project or user (default: project)
  --project-root <path>  Project root (default: current working directory)
  --suite <mode>         full or core (default: full). Full installs the router,
                         help, status, mode, and lifecycle-stage skill entries.
  --commands <mode>      auto or none (default: auto). Auto installs explicit
                         Kilo/OpenCode command adapters.
  --force                Cleanly replace managed Ontotect skills and commands
                         and remove stale entries recorded by a prior install
  --dry-run              Make install render a plan without writing
  --json                 Emit machine-readable JSON
  -h, --help             Show help

Native invocation after a full install:
  Codex                 $ontotect-help, $ontotect-review, or /skills
  Cursor / Claude       /ontotect-help, /ontotect-review, /ontotect-stage ...
  Kilo / OpenCode       the same slash entries through skills or adapters

Examples:
  ontotect list
  ontotect plan --agents all --scope user
  ontotect install --agents all --scope user
  ontotect install --agents codex --scope project --project-root .
  ontotect install --agents all --suite core --commands none

The installer has no runtime dependencies, postinstall hook, network access,
tool-version check, dependency lock, checksum, or implicit overwrite.`;
}

function nextValue(argv, index, option) {
  if (index + 1 >= argv.length || argv[index + 1].startsWith("--")) {
    throw new CliError(`${option} requires a value`);
  }
  return argv[index + 1];
}

function splitOption(argument) {
  const equals = argument.indexOf("=");
  if (equals === -1) {
    return [argument, null];
  }
  return [argument.slice(0, equals), argument.slice(equals + 1)];
}

function parseAgents(values) {
  const tokens = values
    .flatMap((value) => value.split(","))
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  if (tokens.length === 0) {
    throw new CliError("--agents requires at least one agent");
  }
  const invalid = tokens.filter((agent) => agent !== "all" && !AGENTS.includes(agent));
  if (invalid.length > 0) {
    throw new CliError(
      `unknown agent(s): ${[...new Set(invalid)].join(", ")}; expected ${AGENTS.join(", ")}, or all`
    );
  }
  if (tokens.includes("all")) {
    return [...AGENTS];
  }
  return [...new Set(tokens)];
}

function defaultOptions(command, json = false) {
  return {
    command,
    agents: [...AGENTS],
    scope: "project",
    projectRoot: resolve(process.cwd()),
    suite: "full",
    commandAdapters: "auto",
    force: false,
    dryRun: command !== "install",
    json
  };
}

function parseArguments(argv) {
  if (argv.length === 0 || argv[0] === "-h" || argv[0] === "--help") {
    return defaultOptions("help");
  }

  const command = argv[0].toLowerCase();
  if (!COMMANDS.has(command)) {
    throw new CliError(`unknown command: ${argv[0]}; use install, plan, list, or help`);
  }

  if (command === "help" || command === "list") {
    let json = false;
    for (const argument of argv.slice(1)) {
      if (argument === "--json") {
        json = true;
      } else if (argument !== "-h" && argument !== "--help") {
        throw new CliError(`${command} accepts only --json or --help`);
      }
    }
    return defaultOptions(command, json);
  }

  const options = defaultOptions(command);
  const agentValues = [];
  for (let index = 1; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "-h" || argument === "--help") {
      return defaultOptions("help", options.json);
    }
    const [option, inlineValue] = splitOption(argument);
    switch (option) {
      case "--agents": {
        const value = inlineValue ?? nextValue(argv, index, option);
        if (inlineValue === null) {
          index += 1;
        }
        agentValues.push(value);
        break;
      }
      case "--scope": {
        const value = (inlineValue ?? nextValue(argv, index, option)).toLowerCase();
        if (inlineValue === null) {
          index += 1;
        }
        if (!SCOPES.has(value)) {
          throw new CliError(`invalid scope: ${value}; expected project or user`);
        }
        options.scope = value;
        break;
      }
      case "--project-root": {
        const value = inlineValue ?? nextValue(argv, index, option);
        if (inlineValue === null) {
          index += 1;
        }
        if (!value) {
          throw new CliError("--project-root requires a non-empty path");
        }
        options.projectRoot = resolve(value);
        break;
      }
      case "--suite": {
        const value = (inlineValue ?? nextValue(argv, index, option)).toLowerCase();
        if (inlineValue === null) {
          index += 1;
        }
        if (!SUITE_OPTIONS.has(value)) {
          throw new CliError(`invalid suite mode: ${value}; expected full or core`);
        }
        options.suite = value;
        break;
      }
      case "--commands": {
        const value = (inlineValue ?? nextValue(argv, index, option)).toLowerCase();
        if (inlineValue === null) {
          index += 1;
        }
        if (!COMMAND_OPTIONS.has(value)) {
          throw new CliError(`invalid commands mode: ${value}; expected auto or none`);
        }
        options.commandAdapters = value;
        break;
      }
      case "--force":
        if (inlineValue !== null) {
          throw new CliError("--force does not take a value");
        }
        options.force = true;
        break;
      case "--dry-run":
        if (inlineValue !== null) {
          throw new CliError("--dry-run does not take a value");
        }
        options.dryRun = true;
        break;
      case "--json":
        if (inlineValue !== null) {
          throw new CliError("--json does not take a value");
        }
        options.json = true;
        break;
      default:
        throw new CliError(`unknown option or argument: ${argument}`);
    }
  }
  options.agents = agentValues.length > 0 ? parseAgents(agentValues) : [...AGENTS];
  return options;
}

function projectRoots(projectRoot) {
  return {
    cursor: join(projectRoot, ".cursor", "skills"),
    codex: join(projectRoot, ".agents", "skills"),
    kilo: join(projectRoot, ".kilo", "skills"),
    opencode: join(projectRoot, ".opencode", "skills"),
    claude: join(projectRoot, ".claude", "skills")
  };
}

function userRoots(home) {
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

function installAnchor(options) {
  return options.scope === "user" ? homedir() : options.projectRoot;
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

function isContained(anchor, candidate) {
  const fromAnchor = relative(anchor, candidate);
  return fromAnchor === "" || (!fromAnchor.startsWith("..") && !isAbsolute(fromAnchor));
}

async function lstatOrNull(path) {
  try {
    return await lstat(path);
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

async function inspectDestination(basePath, targetPath, expectedKind, requireWritable) {
  const base = resolve(basePath);
  const target = resolve(targetPath);
  if (target === base || !isContained(base, target)) {
    throw new CliError(`destination escapes the selected install anchor: ${target}`);
  }

  let baseInfo;
  try {
    baseInfo = await stat(base);
  } catch (error) {
    throw new CliError(`install anchor must already exist: ${base}`);
  }
  if (!baseInfo.isDirectory()) {
    throw new CliError(`install anchor is not a directory: ${base}`);
  }

  const realBase = await realpath(base);
  const parts = relative(base, target).split(sep).filter(Boolean);
  let current = base;
  let nearestDirectory = base;
  let resolvedDestination = realBase;

  for (let index = 0; index < parts.length; index += 1) {
    current = join(current, parts[index]);
    const info = await lstatOrNull(current);
    if (!info) {
      resolvedDestination = resolve(await realpath(nearestDirectory), ...parts.slice(index));
      break;
    }
    if (info.isSymbolicLink()) {
      throw new CliError(`refusing symlink or junction in install destination: ${current}`);
    }
    const resolvedCurrent = await realpath(current);
    if (!isContained(realBase, resolvedCurrent)) {
      throw new CliError(`resolved install destination escapes its anchor: ${current}`);
    }
    const isLeaf = index === parts.length - 1;
    if (!isLeaf && !info.isDirectory()) {
      throw new CliError(`install destination parent is not a directory: ${current}`);
    }
    if (isLeaf && expectedKind === "directory" && !info.isDirectory()) {
      throw new CliError(`skill destination must be a directory: ${current}`);
    }
    if (isLeaf && expectedKind === "file" && !info.isFile()) {
      throw new CliError(`command destination must be a regular file: ${current}`);
    }
    if (info.isDirectory()) {
      nearestDirectory = current;
    }
    resolvedDestination = resolvedCurrent;
  }

  if (!isContained(realBase, resolvedDestination)) {
    throw new CliError(`resolved install destination escapes its anchor: ${target}`);
  }
  if (requireWritable) {
    const writeParent = (await lstatOrNull(target)) ? dirname(target) : nearestDirectory;
    try {
      await access(writeParent, constants.W_OK);
    } catch (error) {
      throw new CliError(`install destination parent is not writable: ${writeParent}`);
    }
  }
  return resolvedDestination;
}

async function loadManagedState(coreDestination) {
  const statePath = join(coreDestination, INSTALL_STATE_FILE);
  let payload;
  try {
    payload = JSON.parse(await readFile(statePath, "utf8"));
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return { exists: false, skills: [], commands: [] };
    }
    throw new CliError(`cannot read managed install state ${statePath}: ${error.message}`);
  }
  if (!payload || !Array.isArray(payload.skills) || !Array.isArray(payload.commands)) {
    throw new CliError(`managed install state is invalid: ${statePath}`);
  }
  for (const name of [...payload.skills, ...payload.commands]) {
    if (typeof name !== "string" || !SKILL_NAME_PATTERN.test(name)) {
      throw new CliError(`managed install state contains an invalid entry: ${statePath}`);
    }
  }
  return {
    exists: true,
    skills: [...new Set(payload.skills)],
    commands: [...new Set(payload.commands)]
  };
}

function pathsOverlap(left, right) {
  const fromLeft = relative(left, right);
  const fromRight = relative(right, left);
  const rightInsideLeft = fromLeft === "" || (!fromLeft.startsWith("..") && !isAbsolute(fromLeft));
  const leftInsideRight = fromRight === "" || (!fromRight.startsWith("..") && !isAbsolute(fromRight));
  return rightInsideLeft || leftInsideRight;
}

function parseCanonicalSkill(text) {
  const frontmatter = text.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n/);
  if (!frontmatter) {
    throw new CliError("SKILL.md must begin with YAML frontmatter");
  }
  const name = frontmatter[1].match(/^name:\s*["']?([^"'\r\n]+)["']?\s*$/m);
  const description = frontmatter[1].match(/^description:\s*\S.+$/m);
  if (!name || name[1].trim() !== SKILL_NAME) {
    throw new CliError(`SKILL.md name must be ${SKILL_NAME}`);
  }
  if (!description) {
    throw new CliError("SKILL.md description must be non-empty");
  }
  return {
    text,
    body: text.slice(frontmatter[0].length).replace(/^# Ontotect\s*\r?\n/, "")
  };
}

async function validateSource(source) {
  if (basename(source) !== SKILL_NAME) {
    throw new CliError(`skill directory must be named ${SKILL_NAME}`);
  }
  const skillFile = join(source, "SKILL.md");
  try {
    return parseCanonicalSkill(await readFile(skillFile, "utf8"));
  } catch (error) {
    if (error instanceof CliError) {
      throw error;
    }
    throw new CliError(`cannot read required skill file ${skillFile}: ${error.message}`);
  }
}

async function loadSuite() {
  let manifest;
  let template;
  try {
    manifest = JSON.parse(await readFile(SUITE_MANIFEST, "utf8"));
    template = await readFile(COMMAND_TEMPLATE, "utf8");
  } catch (error) {
    throw new CliError(`cannot read skill-suite assets: ${error.message}`);
  }
  if (manifest.schema_version !== "1.0" || !Array.isArray(manifest.skills)) {
    throw new CliError("skill-suite.json must contain schema_version 1.0 and a skills array");
  }
  for (const placeholder of ["{{short_description}}", "{{instruction}}", "{{skill}}"] ) {
    if (!template.includes(placeholder)) {
      throw new CliError(`command-adapter.md must contain ${placeholder}`);
    }
  }
  const seen = new Set();
  const skills = [];
  for (const skill of manifest.skills) {
    const dispatch = skill?.dispatch ?? "fixed";
    if (
      !skill ||
      typeof skill.name !== "string" ||
      !/^ontotect(?:-[a-z0-9-]+)?$/.test(skill.name) ||
      typeof skill.display_name !== "string" ||
      skill.display_name.trim() === "" ||
      typeof skill.short_description !== "string" ||
      skill.short_description.trim() === "" ||
      skill.short_description.length > 64 ||
      typeof skill.description !== "string" ||
      skill.description.trim() === "" ||
      typeof skill.command !== "string" ||
      !SKILL_COMMANDS.has(skill.command) ||
      typeof skill.instruction !== "string" ||
      skill.instruction.trim() === "" ||
      !["conditional", "fixed"].includes(dispatch)
    ) {
      throw new CliError("skill-suite.json contains an invalid skill entry");
    }
    if (seen.has(skill.name)) {
      throw new CliError(`duplicate skill-suite entry: ${skill.name}`);
    }
    seen.add(skill.name);
    if (skill.name === SKILL_NAME && dispatch !== "conditional") {
      throw new CliError("the ontotect root skill must use conditional dispatch");
    }
    if (skill.name !== SKILL_NAME && dispatch !== "fixed") {
      throw new CliError(`focused skill ${skill.name} must use fixed dispatch`);
    }
    skills.push({ ...skill, dispatch });
  }
  if (!seen.has(SKILL_NAME)) {
    throw new CliError("skill-suite.json must define the ontotect root skill");
  }
  return { skills, template };
}

function selectedSuiteSkills(options, suite) {
  if (options.suite === "core") {
    return suite.skills.filter((skill) => skill.name === SKILL_NAME);
  }
  return suite.skills;
}

function renderCommandAdapter(template, skill) {
  return template
    .replaceAll("{{short_description}}", skill.short_description)
    .replaceAll("{{instruction}}", skill.instruction)
    .replaceAll("{{skill}}", skill.name);
}

function yamlString(value) {
  return JSON.stringify(value);
}

function renderOpenAiYaml(skill) {
  if (skill.dispatch !== "fixed") {
    throw new CliError(`generated skill ${skill.name} must use fixed dispatch`);
  }
  const prompt = `Use $${skill.name} for the user's request. Execute the fixed Ontotect command ${skill.command} and follow the installed skill instructions.`;
  return `interface:\n  display_name: ${yamlString(skill.display_name)}\n  short_description: ${yamlString(skill.short_description)}\n  default_prompt: ${yamlString(prompt)}\n`;
}

function renderGeneratedSkill(canonical, skill) {
  return [
    "---",
    `name: ${skill.name}`,
    `description: ${yamlString(skill.description)}`,
    "---",
    "",
    `# ${skill.display_name}`,
    "",
    "This is a generated, independently discoverable entry point in the Ontotect",
    "skill suite. It carries the complete canonical workflow and fixes the user's",
    `selected operation to \`${skill.command}\`.`,
    "",
    "## Fixed command contract",
    "",
    skill.instruction,
    "",
    "Treat selection of this skill as an explicit Ontotect command, including when",
    "no additional arguments were supplied. Preserve the user's named target,",
    "constraints, requested output, and authorization boundary. Do not fall back to",
    "`help` or `router`, and do not replace this command through intent inference;",
    "compose a downstream mode only when the canonical command contract and the",
    "user's request require it.",
    "",
    "## Canonical Ontotect operating contract",
    "",
    canonical.body
  ].join("\n");
}

async function buildPlan(options) {
  const roots = options.scope === "user" ? userRoots(homedir()) : projectRoots(options.projectRoot);
  const anchor = installAnchor(options);
  const plan = [];
  const seen = new Set();
  for (const agent of options.agents) {
    const destination = resolve(roots[agent], SKILL_NAME);
    const normalized = process.platform === "win32" ? destination.toLowerCase() : destination;
    if (seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    if (pathsOverlap(SOURCE, destination)) {
      throw new CliError(`source and destination must not overlap: ${destination}`);
    }
    const resolvedDestination = await inspectDestination(
      anchor,
      destination,
      "directory",
      !options.dryRun
    );
    const destinationExists = await exists(destination);
    plan.push({
      agent,
      skill: SKILL_NAME,
      source: SOURCE,
      destination,
      resolved_destination: resolvedDestination,
      exists: destinationExists,
      action: destinationExists ? (options.force ? "replace" : "blocked") : "copy",
      status: destinationExists && !options.force ? "blocked" : "planned"
    });
  }
  return plan;
}

async function buildSuitePlan(options, suite) {
  if (options.suite === "core") {
    return [];
  }
  const roots = options.scope === "user" ? userRoots(homedir()) : projectRoots(options.projectRoot);
  const anchor = installAnchor(options);
  const entries = suite.skills.filter((skill) => skill.name !== SKILL_NAME);
  const plan = [];
  for (const agent of options.agents) {
    const destination = resolve(roots[agent]);
    const skills = [];
    for (const entry of entries) {
      const skillDestination = join(destination, entry.name);
      const resolvedDestination = await inspectDestination(
        anchor,
        skillDestination,
        "directory",
        !options.dryRun
      );
      const skillExists = await exists(skillDestination);
      skills.push({
        skill: entry.name,
        command: entry.command,
        destination: skillDestination,
        resolved_destination: resolvedDestination,
        exists: skillExists,
        status: skillExists && !options.force ? "blocked" : "planned"
      });
    }
    const conflicts = skills.filter((item) => item.exists).map((item) => item.destination);
    plan.push({
      agent,
      source: SOURCE,
      destination,
      count: skills.length,
      exists: conflicts.length > 0,
      conflicts,
      action: conflicts.length > 0 ? (options.force ? "replace" : "blocked") : "generate",
      status: conflicts.length > 0 && !options.force ? "blocked" : "planned",
      skills
    });
  }
  return plan;
}

async function buildCommandPlan(options, suite) {
  if (options.commandAdapters === "none") {
    return [];
  }
  const roots =
    options.scope === "user"
      ? userCommandRoots(homedir())
      : projectCommandRoots(options.projectRoot);
  const entries = selectedSuiteSkills(options, suite);
  const anchor = installAnchor(options);
  const plan = [];
  for (const agent of options.agents) {
    if (!COMMAND_AGENTS.has(agent)) {
      continue;
    }
    const destination = resolve(roots[agent]);
    const files = [];
    for (const skill of entries) {
      const fileDestination = join(destination, `${skill.name}.md`);
      const resolvedDestination = await inspectDestination(
        anchor,
        fileDestination,
        "file",
        !options.dryRun
      );
      const fileExists = await exists(fileDestination);
      files.push({
        command: skill.name,
        skill: skill.name,
        destination: fileDestination,
        resolved_destination: resolvedDestination,
        exists: fileExists,
        status: fileExists && !options.force ? "blocked" : "planned"
      });
    }
    const conflicts = files.filter((item) => item.exists).map((item) => item.destination);
    plan.push({
      agent,
      source: SUITE_MANIFEST,
      destination,
      count: files.length,
      exists: conflicts.length > 0,
      conflicts,
      action: conflicts.length > 0 ? (options.force ? "overwrite" : "blocked") : "generate",
      status: conflicts.length > 0 && !options.force ? "blocked" : "planned",
      files
    });
  }
  return plan;
}

async function buildCleanupPlan(options, suite, plan) {
  const anchor = installAnchor(options);
  const skillRoots = options.scope === "user" ? userRoots(homedir()) : projectRoots(options.projectRoot);
  const commandRoots =
    options.scope === "user"
      ? userCommandRoots(homedir())
      : projectCommandRoots(options.projectRoot);
  const desiredSkills = selectedSuiteSkills(options, suite).map((skill) => skill.name);
  const cleanupPlan = [];

  for (const item of plan) {
    const statePath = join(item.destination, INSTALL_STATE_FILE);
    await inspectDestination(anchor, statePath, "file", false);
    const previous = await loadManagedState(item.destination);
    const desiredCommands =
      options.commandAdapters === "auto" && COMMAND_AGENTS.has(item.agent)
        ? [...desiredSkills]
        : [];
    const desiredSkillSet = new Set(desiredSkills);
    const desiredCommandSet = new Set(desiredCommands);
    const staleSkills = [];
    const staleCommands = [];

    for (const name of previous.skills) {
      if (!desiredSkillSet.has(name)) {
        const destination = join(skillRoots[item.agent], name);
        const resolvedDestination = await inspectDestination(
          anchor,
          destination,
          "directory",
          !options.dryRun
        );
        staleSkills.push({
          skill: name,
          destination,
          resolved_destination: resolvedDestination,
          exists: await exists(destination),
          status: "planned"
        });
      }
    }
    if (COMMAND_AGENTS.has(item.agent)) {
      for (const name of previous.commands) {
        if (!desiredCommandSet.has(name)) {
          const destination = join(commandRoots[item.agent], `${name}.md`);
          const resolvedDestination = await inspectDestination(
            anchor,
            destination,
            "file",
            !options.dryRun
          );
          staleCommands.push({
            command: name,
            destination,
            resolved_destination: resolvedDestination,
            exists: await exists(destination),
            status: "planned"
          });
        }
      }
    }

    cleanupPlan.push({
      agent: item.agent,
      state: statePath,
      state_exists: previous.exists,
      desired_skills: desiredSkills,
      desired_commands: desiredCommands,
      stale_skills: staleSkills,
      stale_commands: staleCommands,
      status: "planned"
    });
  }
  return cleanupPlan;
}

function shouldIgnore(name, isDirectory) {
  if (isDirectory && IGNORED_DIRECTORY_NAMES.has(name)) {
    return true;
  }
  return !isDirectory && (IGNORED_FILE_NAMES.has(name) || name.endsWith(".pyc"));
}

async function copyDirectory(source, destination) {
  await mkdir(destination, { recursive: true });
  const entries = await readdir(source, { withFileTypes: true });
  for (const entry of entries) {
    if (shouldIgnore(entry.name, entry.isDirectory())) {
      continue;
    }
    const sourcePath = join(source, entry.name);
    const destinationPath = join(destination, entry.name);
    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, destinationPath);
    } else if (entry.isFile()) {
      await copyFile(sourcePath, destinationPath);
    } else {
      throw new CliError(`unsupported non-file entry in skill package: ${sourcePath}`, 1);
    }
  }
}

function managedStatePayload(cleanupItem) {
  return `${JSON.stringify(
    {
      skills: cleanupItem.desired_skills,
      commands: cleanupItem.desired_commands
    },
    null,
    2
  )}\n`;
}

function siblingWorkPath(destination, label) {
  const destinationParent = dirname(destination);
  return join(
    dirname(destinationParent),
    `.${basename(destinationParent)}-${basename(destination)}.ontotect-${label}-${process.pid}-${randomUUID()}`
  );
}

const RETRYABLE_FILESYSTEM_ERRORS = new Set(["EACCES", "EBUSY", "EPERM"]);

async function retryFilesystemOperation(operation) {
  const delays = [25, 50, 100, 200, 400, 800, 1200];
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (
        !error ||
        !RETRYABLE_FILESYSTEM_ERRORS.has(error.code) ||
        attempt >= delays.length
      ) {
        throw error;
      }
      await new Promise((resolveDelay) => setTimeout(resolveDelay, delays[attempt]));
    }
  }
}

async function renameManaged(source, destination) {
  await retryFilesystemOperation(() => rename(source, destination));
}

async function removeManaged(path, kind) {
  await retryFilesystemOperation(() =>
    rm(path, { recursive: kind === "directory", force: true })
  );
}

async function discardWorkPaths(operations) {
  for (const operation of operations) {
    if (operation.stage && (await exists(operation.stage))) {
      await removeManaged(operation.stage, operation.kind);
    }
  }
}

async function commitOperations(operations) {
  try {
    for (const operation of operations) {
      if (operation.action === "replace") {
        await mkdir(dirname(operation.destination), { recursive: true });
      }
      if (await exists(operation.destination)) {
        operation.backup = siblingWorkPath(operation.destination, "backup");
        await renameManaged(operation.destination, operation.backup);
      }
      if (operation.action === "replace") {
        await renameManaged(operation.stage, operation.destination);
      }
      operation.committed = true;
    }
  } catch (error) {
    const rollbackErrors = [];
    for (const operation of [...operations].reverse()) {
      if (!operation.committed && !operation.backup) {
        continue;
      }
      try {
        if (
          operation.committed &&
          operation.action === "replace" &&
          (await exists(operation.destination))
        ) {
          await removeManaged(operation.destination, operation.kind);
        }
        if (operation.backup && (await exists(operation.backup))) {
          await renameManaged(operation.backup, operation.destination);
        }
      } catch (rollbackError) {
        rollbackErrors.push(`${operation.destination}: ${rollbackError.message}`);
      }
    }
    await discardWorkPaths(operations);
    const suffix = rollbackErrors.length > 0 ? `; rollback errors: ${rollbackErrors.join("; ")}` : "";
    throw new CliError(`failed to commit the Ontotect install transaction: ${error.message}${suffix}`, 1);
  }

  for (const operation of operations) {
    if (operation.backup && (await exists(operation.backup))) {
      await removeManaged(operation.backup, operation.kind);
    }
  }
}

function allConflicts(options, plan, suitePlan, commandPlan) {
  if (options.force) {
    return [];
  }
  return [
    ...plan.filter((item) => item.exists).map((item) => item.destination),
    ...suitePlan.flatMap((item) => item.skills.filter((skill) => skill.exists).map((skill) => skill.destination)),
    ...commandPlan.flatMap((item) => item.files.filter((file) => file.exists).map((file) => file.destination))
  ];
}

async function install(options, plan, suitePlan, commandPlan, cleanupPlan, suite, canonical) {
  const conflicts = allConflicts(options, plan, suitePlan, commandPlan);
  if (conflicts.length > 0) {
    throw new CliError(
      `destination exists; refusing implicit overwrite: ${conflicts.join(", ")}. Re-run with --force to overwrite Ontotect-owned files explicitly.`,
      1
    );
  }

  const entries = new Map(suite.skills.map((skill) => [skill.name, skill]));
  const cleanupByAgent = new Map(cleanupPlan.map((item) => [item.agent, item]));
  const operations = [];

  try {
    for (const item of plan) {
      const stage = siblingWorkPath(item.destination, "stage");
      await mkdir(dirname(stage), { recursive: true });
      const operation = {
        action: "replace",
        kind: "directory",
        destination: item.destination,
        stage,
        record: item
      };
      operations.push(operation);
      await copyDirectory(SOURCE, stage);
      await writeFile(
        join(stage, INSTALL_STATE_FILE),
        managedStatePayload(cleanupByAgent.get(item.agent)),
        "utf8"
      );
    }

    for (const item of suitePlan) {
      for (const skillItem of item.skills) {
        const entry = entries.get(skillItem.skill);
        const stage = siblingWorkPath(skillItem.destination, "stage");
        await mkdir(dirname(stage), { recursive: true });
        const operation = {
          action: "replace",
          kind: "directory",
          destination: skillItem.destination,
          stage,
          record: skillItem
        };
        operations.push(operation);
        await copyDirectory(SOURCE, stage);
        await rm(join(stage, "scripts", "install_skill.py"), { force: true });
        await writeFile(
          join(stage, "SKILL.md"),
          renderGeneratedSkill(canonical, entry),
          "utf8"
        );
        await mkdir(join(stage, "agents"), { recursive: true });
        await writeFile(
          join(stage, "agents", "openai.yaml"),
          renderOpenAiYaml(entry),
          "utf8"
        );
      }
    }

    for (const item of commandPlan) {
      for (const file of item.files) {
        const entry = entries.get(file.skill);
        const stage = siblingWorkPath(file.destination, "stage");
        await mkdir(dirname(stage), { recursive: true });
        const operation = {
          action: "replace",
          kind: "file",
          destination: file.destination,
          stage,
          record: file
        };
        operations.push(operation);
        await writeFile(stage, renderCommandAdapter(suite.template, entry), "utf8");
      }
    }

    if (options.force) {
      for (const item of cleanupPlan) {
        for (const stale of item.stale_skills) {
          operations.push({
            action: "delete",
            kind: "directory",
            destination: stale.destination,
            stage: null,
            record: stale
          });
        }
        for (const stale of item.stale_commands) {
          operations.push({
            action: "delete",
            kind: "file",
            destination: stale.destination,
            stage: null,
            record: stale
          });
        }
      }
    }
  } catch (error) {
    await discardWorkPaths(operations);
    throw new CliError(`failed to stage the Ontotect install transaction: ${error.message}`, 1);
  }

  await commitOperations(operations);
  for (const operation of operations) {
    operation.record.status = operation.action === "delete" ? "removed" : "installed";
  }
  for (const item of suitePlan) {
    item.status = "installed";
  }
  for (const item of commandPlan) {
    item.status = "installed";
  }
  for (const item of cleanupPlan) {
    item.status = "complete";
  }
}

function resultPayload(options, plan, suitePlan, commandPlan, cleanupPlan) {
  return {
    command: options.command,
    dry_run: options.dryRun,
    scope: options.scope,
    agents: options.agents,
    suite: options.suite,
    commands: options.commandAdapters,
    source: SOURCE,
    targets: plan,
    suite_targets: suitePlan,
    command_targets: commandPlan,
    cleanup_targets: cleanupPlan
  };
}

function listPayload(suite) {
  return {
    name: SKILL_NAME,
    count: suite.skills.length,
    skills: suite.skills.map((skill) => ({
      name: skill.name,
      display_name: skill.display_name,
      command: skill.command,
      dispatch: skill.dispatch,
      description: skill.short_description
    })),
    invocation: {
      codex: "$<skill-name> or /skills",
      cursor: "/<skill-name>",
      claude: "/<skill-name>",
      kilo: "/<skill-name>",
      opencode: "/<skill-name> through installed adapters on stable releases"
    }
  };
}

function renderList(suite) {
  const lines = [
    `Ontotect skill suite (${suite.skills.length} discoverable entries)`,
    "",
    "Skill                     Dispatch                   Purpose",
    "------------------------  -------------------------  -----------------------------------------------"
  ];
  for (const skill of suite.skills) {
    const dispatch = skill.dispatch === "conditional" ? "help | explicit | router" : skill.command;
    lines.push(
      `${skill.name.padEnd(24)}  ${dispatch.padEnd(25)}  ${skill.short_description}`
    );
  }
  lines.push(
    "",
    "Codex: use $<skill-name> or /skills. Cursor and Claude: use /<skill-name>.",
    "Kilo/OpenCode: the installer adds command adapters where native skill slash discovery is not guaranteed."
  );
  return lines.join("\n");
}

function renderHuman(options, plan, suitePlan, commandPlan, cleanupPlan) {
  const heading = options.dryRun ? "PLAN" : "INSTALL";
  const lines = [
    `${heading}: ${SKILL_NAME} (${options.scope} scope, ${options.suite} suite)`,
    `Source: ${SOURCE}`
  ];
  for (const item of plan) {
    const suffix = item.exists ? " (exists)" : "";
    lines.push(`- ${item.agent} core: ${item.destination}${suffix} -> ${item.status}`);
  }
  for (const item of suitePlan) {
    const suffix = item.exists ? ` (${item.conflicts.length} existing skill(s))` : "";
    lines.push(
      `- ${item.agent} suite: ${item.destination} (${item.count} generated entries)${suffix} -> ${item.status}`
    );
  }
  for (const item of commandPlan) {
    const suffix = item.exists ? ` (${item.conflicts.length} existing file(s))` : "";
    lines.push(
      `- ${item.agent} commands: ${item.destination} (${item.count} adapters)${suffix} -> ${item.status}`
    );
  }
  const staleCount = cleanupPlan.reduce(
    (count, item) => count + item.stale_skills.length + item.stale_commands.length,
    0
  );
  if (staleCount > 0) {
    lines.push(
      `Managed cleanup: ${staleCount} stale target(s) recorded; removal requires --force.`
    );
  }
  if (commandPlan.length === 0 && options.commandAdapters === "auto") {
    lines.push("Command adapters: none required for the selected hosts; use native skill invocation.");
  }
  if (options.dryRun) {
    lines.push("No files were written. Run `ontotect install` with the reviewed options to install the suite.");
  }
  return lines.join("\n");
}

async function main(argv) {
  const options = parseArguments(argv);
  if (options.command === "help") {
    if (options.json) {
      console.log(JSON.stringify({ command: "help", help: helpText() }, null, 2));
    } else {
      console.log(helpText());
    }
    return 0;
  }

  const suite = await loadSuite();
  if (options.command === "list") {
    console.log(options.json ? JSON.stringify(listPayload(suite), null, 2) : renderList(suite));
    return 0;
  }

  const canonical = await validateSource(SOURCE);
  const plan = await buildPlan(options);
  const suitePlan = await buildSuitePlan(options, suite);
  const commandPlan = await buildCommandPlan(options, suite);
  const cleanupPlan = await buildCleanupPlan(options, suite, plan);
  if (!options.dryRun) {
    await install(options, plan, suitePlan, commandPlan, cleanupPlan, suite, canonical);
  }
  if (options.json) {
    console.log(
      JSON.stringify(resultPayload(options, plan, suitePlan, commandPlan, cleanupPlan), null, 2)
    );
  } else {
    console.log(renderHuman(options, plan, suitePlan, commandPlan, cleanupPlan));
  }
  return 0;
}

const wantsJson = process.argv.slice(2).includes("--json");
main(process.argv.slice(2))
  .then((exitCode) => {
    process.exitCode = exitCode;
  })
  .catch((error) => {
    const exitCode = error instanceof CliError ? error.exitCode : 1;
    if (wantsJson) {
      console.log(
        JSON.stringify(
          {
            error: error.message,
            exit_code: exitCode
          },
          null,
          2
        )
      );
    } else {
      console.error(`error: ${error.message}`);
    }
    process.exitCode = exitCode;
  });
