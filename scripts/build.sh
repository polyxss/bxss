#!/bin/bash
USERID=$(id -u) \
GROUPID=$(id -g) \
RUN_IDENTIFIER=build \
docker compose build
