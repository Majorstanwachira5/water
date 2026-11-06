Add-Type -AssemblyName System.Drawing
$ProgressPreference = 'SilentlyContinue'

$scratchDir = "C:\Users\Windows\.gemini\antigravity\brain\8352e21b-2d93-45ae-8294-6342d2dc8f07\scratch\unzipped_images"
$webProdDir = "c:\Users\Windows\water section\apps\web\public\images\products"
$mediaUploadDir = "c:\Users\Windows\water section\services\media-service\uploads"

if (-not (Test-Path $webProdDir)) {
    New-Item -ItemType Directory -Path $webProdDir -Force | Out-Null
}
if (-not (Test-Path $mediaUploadDir)) {
    New-Item -ItemType Directory -Path $mediaUploadDir -Force | Out-Null
}

function Process-ProductImage {
    param (
        [string]$SrcFileName,
        [string]$DestFileName
    )

    $srcPath = Join-Path $scratchDir $SrcFileName
    if (-not (Test-Path $srcPath)) {
        Write-Warning "Source not found: $srcPath"
        return
    }

    $destPath1 = Join-Path $webProdDir $DestFileName
    $destPath2 = Join-Path $mediaUploadDir $DestFileName

    $src = [System.Drawing.Image]::FromFile($srcPath)
    $canvasSize = 800
    $padding = 24
    $availSize = $canvasSize - ($padding * 2)

    $scale = [Math]::Min($availSize / $src.Width, $availSize / $src.Height)
    $drawW = [int]($src.Width * $scale)
    $drawH = [int]($src.Height * $scale)
    $destX = [int](($canvasSize - $drawW) / 2)
    $destY = [int](($canvasSize - $drawH) / 2)

    $bmp = New-Object System.Drawing.Bitmap($canvasSize, $canvasSize)
    $bmp.SetResolution(96, 96)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#F8FAFB'))
    $g.FillRectangle($bgBrush, 0, 0, $canvasSize, $canvasSize)
    $bgBrush.Dispose()

    $destRect = New-Object System.Drawing.Rectangle($destX, $destY, $drawW, $drawH)
    $g.DrawImage($src, $destRect, 0, 0, $src.Width, $src.Height, [System.Drawing.GraphicsUnit]::Pixel)

    $g.Dispose()
    $src.Dispose()

    $bmp.Save($destPath1, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Save($destPath2, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()

    Write-Host "Processed -> $DestFileName"
}

$imageMap = @(
    @{ Src = "WhatsApp Image 2026-11-03 at 12.19.15.jpeg"; Dest = "product_kensplastic_magic_bend.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 12.20.59.jpeg"; Dest = "product_flexible_bottle_trap_waste.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 12.21.00.jpeg"; Dest = "product_flexible_bottle_trap_waste_box.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 12.22.02.jpeg"; Dest = "product_kensplastic_kp12_flush_kit.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 12.22.30.jpeg"; Dest = "product_kensplastic_toilet_seat_cover.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 12.22.50.jpeg"; Dest = "product_shoshona_cistern_tank.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 12.23.09.jpeg"; Dest = "product_kensplastic_kp11_cistern.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 12.25.48.jpeg"; Dest = "product_braided_flexible_hoses_pair.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 12.33.34.jpeg"; Dest = "product_metallic_curtain_rods.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 12.34.25.jpeg"; Dest = "product_chrome_wall_gooseneck_tap.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 12.34.53.jpeg"; Dest = "product_flexible_silicone_kitchen_mixer.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 12.35.25.jpeg"; Dest = "product_sus304_wall_kitchen_tap.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 12.36.06.jpeg"; Dest = "product_sus304_deck_kitchen_mixer.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 12.37.15.jpeg"; Dest = "product_commercial_brushed_kitchen_mixer.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 12.38.36.jpeg"; Dest = "product_brimix_bridge_kitchen_mixer.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 12.39.28.jpeg"; Dest = "product_lirlee_wall_mount_kitchen_mixer.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 12.40.12.jpeg"; Dest = "product_acquaflex_bravo_kitchen_mixer.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 12.41.02.jpeg"; Dest = "product_black_spring_pre_rinse_mixer.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 12.45.11.jpeg"; Dest = "product_black_spring_pullout_faucet.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 12.50.27.jpeg"; Dest = "product_water_droplet_chrome_spring_mixer.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 12.51.07.jpeg"; Dest = "product_chrome_commercial_spring_tap.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 12.51.29.jpeg"; Dest = "product_lirlee_black_taps_collection.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 13.51.41.jpeg"; Dest = "product_milano_instant_heater_shower.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 13.51.59.jpeg"; Dest = "product_milano_shower_box.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 13.52.17.jpeg"; Dest = "product_milano_heater_unit.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 13.52.33.jpeg"; Dest = "product_milano_shower_rail.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 13.54.01.jpeg"; Dest = "product_concealed_thermostatic_shower_set.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 13.55.09.jpeg"; Dest = "product_concealed_shower_valve_box.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 13.56.12.jpeg"; Dest = "product_granite_quartz_single_sink_black.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 13.57.04.jpeg"; Dest = "product_brimix_concealed_shower_mixer.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 13.57.46.jpeg"; Dest = "product_brimix_8807_exposed_shower_column.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.03.52.jpeg"; Dest = "product_round_ultra_slim_rain_shower.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.04.07.jpeg"; Dest = "product_lirlee_lr35202_black_rain_shower.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.04.25.jpeg"; Dest = "product_black_square_shower_with_arm.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.04.48.jpeg"; Dest = "product_dual_flow_square_shower_head.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.05.08.jpeg"; Dest = "product_stainless_soap_dish_holder.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.05.39.jpeg"; Dest = "product_6pc_matte_black_bathroom_set.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.06.06.jpeg"; Dest = "product_6pc_brushed_stainless_bathroom_set.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.06.28.jpeg"; Dest = "product_6pc_antique_brass_bathroom_set.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.09.13.jpeg"; Dest = "product_black_gold_bathroom_hardware_set.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.09.58.jpeg"; Dest = "product_oxford_brass_butt_hinges.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.10.23.jpeg"; Dest = "product_gunmetal_pullout_kitchen_mixer.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.11.55.jpeg"; Dest = "product_vado_concealed_shower_mixer.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.14.18.jpeg"; Dest = "product_abtpure_2stage_water_purifier.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.14.46.jpeg"; Dest = "product_sopure_10inch_water_filter.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.15.57.jpeg"; Dest = "product_foldable_toilet_safety_grab_bar.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.17.44.jpeg"; Dest = "product_antique_brass_geometric_mortise_lock.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.18.03.jpeg"; Dest = "product_classic_antique_curved_mortise_lock.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.20.04.jpeg"; Dest = "product_wista_greek_key_mortise_lock.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.20.22.jpeg"; Dest = "product_wista_victorian_ornate_door_lock.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.20.40.jpeg"; Dest = "product_4deadbolt_security_lockcase.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.21.05.jpeg"; Dest = "product_stainless_tubular_lever_door_lock.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.21.49.jpeg"; Dest = "product_black_nano_double_bowl_sink_faucet.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.22.31.jpeg"; Dest = "product_current_italy_single_sink.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.22.51.jpeg"; Dest = "product_modern_bathroom_vanity_unit.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.23.23.jpeg"; Dest = "product_modern_bathroom_vanity_unit_angle.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.24.47.jpeg"; Dest = "product_black_foldable_towel_shelf.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.36.35.jpeg"; Dest = "product_black_foldable_towel_shelf_detail.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.36.52.jpeg"; Dest = "product_stainless_multitier_towel_shelf.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.37.28.jpeg"; Dest = "product_ppr_pipe_welding_machine_kit.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.38.52.jpeg"; Dest = "product_anlabeier_instant_shower_heater.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.39.13.jpeg"; Dest = "product_stainless_double_bowl_radial_drainboard.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.39.28.jpeg"; Dest = "product_stainless_equal_double_bowl_sink.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.39.45.jpeg"; Dest = "product_stainless_double_bowl_fluted_drainboard.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.40.02.jpeg"; Dest = "product_ks7843_handmade_double_sink.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.40.18.jpeg"; Dest = "product_sus304_handcrafted_undermount_sink.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.40.41.jpeg"; Dest = "product_black_nano_double_sink_drainer_kit.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.41.02.jpeg"; Dest = "product_black_square_shattaf_boxed.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.41.16.jpeg"; Dest = "product_chrome_ribbed_shattaf_boxed.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.41.33.jpeg"; Dest = "product_polished_gold_square_shattaf_set.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.41.53.jpeg"; Dest = "product_sus304_brushed_shattaf_set.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.42.44.jpeg"; Dest = "product_lirlee_flexible_shower_hose.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.43.03.jpeg"; Dest = "product_lirlee_black_shattaf.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.43.22.jpeg"; Dest = "product_lirlee_chrome_shattaf.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.43.50.jpeg"; Dest = "product_lirlee_basin_tap.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.44.48.jpeg"; Dest = "product_orient_urinal.png" },
    @{ Src = "WhatsApp Image 2026-11-03 at 14.45.08.jpeg"; Dest = "product_synnova_urinal.png" }
)

Write-Host "Total images to process: $($imageMap.Count)"
foreach ($item in $imageMap) {
    Process-ProductImage -SrcFileName $item.Src -DestFileName $item.Dest
}
Write-Host "All product images processed successfully!"
