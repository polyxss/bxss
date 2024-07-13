#!/bin/bash

COMMAND="main.ts --runnerType MCTS --tokenType XSS_TOKENS --maxRootDepth=1 --maxGenerationTries=1 --simulationsPerAction=50" \
USERID=$(id -u) \
GROUPID=$(id -g) \
RUN_IDENTIFIER=basic-test \
docker compose -p bxss-mcts up -d
