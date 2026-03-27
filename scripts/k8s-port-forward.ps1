param(
  [string]$Namespace = "pf-llm-testing",
  [string]$ServiceName = "pf-llm-testing-service",
  [int]$LocalPort = 3001,
  [int]$RemotePort = 3000
)

$ErrorActionPreference = "Stop"

$context = kubectl config current-context 2>$null

if (-not $context) {
  throw "kubectl has no current context. Start or configure a Kubernetes cluster first."
}

try {
  kubectl wait --for=condition=ready pod -n $Namespace -l app=pf-llm-testing-app --timeout=120s *> $null
} catch {
  throw "The Kubernetes application is not ready yet. Run .\scripts\dev-up.ps1 -Mode k8s first and wait for the rollout to complete."
}

kubectl port-forward -n $Namespace "service/$ServiceName" "${LocalPort}:${RemotePort}"
