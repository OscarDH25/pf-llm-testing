param(
  [string]$Namespace = "pf-llm-testing",
  [string]$ServiceName = "pf-llm-testing-service",
  [int]$LocalPort = 3000,
  [int]$RemotePort = 3000
)

$ErrorActionPreference = "Stop"

$context = kubectl config current-context 2>$null

if (-not $context) {
  throw "kubectl has no current context. Start or configure a Kubernetes cluster first."
}

kubectl port-forward -n $Namespace "service/$ServiceName" "${LocalPort}:${RemotePort}"
