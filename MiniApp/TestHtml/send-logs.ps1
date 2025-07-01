# Configuration
$machineId = "e112415"
$folderPath = "C:\Users\Zero\Desktop\Log"
$serverUrl = "http://localhost:3000/upload"
$textExtensions = @(".log", ".txt", ".dnt")  # Расширения текстовых файлов

# Check folder exists
if (-not (Test-Path -Path $folderPath)) {
    Write-Host "Error: Folder $folderPath not found!" -ForegroundColor Red
    exit
}

# Get all files
$files = Get-ChildItem -Path $folderPath -File

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
            machineId = $machineId
            filename = $file.Name
            content = $fileContent
            isBinary = $isBinary
        } | ConvertTo-Json -Depth 5

        # Send request
        $response = Invoke-RestMethod -Uri $serverUrl -Method Post -Body $body -ContentType "application/json"
        
        Write-Host "Successfully sent $($file.Name). Server response: $($response.status)" -ForegroundColor Green
    }
    catch {
        Write-Host "Error sending $($file.Name): $($_.Exception.Message)" -ForegroundColor Red
    }
}