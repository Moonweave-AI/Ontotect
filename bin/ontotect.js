#!/usr/bin/env node

import { copyFile, mkdir, readFile, readdir, stat } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SKILL_NAME = "ontotect";
const AGENTS = ["cursor", "codex", "kilo", "opencode", "claude"];
const COMMANDS = new Set(["install", "plan", "help"]);
const SCOPES = new Set(["project", "user"]);
const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = join(PACKAGE_ROOT, SKILL_NAME);
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
  return `Ontotect skill installer

Usage:
  ontotect help
  ontotect plan [options]
  ontotect install [options]

Commands:
  help       Show this help. Never installs anything.
  plan       Show exact destinations. Never writes files.
  install    Copy the complete Ontotect skill to selected destinations.

Options:
  --agents <list>        Comma-separated cursor,codex,kilo,opencode,claude,all
                         (default: all)
  --scope <scope>        project or user (default: project)
  --project-root <path>  Project root (default: current working directory)
  --force                Merge into existing destinations and overwrite files
  --dry-run              Make install render a plan without writing
  --json                 Emit machine-readable JSON
  -h, --help             Show help

Examples:
  ontotect plan --agents all --project-root .
  ontotect install --agents cursor,codex --scope project
  ontotect install --agents all --scope user --dry-run --json

The installer has no runtime dependencies, postinstall hook, network access,
tool-version check, dependency lock, or implicit overwrite.`;
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

function parseArguments(argv) {
  if (argv.length === 0 || argv[0] === "-h" || argv[0] === "--help") {
    return {
      command: "help",
      agents: [...AGENTS],
      scope: "project",
      projectRoot: resolve(process.cwd()),
      force: false,
      dryRun: true,
      json: false
    };
  }

  const command = argv[0].toLowerCase();
  if (!COMMANDS.has(command)) {
    throw new CliError(`unknown command: ${argv[0]}; use install, plan, or help`);
  }

  if (command === "help") {
    let json = false;
    for (const argument of argv.slice(1)) {
      if (argument === "--json") {
        json = true;
      } else if (argument !== "-h" && argument !== "--help") {
        throw new CliError("help accepts only --json or --help");
      }
    }
    return {
      command: "help",
      agents: [...AGENTS],
      scope: "project",
      projectRoot: resolve(process.cwd()),
      force: false,
      dryRun: true,
      json
    };
  }

  let scope = "project";
  let projectRoot = resolve(process.cwd());
  let force = false;
  let dryRun = command !== "install";
  let json = false;
  const agentValues = [];

  for (let index = 1; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "-h" || argument === "--help") {
      return {
        command: "help",
        agents: [...AGENTS],
        scope,
        projectRoot,
        force: false,
        dryRun: true,
        json
      };
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
        scope = value;
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
        projectRoot = resolve(value);
        break;
      }
      case "--force":
        if (inlineValue !== null) {
          throw new CliError("--force does not take a value");
        }
        force = true;
        break;
      case "--dry-run":
        if (inlineValue !== null) {
          throw new CliError("--dry-run does not take a value");
        }
        dryRun = true;
        break;
      case "--json":
        if (inlineValue !== null) {
          throw new CliError("--json does not take a value");
        }
        json = true;
        break;
      default:
        throw new CliError(`unknown option or argument: ${argument}`);
    }
  }

  return {
    command,
    agents: agentValues.length > 0 ? parseAgents(agentValues) : [...AGENTS],
    scope,
    projectRoot,
    force,
    dryRun,
    json
  };
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

function pathsOverlap(left, right) {
  const fromLeft = relative(left, right);
  const fromRight = relative(right, left);
  const rightInsideLeft = fromLeft === "" || (!fromLeft.startsWith("..") && !isAbsolute(fromLeft));
  const leftInsideRight = fromRight === "" || (!fromRight.startsWith("..") && !isAbsolute(fromRight));
  return rightInsideLeft || leftInsideRight;
}

async function validateSource(source) {
  if (basename(source) !== SKILL_NAME) {
    throw new CliError(`skill directory must be named ${SKILL_NAME}`);
  }
  const skillFile = join(source, "SKILL.md");
  let text;
  try {
    text = await readFile(skillFile, "utf8");
  } catch (error) {
    throw new CliError(`cannot read required skill file ${skillFile}: ${error.message}`);
  }
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
}

async function buildPlan(options) {
  const roots = options.scope === "user" ? userRoots(homedir()) : projectRoots(options.projectRoot);
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
    const destinationExists = await exists(destination);
    plan.push({
      agent,
      source: SOURCE,
      destination,
      exists: destinationExists,
      action: destinationExists ? (options.force ? "merge" : "blocked") : "copy",
      status: destinationExists && !options.force ? "blocked" : "planned"
    });
  }
  return plan;
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

async function install(options, plan) {
  const conflicts = plan.filter((item) => item.exists && !options.force);
  if (conflicts.length > 0) {
    const destinations = conflicts.map((item) => item.destination).join(", ");
    throw new CliError(
      `destination exists; refusing implicit overwrite: ${destinations}. Re-run with --force to merge explicitly.`,
      1
    );
  }
  for (const item of plan) {
    try {
      await copyDirectory(SOURCE, item.destination);
      item.status = "installed";
    } catch (error) {
      item.status = "failed";
      item.error = error.message;
      throw new CliError(`failed to install ${item.agent}: ${error.message}`, 1);
    }
  }
}

function resultPayload(options, plan) {
  return {
    command: options.command,
    dry_run: options.dryRun,
    scope: options.scope,
    agents: options.agents,
    source: SOURCE,
    targets: plan
  };
}

function renderHuman(options, plan) {
  const heading = options.dryRun ? "PLAN" : "INSTALL";
  const lines = [`${heading}: ${SKILL_NAME} (${options.scope} scope)`, `Source: ${SOURCE}`];
  for (const item of plan) {
    const suffix = item.exists ? " (exists)" : "";
    lines.push(`- ${item.agent}: ${item.destination}${suffix} -> ${item.status}`);
  }
  if (options.dryRun) {
    lines.push("No files were written. Run `ontotect install` with the reviewed options to copy the skill.");
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

  await validateSource(SOURCE);
  const plan = await buildPlan(options);
  if (!options.dryRun) {
    await install(options, plan);
  }
  if (options.json) {
    console.log(JSON.stringify(resultPayload(options, plan), null, 2));
  } else {
    console.log(renderHuman(options, plan));
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
