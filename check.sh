#!/bin/sh

set -eu
echo '+ npm ci (clean install)'
npm ci
set -x
npm run lint
npm run test:coverage
