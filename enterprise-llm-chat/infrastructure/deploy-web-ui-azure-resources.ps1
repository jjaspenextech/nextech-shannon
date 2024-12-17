param(
    [Parameter(Mandatory=$false)]
    [string]$siteName,
    
    [Parameter(Mandatory=$false)]
    [string]$resourceGroup,

    [Parameter(Mandatory=$false)]
    [string]$sku = "F1",

    [Parameter(Mandatory=$false)]
    [string]$location = "eastus2"
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
$resourceGroup = Get-OrCreateResourceGroup -resourceGroupName $resourceGroup -location $location
if (-not $resourceGroup) {
    Write-Host "Failed to create the resource group. Exiting..."
    exit 1
}

$planName = if ($env:CUSTOM_PLAN_NAME) { $env:CUSTOM_PLAN_NAME } else { "$($siteName)-plan" }
Write-Host "Plan name: $planName"
$planName = Get-OrCreateAppServicePlan -planName $planName -resourceGroup $resourceGroup -sku $sku
if (-not $planName) {
    Write-Host "Failed to create the App Service Plan. Exiting..."
    exit 1
}

# Fetch and print the resource ID of the App Service Plan
$planResourceId = az resource show --resource-group $resourceGroup --name $planName --resource-type "Microsoft.Web/serverfarms" --query "id" -o tsv
if (-not $planResourceId) {
    Write-Host "Failed to fetch the resource ID of the App Service Plan. Exiting..."
    exit 1
}
Write-Host "App Service Plan Resource ID: $planResourceId"

# the physical path needs the name of the app, which should be two folders up from the current folder
$appName = (Get-Item -Path "$PSScriptRoot/..").Name
$physicalPath = "site\wwwroot\$appName\browser"
Write-Host "Physical path: $physicalPath"

# Simulate the deployment to see the template with parameters
# Write-Host "Simulating deployment to see the template with parameters..."
# az deployment group what-if `
#     --resource-group $resourceGroup `
#     --template-file "$PSScriptRoot/web-ui-template.json" `
#     --parameters siteName=$siteName planName=$planName sku=$sku location=$location physicalPath=$physicalPath

# Deploy the App Service
Write-Host "Deploying App Service '$siteName'..."
az deployment group create `
    --resource-group $resourceGroup `
    --template-file "$PSScriptRoot/web-ui-template.json" `
    --parameters siteName=$siteName planName=$planName sku=$sku location=$location physicalPath=$physicalPath