#!/bin/bash


# Clear or create README.md
echo "# My Obsidian Notes" > README.md
echo "This repository contains my Obsidian notes, organized as follows:" >> README.md

# Function to process files and folders recursively
process_directory() {
  local dir="$1"
  local indent="$2"

  # Use find to handle spaces in filenames
  find "$dir" -mindepth 1 -maxdepth 1 | sort | while IFS= read -r item; do
    local item_name=$(basename "$item")
    # Skip hidden folders, README.md, and the script itself
    if [[ "$item_name" == .* || "$item_name" == "README.md" || "$item_name" == "generate_readme.sh" ]]; then
      continue
    fi
    if [ -d "$item" ]; then
      # If it's a directory, add it to README.md and recurse
      echo "${indent}- 📁 [$item_name]($item_name/)" >> README.md
      process_directory "$item" "$indent  "
    else
      # If it's a Markdown file, add it to README.md
      if [[ "$item" == *.md ]]; then
        echo "${indent}- 📄 [$item_name]($item_name)" >> README.md
      fi
    fi
  done
}

# Start processing from the root folder
process_directory "." ""
