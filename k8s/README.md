# Kubernetes foundation

This directory contains a first local Kubernetes deployment setup for the project.

Included resources:

- `namespace.yaml`
- `configmap.yaml`
- `deployment.yaml`
- `service.yaml`

The default configuration uses the `mock` provider on purpose so the deployment stays stable and reproducible.

## Recommended local workflow

This setup has already been validated against Docker Desktop Kubernetes with the `docker-desktop` context.

If you want a shorter workflow from the repository root, you can use:

```powershell
.\scripts\dev-up.ps1 -Mode k8s
.\scripts\k8s-port-forward.ps1
.\scripts\dev-test.ps1 -Mode k8s
```

The deploy script now fails early with a clearer message if Docker Desktop is down or if the current Kubernetes context is not reachable.
It also waits for the deployment rollout so you do not need to guess when the pod is ready.
The port-forward helper now uses local port `3001` by default to avoid common conflicts with local runs on `3000`.

Before running `k8s-port-forward`, make sure nothing else is already listening on local port `3000`, such as:

- `npm start`
- `.\scripts\dev-up.ps1 -Mode docker`

Build the application image from the repository root:

```bash
docker build -t pf-llm-testing-app ./app
```

If you use a local cluster, make the image available there first.

Examples:

For `kind`:

```bash
kind load docker-image pf-llm-testing-app:latest
```

For `minikube`:

```bash
minikube image load pf-llm-testing-app:latest
```

Then apply the manifests:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

If you use Docker Desktop Kubernetes, you can verify the cluster first with:

```bash
kubectl config current-context
kubectl get nodes
```

Check the deployment:

```bash
kubectl get all -n pf-llm-testing
```

To test the API locally through the service:

```bash
kubectl port-forward -n pf-llm-testing service/pf-llm-testing-service 3001:3000
```

Then call:

```bash
GET /health
POST /ask
```

PowerShell examples:

```powershell
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3001/health
```

```powershell
$body = @{
  question = "What is Docker?"
} | ConvertTo-Json

Invoke-WebRequest -UseBasicParsing `
  -Method POST `
  -Uri http://127.0.0.1:3001/ask `
  -ContentType "application/json" `
  -Body $body
```

## Switching to Ollama later

This first setup keeps `LLM_PROVIDER=mock`.

If you want to experiment later with Ollama from Kubernetes, update `k8s/configmap.yaml` and make sure the chosen cluster can actually reach the Ollama endpoint.
