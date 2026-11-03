Add-Type -AssemblyName System.Drawing

$img = [System.Drawing.Bitmap]::new("C:\Users\Windows\water section\extracted_assets\flyer_upright.jpg")
$outDir = "C:\Users\Windows\water section\extracted_assets"

function Crop-Image($bitmap, $rect, $savePath) {
    $cropBmp = New-Object System.Drawing.Bitmap $rect.Width, $rect.Height
    $g = [System.Drawing.Graphics]::FromImage($cropBmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $destRect = New-Object System.Drawing.Rectangle 0, 0, $rect.Width, $rect.Height
    $g.DrawImage($bitmap, $destRect, $rect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    $cropBmp.Save($savePath, [System.Drawing.Imaging.ImageFormat]::Png)
    $cropBmp.Dispose()
    Write-Host "Saved: $savePath ($($rect.Width)x$($rect.Height))"
}

# 1. Navbar Logo (Full faucet monogram + MICHAFORGE ENTERPRISES + DEALERS IN ALL PLUMBING MATERIALS)
Crop-Image $img (New-Object System.Drawing.Rectangle 46, 26, 334, 73) (Join-Path $outDir "logo_navbar.png")
Crop-Image $img (New-Object System.Drawing.Rectangle 44, 24, 82, 76) (Join-Path $outDir "logo_emblem.png")
Crop-Image $img (New-Object System.Drawing.Rectangle 44, 24, 82, 76) "C:\Users\Windows\water section\apps\web\public\images\logo_emblem.png"
Crop-Image $img (New-Object System.Drawing.Rectangle 44, 24, 82, 76) "C:\Users\Windows\water section\services\media-service\uploads\logo_emblem.png"

# 2. Footer Logo (Full dark-navy background logo)
Crop-Image $img (New-Object System.Drawing.Rectangle 45, 591, 214, 59) (Join-Path $outDir "logo_footer.png")

# 3. Hero plumbing supply pipes photograph (strictly inside hero banner, no white bars)
Crop-Image $img (New-Object System.Drawing.Rectangle 465, 104, 559, 208) (Join-Path $outDir "hero_plumbing_supplies.png")

# 4. Product 1: PVC Pipes (4")
Crop-Image $img (New-Object System.Drawing.Rectangle 35, 430, 156, 134) (Join-Path $outDir "pvc_pipes_card.png")
Crop-Image $img (New-Object System.Drawing.Rectangle 40, 435, 146, 65) (Join-Path $outDir "product_pvc_pipes.png")

# 5. Product 2: Pipe Fittings (Assorted)
Crop-Image $img (New-Object System.Drawing.Rectangle 195, 430, 156, 134) (Join-Path $outDir "pipe_fittings_card.png")
Crop-Image $img (New-Object System.Drawing.Rectangle 200, 435, 146, 65) (Join-Path $outDir "product_pipe_fittings.png")

# 6. Product 3: Bib Cock Tap
Crop-Image $img (New-Object System.Drawing.Rectangle 355, 430, 156, 134) (Join-Path $outDir "bib_cock_card.png")
Crop-Image $img (New-Object System.Drawing.Rectangle 360, 435, 146, 65) (Join-Path $outDir "product_bib_cock.png")

# 7. Product 4: Brass Ball Valve
Crop-Image $img (New-Object System.Drawing.Rectangle 515, 430, 156, 134) (Join-Path $outDir "brass_valve_card.png")
Crop-Image $img (New-Object System.Drawing.Rectangle 520, 435, 146, 65) (Join-Path $outDir "product_brass_valve.png")

# 8. Product 5: Water Tank (1,000L)
Crop-Image $img (New-Object System.Drawing.Rectangle 675, 430, 156, 134) (Join-Path $outDir "water_tank_card.png")
Crop-Image $img (New-Object System.Drawing.Rectangle 680, 435, 146, 65) (Join-Path $outDir "product_water_tank.png")

# 9. Product 6: Hardware Accessories
Crop-Image $img (New-Object System.Drawing.Rectangle 835, 430, 156, 134) (Join-Path $outDir "hardware_card.png")
Crop-Image $img (New-Object System.Drawing.Rectangle 840, 435, 146, 65) (Join-Path $outDir "product_hardware_accessories.png")

$img.Dispose()
Write-Host "All assets successfully extracted!"
