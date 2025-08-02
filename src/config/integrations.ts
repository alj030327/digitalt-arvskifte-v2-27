// Configuration for external integrations
export const integrationConfig = {
  skatteverket: {
    enabled: false, // Set to true when API credentials are available
    apiBaseUrl: 'https://api.skatteverket.se/test', // Change to production URL
    apiKey: '', // Add your Skatteverket API key here
    certificatePath: '', // Path to your certificate file
  },
  bankid: {
    enabled: true, // Now using real test certificates
    environment: 'test', // 'test' or 'production'
    apiBaseUrl: 'https://appapi2.test.bankid.com/rp/v6.0', // Test URL
    // Production URL: 'https://appapi2.bankid.com/rp/v6.0'
    certificatePath: '', // Path to your BankID certificate
    certificatePassword: '', // Certificate password
  },
  supabase: {
    enabled: false, // Set to true when Supabase is connected
    url: '', // Your Supabase URL
    anonKey: '', // Your Supabase anon key
  }
};

// Helper to check if integrations are properly configured
export const isIntegrationReady = {
  skatteverket: () => integrationConfig.skatteverket.enabled && integrationConfig.skatteverket.apiKey,
  bankid: () => integrationConfig.bankid.enabled && integrationConfig.bankid.certificatePath,
  supabase: () => integrationConfig.supabase.enabled && integrationConfig.supabase.url,
};