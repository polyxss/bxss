#!/bin/bash

COMMAND="main.ts --runnerType MCTS --tokenType XSS_TOKENS --maxRootDepth=10 --maxGenerationTries=7 --simulationsPerAction=1200" \
USERID=$(id -u) \
GROUPID=$(id -g) \
RUN_IDENTIFIER=set-generation-test \
docker compose -p bxss-mcts up -d
