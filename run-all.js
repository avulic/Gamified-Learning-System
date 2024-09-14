const { spawn } = require("child_process");
const path = require("path");

// Define your project paths relative to where this script is located
const projects = [
    { name: "Vue Frontend", path: "../Client/CRUD" },
    { name: "RPGJS Game", path: "../Game/rpg-game" },
    { name: "Node Backend", path: "../Server" },
];

function runCommand(command, args, cwd) {
    return new Promise((resolve, reject) => {
        const process = spawn(command, args, {
            cwd,
            shell: true,
            stdio: "inherit",
        });

        process.on("close", (code) => {
            if (code !== 0) {
                reject(new Error(`Command failed with exit code ${code}`));
                return;
            }
            resolve();
        });
    });
}

async function runDev() {
    const processes = projects.map((project) => {
        const projectPath = path.resolve(__dirname, project.path);
        console.log(`Starting ${project.name} in ${projectPath}`);
        return runCommand("npm", ["run", "dev"], projectPath);
    });

    try {
        await Promise.all(processes);
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

runDev();
