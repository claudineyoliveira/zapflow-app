$file = 'C:\Users\claud\projetos\Antigravity\whatsapp-dispatcher\frontend\src\app\page.tsx'
$lines = Get-Content $file
# Manter apenas até a linha 840 (índice 839)
$trimmed = $lines[0..839]
Set-Content $file $trimmed
Write-Host "Done. Total lines: $($trimmed.Count)"
