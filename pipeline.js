const cp = require("child_process");
const util = require("util");

const childOptions = {
    shell: "bash",
    stdio: "inherit",
};

const npm = 'bun'

const exec = util.promisify(cp.exec);

(async () => {
    await Promise.all([
        cp.exec(`cd packages/editor/ && ${npm} i && ${npm} run build --emptyOutDir`, childOptions),
        cp.exec(`cd packages/extension/ && ${npm} run compile`, childOptions),
    ]);
})();
