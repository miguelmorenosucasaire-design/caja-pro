Add-Type -AssemblyName System.Drawing
$imgPath = "C:\Users\MIGUEL\.gemini\antigravity\brain\4ff10259-488d-456c-9048-85e28e72e05f\.user_uploaded\media_1792714020030_b49ab576.jpg"
$outPath = "c:\Users\MIGUEL\Documents\caja chica\scratch\docentes_rotated.jpg"
$img = [System.Drawing.Image]::FromFile($imgPath)
$img.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipNone)
$img.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
$img.Dispose()
Write-Host "Image rotated successfully to $outPath"
