param(
  [ValidateSet("local", "docker", "k8s")]
  [string]$Mode = "local",
  [ValidateSet("mock", "ollama")]
  [string]$Provider = "mock",
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot

function Test-DockerAvailable {
  try {
    docker info *> $null
  } catch {
    throw "Docker Desktop is not running or the Docker daemon is unavailable."
  }
}

function Test-KubernetesAvailable {
  $context = kubectl config current-context 2>$null

  if (-not $context) {
    throw "kubectl has no current context. Start or configure a Kubernetes cluster first."
  }

  try {
    kubectl get nodes *> $null
  } catch {
    throw "The current Kubernetes context '$context' is not reachable. Start the cluster before running this script."
  }
}

switch ($Mode) {
  "local" {
    Write-Host "Starting the API directly with Node.js from app/..."
    npm --prefix "$root/app" start
    break
  }

  "docker" {
    Test-DockerAvailable
    & "$PSScriptRoot/docker-run-local.ps1" -Provider $Provider
    break
  }

  "k8s" {
    Test-DockerAvailable
    Test-KubernetesAvailable
    if ($SkipBuild) {
      & "$PSScriptRoot/k8s-deploy-local.ps1" -SkipBuild
    } else {
      & "$PSScriptRoot/k8s-deploy-local.ps1"
    }

    Write-Host ""
    Write-Host "Open local access with:"
    Write-Host ".\scripts\k8s-port-forward.ps1"
    Write-Host "The default local port for Kubernetes access is 3001."
    break
  }
}
