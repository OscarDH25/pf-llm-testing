param(
  [switch]$SkipBuild,
  [string]$ImageName = "pf-llm-testing-app",
  [string]$Namespace = "pf-llm-testing"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot

try {
  docker info *> $null
} catch {
  throw "Docker Desktop is not running or the Docker daemon is unavailable."
}

$context = kubectl config current-context 2>$null

if (-not $context) {
  throw "kubectl has no current context. Enable Docker Desktop Kubernetes or configure a local cluster first."
}

try {
  kubectl get nodes *> $null
} catch {
  throw "The current Kubernetes context '$context' is not reachable. Start the cluster before running this script."
}

if (-not $SkipBuild) {
  Write-Host "Building Docker image $ImageName..."
  docker build -t $ImageName "$root/app"
}

switch -Regex ($context) {
  "^kind-" {
    Write-Host "Loading image into kind cluster..."
    kind load docker-image "${ImageName}:latest"
    break
  }
  "^minikube$" {
    Write-Host "Loading image into minikube..."
    minikube image load "${ImageName}:latest"
    break
  }
  "^docker-desktop$" {
    Write-Host "Docker Desktop Kubernetes detected. No image load step needed."
    break
  }
  default {
    Write-Host "Current context '$context' has no automatic image-load step configured."
    Write-Host "If needed, load ${ImageName}:latest into the cluster manually before continuing."
  }
}

Write-Host "Applying Kubernetes manifests..."
kubectl apply -f "$root/k8s/namespace.yaml"
kubectl apply -f "$root/k8s/configmap.yaml"
kubectl apply -f "$root/k8s/deployment.yaml"
kubectl apply -f "$root/k8s/service.yaml"

Write-Host "Deployment status:"
kubectl get all -n $Namespace
