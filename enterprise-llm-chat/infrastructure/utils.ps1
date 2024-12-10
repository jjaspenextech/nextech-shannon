# Gets or creates a resource group with the given name
function Get-OrCreateResourceGroup {
    param(
        [Parameter(Mandatory=$true)]
        [string]$resourceGroupName,
        
        [Parameter(Mandatory=$false)]
        [string]$location = "eastus",
        
        [Parameter(Mandatory=$false)]
        [hashtable]$tags = @{
            "Environment" = "Development"
            "Project" = "AI"
            "CreatedBy" = "Script"
        }
    )

    $rgExists = az group exists --name $resourceGroupName
    if ($rgExists -eq "false") {
        Write-Host "Creating resource group '$resourceGroupName'..."
        $tagString = ($tags.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join ' '
        az group create --location $location --name $resourceGroupName --tags $tagString
    } else {
        Write-Host "Using existing resource group '$resourceGroupName'."
    }

    return $resourceGroupName
}

# Gets or creates an App Service Plan with the given name
function Get-OrCreateAppServicePlan {
    param(
        [Parameter(Mandatory=$true)]
        [string]$planName,
        
        [Parameter(Mandatory=$true)]
        [string]$resourceGroup,

        [Parameter(Mandatory=$false)]
        [string]$sku = "F1"
    )

    Write-Host "Checking App Service Plan '$planName'..."
    $planExists = az webapp plan show --name $planName --resource-group $resourceGroup --query "name" -o tsv 2>$null

    if (-not $planExists) {
        Write-Host "Creating App Service Plan '$planName'..."
        az deployment group create `
            --resource-group $resourceGroup `
            --template-file "$PSScriptRoot/plan-template.json" `
            --parameters planName=$planName sku=$sku
    } else {
        Write-Host "Using existing App Service Plan '$planName'."
    }

    return $planName
} 