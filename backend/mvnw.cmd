@echo off
setlocal
where mvn >nul 2>nul
if errorlevel 1 (
  echo Maven is not installed or not on PATH. Install Maven, then run: mvn %*
  exit /b 1
)
mvn %*
