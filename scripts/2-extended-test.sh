#!/bin/bash

COMMAND="main.ts --runnerType MCTS --tokenType XSS_TOKENS --maxRootDepth=10 --maxGenerationTries=1 --simulationsPerAction=50" \
USERID=$(id -u) \
GROUPID=$(id -g) \
RUN_IDENTIFIER=extended-test \
docker compose -p bxss-mcts up -d
