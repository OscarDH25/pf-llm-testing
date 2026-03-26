param(
  [string]$Namespace = "pf-llm-testing"
)

$ErrorActionPreference = "Stop"

$context = kubectl config current-context 2>$null

if (-not $context) {
  throw "kubectl has no current context. Start or configure a Kubernetes cluster first."
}

kubectl delete namespace $Namespace
