param(
  [switch]$Backend,
  [switch]$Web,
  [switch]$Ai,
  [switch]$All
)

if ($All -or $Backend) {
  Push-Location backend
  .\mvnw test
  Pop-Location
}

if ($All -or $Web) {
  npm --workspace web run lint
  npm --workspace web run test
}

if ($All -or $Ai) {
  Push-Location ai-service
  pytest
  Pop-Location
}
