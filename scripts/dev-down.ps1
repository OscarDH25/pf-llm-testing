param(
  [ValidateSet("docker", "k8s")]
  [string]$Mode = "docker",
  [string]$DockerContainerName = "pf-llm-testing-app-local"
)

$ErrorActionPreference = "Stop"

switch ($Mode) {
  "docker" {
    docker rm -f $DockerContainerName
    break
  }

  "k8s" {
    & "$PSScriptRoot/k8s-delete-local.ps1"
    break
  }
}
