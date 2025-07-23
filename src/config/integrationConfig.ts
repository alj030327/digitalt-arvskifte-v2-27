/**
 * INTEGRATION GUIDE FOR BUYERS/DEVELOPERS
 * =====================================
 * 
 * This file contains all the integration points where real APIs should be connected.
 * Simply replace the mock implementations with your real service calls.
 */

// ===========================================
// STEP 1: SKATTEVERKET API INTEGRATION
// ===========================================
export const SKATTEVERKET_CONFIG = {
  // Replace with your real Skatteverket API credentials
  API_KEY: "YOUR_SKATTEVERKET_API_KEY",
  BASE_URL: "https://api.skatteverket.se/",
  ENDPOINTS: {
    HEIR_LOOKUP: "/bouppteckning/arvingar",
    VALIDATE_PERSONAL_NUMBER: "/validation/personnummer"
  }
};

// ===========================================  
// STEP 2: OPEN BANKING / PSD2 INTEGRATION
// ===========================================
export const OPEN_BANKING_CONFIG = {
  // Replace with your PSD2 provider credentials
  CLIENT_ID: "YOUR_PSD2_CLIENT_ID",
  CLIENT_SECRET: "YOUR_PSD2_CLIENT_SECRET", 
  BASE_URL: "https://api.your-psd2-provider.com/",
  SUPPORTED_BANKS: [
    { code: "SWED", name: "Swedbank", apiEndpoint: "/swedbank" },
    { code: "HAND", name: "Handelsbanken", apiEndpoint: "/handelsbanken" },
    { code: "SEB", name: "SEB", apiEndpoint: "/seb" },
    { code: "NORD", name: "Nordea", apiEndpoint: "/nordea" }
  ]
};

// ===========================================
// STEP 4: E-SIGNATURE INTEGRATION  
// ===========================================
export const E_SIGNATURE_CONFIG = {
  // Replace with your e-signature provider (e.g., Handelsbanken's solution)
  PROVIDER: "handelsbanken", // or "docusign", "adobe_sign"
  API_KEY: "YOUR_ESIGNATURE_API_KEY",
  BASE_URL: "https://esign.handelsbanken.se/api/",
  BANKID_INTEGRATION: true,
  WEBHOOK_URL: "https://your-app.com/webhooks/signature-status"
};

// ===========================================
// EMAIL & SMS PROVIDERS
// ===========================================
export const COMMUNICATION_CONFIG = {
  EMAIL: {
    PROVIDER: "sendgrid", // or "mailgun", "ses"
    API_KEY: "YOUR_EMAIL_API_KEY",
    FROM_EMAIL: "arvsskifte@your-domain.com"
  },
  SMS: {
    PROVIDER: "twilio", // or "nexmo", "telenor"
    API_KEY: "YOUR_SMS_API_KEY", 
    FROM_NUMBER: "+46701234567"
  }
};

// ===========================================
// BANK GROUP MAILBOXES (FINAL SUBMISSION)
// ===========================================
export const BANK_SUBMISSION_CONFIG = {
  SWEDBANK: {
    EMAIL: "arvsskifte.gruppbrevlada@swedbank.se",
    API_ENDPOINT: "https://api.swedbank.se/inheritance",
    AUTH_METHOD: "PSD2_OAUTH"
  },
  HANDELSBANKEN: {
    EMAIL: "dodsbo.avdelning@handelsbanken.se", 
    API_ENDPOINT: "https://api.handelsbanken.se/estate",
    AUTH_METHOD: "PSD2_OAUTH"
  },
  SEB: {
    EMAIL: "arvs.grupp@seb.se",
    API_ENDPOINT: "https://api.seb.se/inheritance",
    AUTH_METHOD: "PSD2_OAUTH"
  },
  NORDEA: {
    EMAIL: "inheritance.department@nordea.se",
    API_ENDPOINT: "https://api.nordea.com/estate", 
    AUTH_METHOD: "PSD2_OAUTH"
  }
};

// ===========================================
// QUICK SETUP CHECKLIST FOR BUYERS:
// ===========================================
/*
□ 1. Replace SKATTEVERKET_CONFIG with your Skatteverket API credentials
□ 2. Update OPEN_BANKING_CONFIG with your PSD2 provider details  
□ 3. Configure E_SIGNATURE_CONFIG with your BankID e-signature service
□ 4. Set up COMMUNICATION_CONFIG for email/SMS providers
□ 5. Verify BANK_SUBMISSION_CONFIG email addresses with each bank
□ 6. Update the mock services in:
    - src/services/skatteverketService.ts
    - src/services/openBankingService.ts  
    - src/services/notificationService.ts
□ 7. Test in staging environment
□ 8. Deploy to production
*/

export default {
  SKATTEVERKET_CONFIG,
  OPEN_BANKING_CONFIG, 
  E_SIGNATURE_CONFIG,
  COMMUNICATION_CONFIG,
  BANK_SUBMISSION_CONFIG
};