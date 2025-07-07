# Read configuration from JSON file
$config = Get-Content -Path "configurate.json" | ConvertFrom-Json

$textExtensions = @(".log", ".txt", ".dnt")  # Расширения текстовых файлов

# Бесконечный цикл
while ($true) {
    # Check folder exists
    if (-not (Test-Path -Path $config.folderPath)) {
        Write-Host "Error: Folder $($config.folderPath) not found!" -ForegroundColor Red
        Start-Sleep -Seconds 60
        continue
    }

    # Get all files
    $files = Get-ChildItem -Path $config.folderPath -File

    foreach ($file in $files) {
        try {
            $isTextFile = $textExtensions -contains $file.Extension.ToLower()
            
            if ($isTextFile) {
                # Читаем текстовые файлы как текст
                $fileContent = [System.IO.File]::ReadAllText($file.FullName)
                $isBinary = $false
            } else {
                # Читаем бинарные файлы как Base64
                $fileContent = [Convert]::ToBase64String([System.IO.File]::ReadAllBytes($file.FullName))
                $isBinary = $true
            }

            # Prepare request
            $body = @{
                machineId = $config.machineId
                filename = $file.Name
                content = $fileContent
                isBinary = $isBinary
            } | ConvertTo-Json -Depth 5

            # Send request
            $response = Invoke-RestMethod -Uri $config.serverUrl -Method Post -Body $body -ContentType "application/json"
            
            Write-Host "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - Successfully sent $($file.Name). Server response: $($response.status)" -ForegroundColor Green
        }
        catch {
            Write-Host "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - Error sending $($file.Name): $($_.Exception.Message)" -ForegroundColor Red
        }
    }

    # Пауза 1 минута перед следующей итерацией
    Write-Host "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - Waiting for next iteration..." -ForegroundColor Cyan
    Start-Sleep -Seconds 60
}