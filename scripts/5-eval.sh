#!/bin/bash

# Initialize an empty array to hold the valid folders
valid_folders=()

# Check each subfolder in ../data/out/runs/
for folder in data/out/runs/*; do
  # If /summary/final-polyglots exists in the folder, add it to the valid_folders array
  if [[ -e "$folder/summary/final-polyglots.json" ]]; then
    valid_folders+=("$folder")
  fi
done

# Display options to the user
echo "Please select a run to evaluate:"
for i in "${!valid_folders[@]}"; do
  echo "$((i+1)). ${valid_folders[$i]##*/}" # Display only the folder name, not the full path
done

# Get user's choice
read -p "Enter the number of your choice: " choice

# Validate choice and get folder name
if [[ $choice -ge 1 && $choice -le ${#valid_folders[@]} ]]; then
  folder=${valid_folders[$((choice-1))]}
else
  echo "Invalid choice. Exiting."
  exit 1
fi

# Form the input_path
input_path="/usr/src/$folder/summary/final-polyglots.json"
echo "Reading $input_path"

output_path="/usr/src/$folder/summary/"
echo "Writing to $output_path"

# Craft the COMMAND
COMMAND="polytest.ts '$input_path' '$output_path'" \
USERID=$(id -u) \
GROUPID=$(id -g) \
RUN_IDENTIFIER=polytest \
docker compose up --attach runner # -d

exit 0
