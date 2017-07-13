# run-with-testrpc
Runs commands with TestRPC in the background. Install with:

```
npm i --save-dev run-with-testrpc
```

Basic usage example:

```
./node_modules/.bin/run-with-testrpc 'truffle test'
```

Note that the command is one shell argument.


You can run a TestRPC sc fork instance using 32 addresses with:

```
./node_modules/.bin/run-with-testrpc --testrpc-cmd testrpc-sc -a 32 'truffle migrate && truffle test'
```
