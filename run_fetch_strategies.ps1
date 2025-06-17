# Freqtrade Strategies Fetcher Script (PowerShell)
# Fetches trading strategies from GitHub repository and inserts into database

Write-Host "=== Freqtrade Strategies Fetcher ===" -ForegroundColor Green
Write-Host "Starting strategies fetch process..." -ForegroundColor Yellow

# Change to server directory
Set-Location -Path "server" -ErrorAction SilentlyContinue

if (-not (Test-Path -Path "." -PathType Container)) {
    Write-Host "Server directory not found. Make sure you're in the project root." -ForegroundColor Red
    exit 1
}

# Check if virtual environment exists and activate it
if (Test-Path -Path "venv\Scripts\Activate.ps1") {
    Write-Host "Activating virtual environment..." -ForegroundColor Yellow
    & "venv\Scripts\Activate.ps1"
}
elseif (Test-Path -Path ".venv\Scripts\Activate.ps1") {
    Write-Host "Activating virtual environment..." -ForegroundColor Yellow
    & ".venv\Scripts\Activate.ps1"
}

# Install required dependencies if needed
Write-Host "Checking dependencies..." -ForegroundColor Yellow
try {
    pip install requests pymongo python-dotenv
    Write-Host "Dependencies checked successfully." -ForegroundColor Green
}
catch {
    Write-Host "Warning: Could not install dependencies. Please install manually." -ForegroundColor Yellow
}

# Run the fetch script
Write-Host "Running strategies fetch script..." -ForegroundColor Yellow
try {
    python fetch_strategies_from_github.py
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Strategies fetch completed successfully!" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Strategies fetch failed with exit code: $LASTEXITCODE" -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ Error running strategies fetch script: $_" -ForegroundColor Red
}

Write-Host "Strategies fetch process completed!" -ForegroundColor Green 