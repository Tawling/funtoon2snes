// `npm run build:fun2n` (`-- --inc` also bumps the version): the build for
// the new FUNtoon server (see src/funtoonServer.js), into build-fun2n/, with
// the room-time overlay that talks to it (overlay/tracking.html).  The new
// server serves the folder as /funtoon2snes/.
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const out = path.join(root, "build-fun2n");

const result = spawnSync("npx", ["react-app-rewired", "build"], {
    cwd: root,
    stdio: "inherit",
    shell: true,
    env: { ...process.env, REACT_APP_FUNTOON_SERVER: "fun2n" },
});
if (result.status !== 0) {
    process.exit(result.status || 1);
}

if (process.argv.includes("--inc")) {
    // Open tabs poll version.txt and reload when it changes; same counter
    // as update-version.js uses for the legacy build.
    const file = path.join(root, "public", "version.txt");
    let n = 0;
    try {
        n = +fs.readFileSync(file, "utf8").trim() || 0;
    } catch (e) {}
    fs.writeFileSync(file, "" + (n + 1));
    fs.writeFileSync(path.join(out, "version.txt"), "" + (n + 1));
}

fs.copyFileSync(path.join(root, "overlay", "tracking.html"), path.join(out, "tracking.html"));
console.log("fun2n build written to build-fun2n/");
