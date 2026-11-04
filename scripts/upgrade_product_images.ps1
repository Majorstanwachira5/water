Add-Type -AssemblyName System.Drawing

function Save-HighResCrop {
    param (
        [string]$SourcePath,
        [int]$X,
        [int]$Y,
        [int]$Width,
        [int]$Height,
        [int]$OutWidth,
        [int]$OutHeight,
        [string[]]$DestPaths
    )
    $src = [System.Drawing.Image]::FromFile($SourcePath)
    $bmp = New-Object System.Drawing.Bitmap($OutWidth, $OutHeight)
    $bmp.SetResolution(96, 96)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $destRect = New-Object System.Drawing.Rectangle(0, 0, $OutWidth, $OutHeight)
    $srcRect = New-Object System.Drawing.Rectangle($X, $Y, $Width, $Height)
    $g.DrawImage($src, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    $src.Dispose()

    foreach ($dest in $DestPaths) {
        $dir = Split-Path -Parent $dest
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
        $bmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
        Write-Host "Saved $dest (${OutWidth}x${OutHeight})"
    }
    $bmp.Dispose()
}

$brainDir = "C:\Users\Windows\.gemini\antigravity\brain\b5e1ac2d-8a47-4273-a1e7-124f97f20cda"
$webImgDir = "c:\Users\Windows\water section\apps\web\public\images"
$webProdDir = "c:\Users\Windows\water section\apps\web\public\images\products"
$mediaUploadDir = "c:\Users\Windows\water section\services\media-service\uploads"

# 1. PVC Pipes (from 1024x1024 generated studio photo, cropped to 4:3 800x600 edge-to-edge)
Save-HighResCrop `
    -SourcePath "$brainDir\product_pvc_pipes_png_1793769829703.jpg" `
    -X 0 -Y 128 -Width 1024 -Height 768 `
    -OutWidth 800 -OutHeight 600 `
    -DestPaths @(
        "$webProdDir\product_pvc_pipes.png",
        "$webImgDir\product_pvc_pipes.png",
        "$mediaUploadDir\product_pvc_pipes.png"
    )

# 2. Pipe Fittings (from 1024x1024 generated studio photo, cropped to 4:3 800x600 edge-to-edge)
Save-HighResCrop `
    -SourcePath "$brainDir\product_pipe_fittings_png_1793769876330.jpg" `
    -X 16 -Y 128 -Width 992 -Height 744 `
    -OutWidth 800 -OutHeight 600 `
    -DestPaths @(
        "$webProdDir\product_pipe_fittings.png",
        "$webImgDir\product_pipe_fittings.png",
        "$mediaUploadDir\product_pipe_fittings.png"
    )

# 3. Chrome Bib Cock / Taps (from 1408x768 HD studio hero image - gleaming chrome wall bib cock & mixer)
Save-HighResCrop `
    -SourcePath "$brainDir\modern_hardware_hero_png_1793687546135.jpg" `
    -X 365 -Y 70 -Width 470 -Height 530 `
    -OutWidth 800 -OutHeight 600 `
    -DestPaths @(
        "$webProdDir\product_bib_cock.png",
        "$webImgDir\product_bib_cock.png",
        "$mediaUploadDir\product_bib_cock.png"
    )

# 4. Brass Gate & Ball Valves (from 1408x768 HD studio hero image - heavy duty brass ball valves with red handles & gauge)
Save-HighResCrop `
    -SourcePath "$brainDir\modern_hardware_hero_png_1793687546135.jpg" `
    -X 830 -Y 290 -Width 530 -Height 330 `
    -OutWidth 800 -OutHeight 600 `
    -DestPaths @(
        "$webProdDir\product_brass_valve.png",
        "$webImgDir\product_brass_valve.png",
        "$mediaUploadDir\product_brass_valve.png"
    )

# 5. Water Storage Tank (from 1408x768 HD showroom image - blue water tank & triple filtration unit)
Save-HighResCrop `
    -SourcePath "$brainDir\modern_hardware_showcase_png_1793687571743.jpg" `
    -X 830 -Y 340 -Width 360 -Height 370 `
    -OutWidth 800 -OutHeight 600 `
    -DestPaths @(
        "$webProdDir\product_water_tank.png",
        "$webImgDir\product_water_tank.png",
        "$mediaUploadDir\product_water_tank.png"
    )

# 6. Hardware & Plumbing Tools (from 1408x768 HD about showroom image - heavy-duty pipe wrenches & cutters)
Save-HighResCrop `
    -SourcePath "$brainDir\modern_hardware_about_png_1793687715403.jpg" `
    -X 795 -Y 440 -Width 295 -Height 175 `
    -OutWidth 800 -OutHeight 600 `
    -DestPaths @(
        "$webProdDir\product_hardware_accessories.png",
        "$webImgDir\product_hardware_accessories.png",
        "$mediaUploadDir\product_hardware_accessories.png"
    )
