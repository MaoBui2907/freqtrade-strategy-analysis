# Freqtrade Pairs Fetcher Script (PowerShell)
# Fetches trading pairs from remotepairlist.com and inserts into database

Write-Host "=== Freqtrade Pairs Fetcher ===" -ForegroundColor Green
Write-Host "Starting pairs fetch process..." -ForegroundColor Yellow

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
Write-Host "Running pairs fetch script..." -ForegroundColor Yellow
try {
    python fetch_pairs_from_remote.py
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Pairs fetch completed successfully!" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Pairs fetch failed with exit code: $LASTEXITCODE" -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ Error running pairs fetch script: $_" -ForegroundColor Red
}

Write-Host "Pairs fetch process completed!" -ForegroundColor Green 