import * as fs from 'fs'
import * as ini from 'ini'
import * as child_process from 'child_process'
import * as readline from 'readline'

const CONF_PATH = 'conf.ini'
const err_list = [
    /The connection server failed and will be reconnected in five seconds, error Validation key/i
]

let npc_path = 'npc'
let npc_log_path = '/root/npc.log'
let npc_conf_path = 'npc.conf'

const ini_dom = ini.parse(fs.readFileSync(CONF_PATH).toString())

if (ini_dom.npc_path) {
    npc_path = ini_dom.npc_path
}

if (ini_dom.npc_conf_path) {
    npc_conf_path = ini_dom.npc_conf_path
}

if (ini_dom.log_path) {
    npc_log_path = ini_dom.log_path
}

const out_stream = fs.createWriteStream(npc_log_path, { flags: 'a' })
const logger = new console.Console(out_stream)

function run() {

    logger.log(`==================== launch ====================`)

    const proc = child_process.execFile(npc_path, [`-config=${npc_conf_path}`])

    if (proc.stdout) {
        const stdout = readline.createInterface(proc.stdout)
        stdout.on('line', (line) => {
            logger.log(line)
            for (const line_matcher of err_list) {
                if (line_matcher.test(line)) {
                    logger.log('found err !, require exit !')
                    proc.kill('SIGINT')
                }
            }
        })
    }

    if (proc.stderr) {
        const stderr = readline.createInterface(proc.stderr)
        stderr.on('line', (line) => {
            logger.log(line)
            for (const line_matcher of err_list) {
                if (line_matcher.test(line)) {
                    logger.log('found err !, require exit !')
                    proc.kill('SIGINT')
                }
            }
        })
    }

    proc.on('error', (err) => {
        if(err) {
            logger.log(err)
        }
    })

    proc.on('exit', (code, signal) => {

        logger.log(`npc exited, code: ${code}, signal: ${signal}, restart it after 5 sec delay !`)

        setTimeout(() => {
            run() // restart
        }, 5000)
    })
}

// launch
run()
