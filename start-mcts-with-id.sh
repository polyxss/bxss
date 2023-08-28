#!/bin/bash

if [ -z $1 ];
then
	echo "Usage: sh start-mcts-with-id.sh <custom run identifier>";
	exit;
fi;

mkdir -p data/out/runs;
USERID=$(id -u) GROUPID=$(id -g) RUN_IDENTIFIER=$1 docker-compose -p bxss-mcts up -d --build;
