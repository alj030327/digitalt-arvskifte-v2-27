# Digital Arvsskifte - Inheritance Settlement System

En digital lösning för att hantera arvsskiften med integration till Skatteverkets API och BankID för säker autentisering och signering.

## Funktioner

- **Digital identifiering** av avliden person via Skatteverkets API
- **Automatisk hämtning** av arvingar från bouppteckning
- **BankID-autentisering** för säker åtkomst
- **Digital signering** av arvsdokument
- **Bankintegration** för hantering av tillgångar
- **Testamenthantering** med verifiering

## Teknisk Setup

### Förutsättningar för produktion

För att använda systemet i produktion behöver följande integrationer konfigureras:

#### 1. Skatteverkets API
```typescript
// src/config/integrations.ts
export const integrationConfig = {
  skatteverket: {
    enabled: true,
    apiBaseUrl: 'https://api.skatteverket.se/prod',
    apiKey: 'DIN_SKATTEVERKET_API_NYCKEL',
    certificatePath: '/path/to/certificate.p12',
  }
}
```

#### 2. BankID Integration
```typescript
// src/config/integrations.ts
export const integrationConfig = {
  bankid: {
    enabled: true,
    environment: 'production',
    apiBaseUrl: 'https://appapi2.bankid.com/rp/v6.0',
    certificatePath: '/path/to/bankid-certificate.p12',
    certificatePassword: 'CERTIFICATE_PASSWORD',
  }
}
```

## Development Setup

```bash
npm install
npm run dev
```

För att aktivera riktiga API:er:
1. Uppdatera `src/config/integrations.ts`
2. Implementera backend endpoints (rekommenderat via Supabase)
3. Sätt `enabled: true` för respektive service

## Säkerhet

- **Certifikat**: Lagras säkert i backend, aldrig i frontend
- **API-nycklar**: Hanteras via environment variables eller Supabase secrets
- **BankID**: Följer svenska myndighetskrav för digital identifiering