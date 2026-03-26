param(
  [ValidateSet("mock", "ollama")]
  [string]$Provider = "mock",
  [string]$ImageName = "pf-llm-testing-app",
  [string]$ContainerName = "pf-llm-testing-app-local",
  [string]$Model = "qwen2.5:3b",
  [string]$OllamaBaseUrl = "http://host.docker.internal:11434"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot

try {
  docker info *> $null
} catch {
  throw "Docker Desktop is not running or the Docker daemon is unavailable."
}

Write-Host "Building Docker image $ImageName..."
docker build -t $ImageName "$root/app"

$envArgs = @(
  "-e", "HOST=0.0.0.0",
  "-e", "LLM_PROVIDER=$Provider"
)

if ($Provider -eq "ollama") {
  $envArgs += @(
    "-e", "OLLAMA_BASE_URL=$OllamaBaseUrl",
    "-e", "OLLAMA_MODEL=$Model"
  )
}

Write-Host "Starting container $ContainerName..."
docker run --rm --name $ContainerName -p 3000:3000 @envArgs $ImageName
