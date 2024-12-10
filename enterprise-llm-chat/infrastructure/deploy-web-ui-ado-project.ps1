param(
    [Parameter(Mandatory=$false)]
    [string]$siteName,
    
    [Parameter(Mandatory=$false)]
    [string]$repoName
)

if (-not $siteName) {
    $siteName = Read-Host -Prompt "Enter the ADO project name"
}

if (-not $repoName) {
    $repoName = Read-Host -Prompt "Enter the GitHub repository name"
}

# Login to Azure DevOps
az login
az devops configure --defaults organization=https://nextech-systems.visualstudio.com project=$siteName

# Create the CI pipeline
Write-Host "Creating CI pipeline..."
az pipelines create --name "$($repoName)-CI" --yaml-path pipeline.yml --repository $repoName --repository-type github --branch dev

# Create the CD pipeline
Write-Host "Creating CD pipeline..."
az pipelines create --name "$($repoName)-CD" --yaml-path release-pipeline.yml --repository $repoName --repository-type github --branch dev `
    --parameters webAppName="$($siteName)-dev" artifactName=$repoName environment=dev