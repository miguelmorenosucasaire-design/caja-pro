$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop)
$TargetDir = Split-Path -Parent $PSScriptRoot
$ShortcutPath = Join-Path $DesktopPath "CETPRO San Miguel - Caja Chica.lnk"
$ExePath = Join-Path $TargetDir "CETPRO_SanMiguel_Caja.exe"
$IcoPath = Join-Path $TargetDir "app.ico"

$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $ExePath
$Shortcut.WorkingDirectory = $TargetDir
$Shortcut.IconLocation = $IcoPath
$Shortcut.Description = "Sistema de Gestión Financiera y Caja Chica - CETPRO Micaela Bastidas"
$Shortcut.Save()

Write-Host "Acceso directo creado en: $ShortcutPath"
