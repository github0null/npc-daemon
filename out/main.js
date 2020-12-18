"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __importStar(require("fs"));
var ini = __importStar(require("ini"));
var child_process = __importStar(require("child_process"));
var readline = __importStar(require("readline"));
var CONF_PATH = './conf.ini';
var err_list = [
    /The connection server failed and will be reconnected in five seconds, error Validation key/i.compile()
];
var npc_path = 'npc';
var npc_log_path = '/root/npc.log';
var npc_conf_path = 'npc.conf';
var ini_dom = ini.parse(fs.readFileSync(CONF_PATH).toString());
if (ini_dom.npc_path) {
    npc_path = ini_dom.npc_path;
}
if (ini_dom.npc_conf_path) {
    npc_conf_path = ini_dom.npc_conf_path;
}
if (ini_dom.log_path) {
    npc_log_path = ini_dom.log_path;
}
var out_stream = fs.createWriteStream(npc_log_path, { flags: 'a' });
var logger = new console.Console(out_stream);
function run() {
    logger.log("==================== launch ====================");
    var proc = child_process.execFile(npc_path, ["-config=" + npc_conf_path]);
    if (proc.stdout) {
        var stdout = readline.createInterface(proc.stdout);
        stdout.on('line', function (line) {
            logger.log(line);
            for (var _i = 0, err_list_1 = err_list; _i < err_list_1.length; _i++) {
                var line_matcher = err_list_1[_i];
                if (line_matcher.test(line)) {
                    proc.kill('SIGINT');
                }
            }
        });
    }
    if (proc.stderr) {
        var stderr = readline.createInterface(proc.stderr);
        stderr.on('line', function (line) {
            logger.log(line);
            for (var _i = 0, err_list_2 = err_list; _i < err_list_2.length; _i++) {
                var line_matcher = err_list_2[_i];
                if (line_matcher.test(line)) {
                    proc.kill('SIGINT');
                }
            }
        });
    }
    proc.on('error', function (err) {
        if (err) {
            logger.log(err);
        }
    });
    proc.on('exit', function () {
        logger.log('npc exit, restart it after 5 sec delay !');
        /* setTimeout(() => {
            run() // restart
        }, 5000) */
    });
}
// launch
run();
//# sourceMappingURL=main.js.map