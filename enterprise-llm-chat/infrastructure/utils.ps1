# Gets or creates a resource group with the given name
function Get-OrCreateResourceGroup {
    param (
        [Parameter(Mandatory=$true)]
        [string]$resourceGroupName
    )

    Write-Host "Checking resource group '$resourceGroupName'..."
    $rg = az group show --name $resourceGroupName 2>$null
    if (-not $rg) {
        Write-Host "Creating resource group '$resourceGroupName'..."
        az group create --name $resourceGroupName --location "eastus"
    } else {
        Write-Host "Using existing resource group '$resourceGroupName'."
    }
    return $resourceGroupName
}

# Gets or creates an App Service Plan with the given name
function Get-OrCreateAppServicePlan {
    param (
        [Parameter(Mandatory=$true)]
        [string]$planName,
        
        [Parameter(Mandatory=$true)]
        [string]$resourceGroup,
        
        [Parameter(Mandatory=$true)]
        [string]$sku,

        [Parameter(Mandatory=$false)]
        [string]$location="eastus"
    )

    Write-Host "Checking App Service Plan '$planName'..."
    $plan = az appservice plan show --name $planName --resource-group $resourceGroup 2>$null
    if (-not $plan) {
        Write-Host "Creating App Service Plan '$planName'..."
        az deployment group create `
            --resource-group $resourceGroup `
            --template-file "$PSScriptRoot/plan-template.json" `
            --parameters planName=$planName sku=$sku location=$location
    } else {
        Write-Host "Using existing App Service Plan '$planName'."
    }
    return $planName
} 