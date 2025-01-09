# Enterprise LLM Chat Web UI

Angular frontend for the Enterprise LLM Chat application.

## Prerequisites

- Node.js 20+
- Angular CLI 18+
- Azure CLI installed and configured
- Azure subscription
- Azure DevOps account with appropriate permissions

## Deployment Instructions

### 1. Deploy Azure Resources

The `infrastructure` folder contains scripts and templates for deploying to Azure:

```powershell
# Navigate to the infrastructure folder
cd frontend/enterprise-llm-chat/infrastructure

# Deploy Azure Web App resources (interactive mode)
.\deploy-web-ui-azure-resources.ps1

# Or specify parameters directly
.\deploy-web-ui-azure-resources.ps1 -siteName "your-web-ui-name"
```

### 2. Set Up Azure DevOps Project and Pipelines

```powershell
# Create ADO project and set up pipelines
.\deploy-web-ui-ado-project.ps1 -siteName "your-ado-project" -repoName "your-repo-name"
```

The script will:
1. Create a new ADO project
2. Set up CI pipeline using `web-ui-build-pipeline.yml`
3. Set up CD pipeline using `web-ui-release-pipeline.yml`

### 3. Pipeline Configuration

#### Build Pipeline Variables
- `branchFilter`: Branch to trigger builds (default: 'refs/heads/dev')
- `artifactName`: Name for your build artifact
- `workingDirectory`: Path to your Angular project

#### Release Pipeline Variables
- `apiUrl`: URL of your backend API
- `webAppName`: Name of your Azure Web App
- `artifactName`: Name of the build artifact to deploy
- `environment`: Deployment environment (dev/staging/prod)

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
ng serve
```
The application will be available at `http://localhost:4200`

## Building for Production

```bash
ng build --configuration=production
```
Build artifacts will be stored in the `dist/` directory.

## Running Tests

```bash
# Unit tests
ng test

# End-to-end tests
ng e2e
```

## Publish to Azure App Service from local

```bash
cd frontend/enterprise-llm-chat

ng build --configuration=production

# Compress the dist folder contents
Compress-Archive -Path ./dist/* -DestinationPath deploy.zip -Force
# Deploy the zipped file
az webapp deploy --resource-group nextech-shannon-dev-rg --name nextech-shannon-dev --src-path deploy.zip --type zip
```

## Further Help

For more help on the Angular CLI use `ng help` or check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
