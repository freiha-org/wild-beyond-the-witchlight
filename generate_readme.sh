#!/bin/bash

# Clear or create README.md
echo "# My Obsidian Notes\n" > README.md
echo "This repository contains my Obsidian notes, organized as follows:\n" >> README.md

# Function to URL-encode a string
urlencode() {
  local string="${1}"
  local strlen=${#string}
  local encoded=""
  local pos c o

  for (( pos=0 ; pos<strlen ; pos++ )); do
    c=${string:$pos:1}
    case "$c" in
      [-_.~a-zA-Z0-9] ) o="${c}" ;;
      * )               printf -v o '%%%02x' "'$c"
    esac
    encoded+="${o}"
  done
  echo "${encoded}"
}

# Function to process files and folders recursively
process_directory() {
  local dir="$1"
  local indent="$2"
  local relative_path="$3"

  # Use find to handle spaces in filenames
  find "$dir" -mindepth 1 -maxdepth 1 | sort | while IFS= read -r item; do
    local item_name=$(basename "$item")
    # Skip hidden folders, README.md, and the script itself
    if [[ "$item_name" == .* || "$item_name" == "README.md" || "$item_name" == "generate_readme.sh" ]]; then
      continue
    fi
    if [ -d "$item" ]; then
      # If it's a directory, add it to README.md and recurse
      local folder_name=$(basename "$item")
      local encoded_folder=$(urlencode "$folder_name")
      echo "${indent}- 📁 [$folder_name](${relative_path}${encoded_folder}/)" >> README.md
      process_directory "$item" "$indent  " "${relative_path}${encoded_folder}/"
    else
      # If it's a Markdown file, add it to README.md (without .md extension)
      if [[ "$item" == *.md ]]; then
        local file_name=$(basename "$item" .md)
        local encoded_file=$(urlencode "$file_name")
        echo "${indent}- 📄 [$file_name](${relative_path}${encoded_file}.md)" >> README.md
      fi
    fi
  done
}

# Start processing from the root folder
process_directory "." "" ""