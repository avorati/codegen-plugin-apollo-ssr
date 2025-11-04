# check-version.ps1

# Obter a versão atual do package.json
$current_version = node -p "require('./package.json').version"

# Definir arquivo de output (compatível com GitHub Actions ou local)
if ($env:GITHUB_OUTPUT) {
    $outputFile = $env:GITHUB_OUTPUT
} else {
    $outputFile = ".github_output"
}

Add-Content -Path $outputFile -Value "current_version=$current_version"

# Obter a lista de versões publicadas
$yarn_info = yarn info strapi-plugin-preview versions --json 2>$null
if ($yarn_info) {
    $versions = ($yarn_info | ConvertFrom-Json).data
} else {
    $versions = @()
}

if (-not $versions -or $versions.Count -eq 0) {
    Add-Content -Path $outputFile -Value "version_exists=false"
    Write-Host "[INFO] Pacote nunca publicado no NPM, sera publicado agora"
} elseif ($versions -contains $current_version) {
    Add-Content -Path $outputFile -Value "version_exists=true"
    Write-Host "[ATENCAO] Versao $current_version ja existe no NPM"
} else {
    Add-Content -Path $outputFile -Value "version_exists=false"
    Write-Host "[OK] Versao $current_version e nova"
} 