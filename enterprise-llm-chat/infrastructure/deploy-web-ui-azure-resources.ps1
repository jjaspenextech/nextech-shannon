param(
    [Parameter(Mandatory=$false)]
    [string]$siteName,
    
    [Parameter(Mandatory=$false)]
    [string]$resourceGroup,

    [Parameter(Mandatory=$false)]
    [string]$sku = "F1",

    [Parameter(Mandatory=$false)]
    [string]$location = "East US"
)

# Import utility functions
. "$PSScriptRoot/utils.ps1"

if (-not $resourceGroup) {
    $resourceGroup = Read-Host -Prompt "Enter the resource group"
}

if (-not $siteName) {
    $siteName = Read-Host -Prompt "Enter the site name"
}

# Get or create resource group and plan
$resourceGroup = Get-OrCreateResourceGroup -resourceGroupName $resourceGroup
$planName = if ($env:CUSTOM_PLAN_NAME) { $env:CUSTOM_PLAN_NAME } else { "$($siteName)-plan" }
$planName = Get-OrCreateAppServicePlan -planName $planName -resourceGroup $resourceGroup -sku $sku

# Fetch and print the resource ID of the App Service Plan
$planResourceId = az resource show --resource-group $resourceGroup --name $planName --resource-type "Microsoft.Web/serverfarms" --query "id" -o tsv

Write-Host "App Service Plan Resource ID: $planResourceId"

# Simulate the deployment to see the template with parameters
Write-Host "Simulating deployment to see the template with parameters..."
az deployment group what-if `
    --resource-group $resourceGroup `
    --template-file "$PSScriptRoot/web-ui-template.json" `
    --parameters siteName=$siteName planName=$planName sku=$sku location=$location

# Deploy the App Service
Write-Host "Deploying App Service '$siteName'..."
az deployment group create `
    --resource-group $resourceGroup `
    --template-file "$PSScriptRoot/web-ui-template.json" `
    --parameters siteName=$siteName planName=$planName sku=$sku location=$location