#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const { basename } = require('path')

const ownName = basename(process.argv[1])

if(process.argv.length < 3) {
    console.error(
`${ownName}: run with '${ownName} [TestRPC options] cmd'
Make sure that cmd is a standalone shell argument.
For example, if trying to 'truffle migrate && truffle test'
alongside a TestRPC instance with 2 addresses:

  ${ownName} -a 2 'truffle migrate && truffle test'`
    )
    process.exit(2)
}

const testrpcArgs = process.argv.slice(2, -1)
const cmd = process.argv[process.argv.length - 1]

const testrpc = spawn('testrpc', testrpcArgs)
new Promise((resolve, reject) => {
    testrpc.stdout.on('data', (data) => {
        if(data.includes('Listening on localhost:8545')) {
            resolve()
        }
    });

    let error = ''

    testrpc.stderr.on('data', (data) => {
        error += data
    })

    testrpc.on('close', (code) => {
        reject(new Error(`testrpc exited with code ${code} and the following error:\n\n${error}`));
    });

}).then(() => {
    execSync(cmd, { stdio: 'inherit' })
    return Promise.resolve()
}).then(() => {
    testrpc.kill()
    process.exit()
}).catch((err) => {
    testrpc.kill()
    console.error(err)
    process.exit(1)
})
