param(
  [switch]$Backend,
  [switch]$Web,
  [switch]$Ai,
  [switch]$Mobile
)

if (-not ($Backend -or $Web -or $Ai -or $Mobile)) {
  Write-Host "Choose one or more: -Backend -Web -Ai -Mobile"
  exit 1
}

if ($Backend) {
  Push-Location backend
  .\mvnw spring-boot:run "-Dspring-boot.run.profiles=local"
  Pop-Location
}

if ($Web) {
  npm --workspace web run dev
}

if ($Ai) {
  Push-Location ai-service
  uvicorn app.main:app --reload --port 8010
  Pop-Location
}

if ($Mobile) {
  npm --workspace mobile run start
}
