#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const { basename } = require('path')
require('colors')

const ownName = basename(process.argv[1])

if(process.argv.length < 3) {
    console.error(
`run with '${ownName} [--testrpc-cmd TESTRPC] [TestRPC options] cmd'

Make sure that cmd is a standalone shell argument.
For example, if trying to 'truffle migrate && truffle test'
alongside a TestRPC sc fork instance with 2 addresses:

  ${ownName} --testrpc-cmd testrpc-sc -a 2 'truffle migrate && truffle test'
`
    )
    process.exit(2)
}

let testrpcArgs = process.argv.slice(2, -1)
let testrpcCmd = 'ganache-cli'
if(testrpcArgs[0] === '--testrpc-cmd') {
    testrpcCmd = testrpcArgs[1]
    testrpcArgs = testrpcArgs.slice(2)
}
const cmd = process.argv[process.argv.length - 1]

let testrpc
new Promise((resolve, reject) => {
    const handleError = (err) => {
        if(err.code === 'ENOENT')
            return reject(new Error(`Could not find ${testrpcCmd}`))
        if(err.code === 'EACCES')
            return reject(new Error(`Need permission to execute ${testrpcCmd}`))
        return reject(err)
    }

    try {
        testrpc = spawn(testrpcCmd, testrpcArgs)
    } catch(err) {
        return handleError(err)
    }

    testrpc.stdout.on('data', (data) => {
        if(data.includes('Listening')) {
            resolve()
        }
    })

    let error = ''

    testrpc.stderr.on('data', (data) => {
        error += data
    })

    testrpc.on('error', handleError)

    testrpc.on('close', (code) =>
        reject(new Error(`${testrpcCmd} exited early with code ${code}`))
    )
}).then(() => {
    execSync(cmd, { stdio: 'inherit' })
}).then(() => {
    testrpc.kill()
    process.exit()
}).catch((err) => {
    if(testrpc) testrpc.kill()
    console.error(`\n  ${err.message.red}\n`)
    process.exit(1)
})
