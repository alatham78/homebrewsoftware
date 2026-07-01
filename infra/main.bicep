// BrewHaus infrastructure — deliberately the cheapest serverless footprint on Azure:
//   * Static Web App (Free tier): hosts the SPA + the Functions API as managed
//     functions. $0/month, includes SSL, global edge, and a CI/CD token.
//   * Cosmos DB: 'free' mode uses the account-level free tier (1000 RU/s +
//     25 GB forever free, one per subscription); 'serverless' mode is
//     pay-per-request for subscriptions where the free tier is already taken.
//
// Deploy:
//   az group create -n brewhaus-rg -l eastus2
//   az deployment group create -g brewhaus-rg -f infra/main.bicep

@description('Base name for all resources')
param name string = 'brewhaus'

@description('Region for the Static Web App (limited region set)')
@allowed(['westus2', 'centralus', 'eastus2', 'westeurope', 'eastasia'])
param swaLocation string = 'eastus2'

@description('Region for Cosmos DB')
param cosmosLocation string = resourceGroup().location

@description('free = account free tier (1000 RU/s provisioned, $0). serverless = pay-per-request.')
@allowed(['free', 'serverless'])
param cosmosMode string = 'free'

var suffix = uniqueString(resourceGroup().id)

resource cosmos 'Microsoft.DocumentDB/databaseAccounts@2024-05-15' = {
  name: '${name}-${suffix}'
  location: cosmosLocation
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    enableFreeTier: cosmosMode == 'free'
    capabilities: cosmosMode == 'serverless' ? [{ name: 'EnableServerless' }] : []
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
    }
    locations: [
      {
        locationName: cosmosLocation
        failoverPriority: 0
        isZoneRedundant: false
      }
    ]
  }
}

resource database 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2024-05-15' = {
  parent: cosmos
  name: 'brewhaus'
  properties: {
    resource: { id: 'brewhaus' }
    // Shared 400 RU/s on the database stays inside the 1000 RU/s free allowance.
    options: cosmosMode == 'free' ? { throughput: 400 } : {}
  }
}

resource container 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2024-05-15' = {
  parent: database
  name: 'recipes'
  properties: {
    resource: {
      id: 'recipes'
      partitionKey: {
        paths: ['/id']
        kind: 'Hash'
      }
    }
    options: {}
  }
}

resource swa 'Microsoft.Web/staticSites@2023-12-01' = {
  name: '${name}-web'
  location: swaLocation
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    allowConfigFileUpdates: true
    stagingEnvironmentPolicy: 'Enabled'
    enterpriseGradeCdnStatus: 'Disabled'
  }
}

resource swaSettings 'Microsoft.Web/staticSites/config@2023-12-01' = {
  parent: swa
  name: 'appsettings'
  properties: {
    COSMOS_CONNECTION_STRING: 'AccountEndpoint=${cosmos.properties.documentEndpoint};AccountKey=${cosmos.listKeys().primaryMasterKey};'
  }
}

output siteUrl string = 'https://${swa.properties.defaultHostname}'
output cosmosAccount string = cosmos.name
output deploymentTokenHint string = 'Run: az staticwebapp secrets list -n ${swa.name} --query properties.apiKey -o tsv'
