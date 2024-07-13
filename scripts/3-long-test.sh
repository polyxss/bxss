#!/bin/bash

COMMAND="main.ts --runnerType MCTS --tokenType XSS_TOKENS --maxRootDepth=10 --maxGenerationTries=1 --simulationsPerAction=1000" \
USERID=$(id -u) \
GROUPID=$(id -g) \
RUN_IDENTIFIER=long-test \
docker compose -p bxss-mcts up -d
