#!/bin/sh
set -e

# Function to substitute environment variables in files
substitute_env_vars() {
    local file=$1
    if [ -f "$file" ]; then
        # Replace environment variables in JavaScript files
        envsubst < "$file" > "$file.tmp" && mv "$file.tmp" "$file"
    fi
}

# Find and process all JavaScript files for environment variable substitution
find /usr/share/nginx/html -name "*.js" -type f | while read -r file; do
    substitute_env_vars "$file"
done

# Start nginx
exec "$@"