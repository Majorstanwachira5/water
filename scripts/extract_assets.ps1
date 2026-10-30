Add-Type -AssemblyName System.Drawing

$origPath = 'C:\Users\Windows\.gemini\antigravity-ide\brain\c733bd0f-7fe9-48b6-a0ff-7eaa5fbff154\.user_uploaded\media_1793291626285.jpg'
$outDir = 'C:\Users\Windows\water section\extracted_assets'
if (!(Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }

$bmp = [System.Drawing.Bitmap]::new($origPath)
Write-Host "Original Size: $($bmp.Width) x $($bmp.Height)"

# Rotate 90 degrees clockwise
$bmp.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone)
Write-Host "Rotated Size: $($bmp.Width) x $($bmp.Height)"
$savePath = Join-Path $outDir "flyer_upright.jpg"
$bmp.Save($savePath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
Write-Host "Saved upright flyer to $savePath"
$bmp.Dispose()
