#!/bin/bash

# Error messages are redirected to stderr
function handle_error {
  echo "$(basename $0): ERROR! An error was encountered executing line $1." 1>&2;
  echo 'Exiting with error.' 1>&2;
  exit 1
}

# Exit the script with a helpful error message when any error is encountered
trap 'set +x; handle_error $LINENO $BASH_COMMAND' ERR

# Echo every command being executed
set -x

echo 'Babel sandbox tests'
cd test/babel-sandbox

echo 'Installing test package'
yarn
rm -f ./node_modules/runjs
ln -s ../../../ ./node_modules/runjs

echo 'Testing test package'
../../bin/run.js echo 1 2 3
../../bin/run.js testapi
../../bin/run.js testasyncawait
../../bin/run.js n1:nested1
../../bin/run.js n1:nested2:echo

echo 'TypeScript sandbox tests'
cd ../typescript-sandbox

echo 'Installing test package'
yarn
rm -f ./node_modules/runjs
ln -s ../../../ ./node_modules/runjs

echo 'Testing test package'
../../bin/run.js echo 1 2 3
../../bin/run.js testapi
../../bin/run.js testasyncawait
../../bin/run.js n1:nested1
../../bin/run.js n1:nested2:echo
