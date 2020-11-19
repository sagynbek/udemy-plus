// @ts-check
const bundleCSS = require("./bundle-css");
const bundleJS = require("./bundle-js");
const bundleLocales = require("./bundle-locales");
const clean = require("./clean");
const copy = require("./copy");
const reload = require("./reload");
const codeStyle = require("./code-style");
const zip = require("./zip");
const { runTasks } = require("./task");
const { log } = require("./utils");

const standardTask = [
  clean,
  bundleJS,
  bundleCSS,
  bundleLocales,
  copy,
];

async function release() {
  log.ok("RELEASE");
  try {
    await runTasks([...standardTask, codeStyle, zip], { debug: false, watch: false });
    log.ok("MISSION PASSED! RESPECT +");
  } catch (err) {
    log.error(`MISSION FAILED!`);
    process.exit(13);
  }
}

async function debug({ watch }) {
  log.ok("DEBUG");
  try {
    await runTasks(standardTask, { debug: true, watch: watch });
    if (watch) {
      standardTask.forEach((task) => task.watch());
      reload({ type: reload.FULL });
      log.ok("Watching...");
    } else {
      log.ok("MISSION PASSED! RESPECT +");
    }
  } catch (err) {
    log.error(`MISSION FAILED!`);
    process.exit(13);
  }
}


async function run() {
  const args = process.argv.slice(2);

  if (args.includes("--release")) {
    await release();
  }
  if (args.includes("--debug")) {
    await debug({ watch: args.includes("--watch") });
  }
}

run();
