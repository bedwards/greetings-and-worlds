#!/bin/sh

set -eu
echo '+ npm ci (clean install)'
npm ci
set -x
npm run lint -- --fix
npm run test:coverage
