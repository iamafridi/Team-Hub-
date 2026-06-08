$logFile = "D:\Projects\Freducloud\frontend-output.log"
$workDir = "D:\Projects\Freducloud\frontend"
$process = Start-Process -NoNewWindow -FilePath "npx" -ArgumentList "next dev -p 3000" -WorkingDirectory $workDir -RedirectStandardOutput $logFile -RedirectStandardError $logFile -PassThru
Write-Host $process.Id
