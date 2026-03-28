param(
  [ValidateSet("local", "docker", "k8s")]
  [string]$Mode = "local",
  [switch]$IncludeSuites
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot

switch ($Mode) {
  "local" { $baseUrl = "http://127.0.0.1:3000" }
  "docker" { $baseUrl = "http://127.0.0.1:3000" }
  "k8s" { $baseUrl = "http://127.0.0.1:3001" }
}

Write-Host "Running smoke checks against $baseUrl..."

try {
  $healthResponse = Invoke-WebRequest -UseBasicParsing "$baseUrl/health"
} catch {
  switch ($Mode) {
    "local" {
      throw "Could not reach the local Node.js app. Start it first with .\scripts\dev-up.ps1 -Mode local."
    }
    "docker" {
      throw "Could not reach the Docker app. Start it first with .\scripts\dev-up.ps1 -Mode docker."
    }
    "k8s" {
      throw "Could not reach the Kubernetes app. Start it first with .\scripts\dev-up.ps1 -Mode k8s and then run .\scripts\k8s-port-forward.ps1."
    }
  }
}

$healthBody = $healthResponse.Content | ConvertFrom-Json

Write-Host "Health status: $($healthBody.status)"
Write-Host "Health provider: $($healthBody.llmProvider)"

$body = @{
  question = "What is Docker?"
} | ConvertTo-Json

try {
  $askResponse = Invoke-WebRequest -UseBasicParsing `
    -Method POST `
    -Uri "$baseUrl/ask" `
    -ContentType "application/json" `
    -Body $body
} catch {
  throw "The ask endpoint could not be validated even though the health check responded. Review the running service logs before continuing."
}

$askBody = $askResponse.Content | ConvertFrom-Json

Write-Host "Ask source: $($askBody.source.id)"
Write-Host "Ask provider: $($askBody.providerUsed)"

if ($healthResponse.StatusCode -ne 200) {
  throw "Health check did not return HTTP 200."
}

if ($askResponse.StatusCode -ne 200) {
  throw "Ask endpoint did not return HTTP 200."
}

if ($askBody.source.id -ne "docker") {
  throw "Ask endpoint did not return the expected docker source."
}

if ($IncludeSuites) {
  Write-Host ""
  Write-Host "Running baseline Playwright suites..."
  npm --prefix "$root/app" run test:api
  npm --prefix "$root/app" run test:llm:mock
}
