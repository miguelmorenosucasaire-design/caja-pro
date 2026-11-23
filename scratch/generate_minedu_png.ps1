Add-Type -AssemblyName System.Drawing

function Generate-Minedu-Png {
    param(
        [string]$outputPath,
        [bool]$isColor,
        [int]$scale = 4
    )
    
    $w = 225 * $scale
    $h = 145 * $scale
    
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $g.Clear([System.Drawing.Color]::Transparent)
    
    if ($isColor) {
        $c1 = [System.Drawing.ColorTranslator]::FromHtml('#9aa9c6')
        $c2 = [System.Drawing.ColorTranslator]::FromHtml('#a8b2c8')
        $c3 = [System.Drawing.ColorTranslator]::FromHtml('#c0c8d9')
        $cH = [System.Drawing.ColorTranslator]::FromHtml('#2258a8')
        $cText = [System.Drawing.ColorTranslator]::FromHtml('#1f2a55')
    } else {
        $c1 = [System.Drawing.ColorTranslator]::FromHtml('#93c5fd')
        $c2 = [System.Drawing.ColorTranslator]::FromHtml('#60a5fa')
        $c3 = [System.Drawing.ColorTranslator]::FromHtml('#3b82f6')
        $cH = [System.Drawing.ColorTranslator]::FromHtml('#1e40af')
        $cText = [System.Drawing.ColorTranslator]::FromHtml('#1e40af')
    }
    
    $b1 = New-Object System.Drawing.SolidBrush($c1)
    $b2 = New-Object System.Drawing.SolidBrush($c2)
    $b3 = New-Object System.Drawing.SolidBrush($c3)
    $bH = New-Object System.Drawing.SolidBrush($cH)
    $bText = New-Object System.Drawing.SolidBrush($cText)
    
    # Vertical bars
    $g.FillRectangle($b1, 7 * $scale, 63 * $scale, 18 * $scale, 47 * $scale)
    $g.FillRectangle($b2, 32 * $scale, 36 * $scale, 18 * $scale, 74 * $scale)
    $g.FillRectangle($b3, 57 * $scale, 10 * $scale, 18 * $scale, 100 * $scale)
    
    # Horizontal bars
    $g.FillRectangle($bH, 83 * $scale, 10 * $scale, 55 * $scale, 30 * $scale)
    $g.FillRectangle($bH, 83 * $scale, 48 * $scale, 91 * $scale, 30 * $scale)
    $g.FillRectangle($bH, 83 * $scale, 85 * $scale, 127 * $scale, 25 * $scale)
    
    # Text
    $fontTitle = New-Object System.Drawing.Font('Times New Roman', (11.5 * $scale), [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $fontSub = New-Object System.Drawing.Font('Times New Roman', (7.5 * $scale), [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    
    $rectTitle = New-Object System.Drawing.RectangleF(0, (116 * $scale), $w, (16 * $scale))
    $rectSub = New-Object System.Drawing.RectangleF(0, (132 * $scale), $w, (12 * $scale))
    
    $g.DrawString('Ministerio de Educación', $fontTitle, $bText, $rectTitle, $sf)
    $g.DrawString('REPÚBLICA DEL PERÚ', $fontSub, $bText, $rectSub, $sf)
    
    $g.Dispose()
    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}

Generate-Minedu-Png -outputPath 'public/img/minedu_oficial_hd.png' -isColor $true
Generate-Minedu-Png -outputPath 'public/img/minedu_copia_hd.png' -isColor $false
Write-Output 'PNGs generated successfully!'
