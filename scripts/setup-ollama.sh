#!/bin/bash
# Script to set up Ollama models for development

# Exit on error
set -e

echo "Starting to download required Ollama models..."

# Define the models to pull
MODELS=("gemma3")

# Pull each model
for model in "${MODELS[@]}"; do
    echo "Pulling model: ${model}"
    /bin/ollama pull ${model}
done

echo "All models have been successfully downloaded."