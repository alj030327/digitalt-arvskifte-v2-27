import { useState } from 'react';

type Language = 'sv' | 'en';

interface Translations {
  sv: Record<string, string>;
  en: Record<string, string>;
}

const translations: Translations = {
  sv: {
    // Step labels
    'step.identification': 'Identifiering',
    'step.assets': 'Tillgångar',
    'step.distribution': 'Fördelning',
    'step.contact': 'Kontaktuppgifter',
    'step.signing': 'E-signering',
    'step.summary': 'Sammanfattning',
    
    // Main headers
    'app.title': 'Digitalt Arvsskifte',
    'app.subtitle': 'Säker och effektiv hantering av arvsskiften',
    
    // Common buttons
    'button.back': 'Tillbaka',
    'button.next': 'Nästa',
    'button.continue': 'Fortsätt',
    'button.save': 'Spara',
    'button.complete': 'Slutför',
    'button.add': 'Lägg till',
    'button.remove': 'Ta bort',
    'button.edit': 'Redigera',
    'button.select': 'Välj',
    'button.choose': 'Välj',
    
    // Assets page
    'assets.title': 'Tillgångar och bankkonton',
    'assets.subtitle': 'Registrera den avlidnes tillgångar och skulder manuellt',
    'assets.auto_import': 'Automatisk hämtning',
    'assets.manual_input': 'Manuell inmatning',
    'assets.continue_distribution': 'Fortsätt till fördelning',
    'assets.registered_assets': 'Registrerade tillgångar och skulder',
    'assets.total_assets': 'Totala tillgångar',
    'assets.total_debts': 'Totala skulder',
    'assets.net_distributable': 'Nettotillgångar att fördela',
    'assets.add_asset': 'Lägg till tillgång',
    'assets.bank': 'Bank',
    'assets.account_type': 'Kontotyp',
    'assets.asset_type': 'Tillgångs-/Skuldtyp',
    'assets.account_number': 'Kontonummer',
    'assets.amount': 'Belopp (SEK)',
    'assets.debt': 'Skuld (SEK)',
    'assets.select_bank_first': 'Välj bank först',
    'assets.select_account_type': 'Välj kontotyp',
    'assets.select_asset_type': 'Välj tillgångs-/skuldtyp',
    'assets.account_remain': 'Konto ska vara kvar',
    'assets.debt_remain': 'Skuld ska vara kvar',
    'assets.amount_remain': 'Belopp som ska vara kvar (SEK)',
    'assets.reason_remain': 'Anledning till varför kontot ska vara kvar',
    'assets.reason_debt_remain': 'Anledning till varför skulden ska vara kvar',
    
    'assets.start_auto_import': 'Starta automatisk hämtning',
    'assets.importing': 'Hämtar kontoinformation...',
    'assets.accounts_holdings': 'Konton och innehav:',
    'assets.marked_remain': 'Konto markerat att vara kvar',
    'assets.to_distribute': 'Att fördela:',
    'assets.debt_amount_help': 'Ange skuldbeloppet som ett positivt tal',
    'assets.remain_help_debt': 'Markera om skulden inte ska ingå i fördelningen (t.ex. bolån som ska fortsätta gälla)',
    'assets.remain_help_asset': 'Markera om kontot inte ska ingå i fördelningen (t.ex. skatteåterbäring)',
    'assets.remain_amount_help': 'Ange hur mycket som ska vara kvar efter skiftet. Resterande belopp kommer att fördelas.',
    'assets.reason_placeholder_debt': 'T.ex. bolån som ska övertas av specifik arvinge, kvarstående månatliga betalningar, etc.',
    'assets.reason_placeholder_asset': 'T.ex. skatteåterbäring, löpande ärende, etc.',
    'assets.reason_remain_general': 'T.ex. skatteåterbäring, löpande ärende, bolån som ska övertas...',
    'assets.remain_tooltip_on': 'Kontot kommer att vara kvar',
    'assets.remain_tooltip_off': 'Klicka för att markera att kontot ska vara kvar',
    
    // Account categories
    'category.private_accounts': '💳 Privatkonton',
    'category.savings_accounts': '💰 Sparkonton',
    'category.investment_accounts': '📈 Investeringskonton',
    'category.business_accounts': '🏦 Företags- & föreningskonton',
    'category.youth_accounts': '🧒 Barn- och ungdomskonton',
    'category.payment_accounts': '💸 Betal- & kreditkonton',
    'category.loan_accounts': '🏠 Lånekonton',
    'category.pension_accounts': '⚖️ Pensionskonton & försäkringar',
    
    // Step 1 - Identification
    'step1.title': 'Identifiering med BankID',
    'step1.subtitle': 'Ange den avlidnes personnummer för att hämta information från Skatteverket',
    'step1.personal_number': 'Personnummer',
    'step1.personal_number_placeholder': 'YYYYMMDD-XXXX',
    'step1.fetch_info': 'Hämta information',
    'step1.fetching': 'Hämtar information...',
    'step1.deceased_info': 'Information om avliden',
    'step1.name': 'Namn',
    'step1.born': 'Född',
    'step1.died': 'Avliden',
    'step1.last_residence': 'Senaste folkbokföringsadress',
    'step1.heirs_info': 'Arvingar enligt Skatteverket',
    'step1.relationship': 'Relation',
    'step1.inheritance_share': 'Arvslott',
    'step1.no_heirs': 'Inga arvingar registrerade',
    'step1.continue_assets': 'Fortsätt till tillgångar',
    
    // Step 3 - Distribution
    'step3.title': 'Fördelning av tillgångar',
    'step3.subtitle': 'Bestäm hur tillgångarna ska fördelas mellan arvingarna',
    'step3.testament_question': 'Finns det ett testamente?',
    'step3.yes': 'Ja',
    'step3.no': 'Nej',
    'step3.upload_testament': 'Ladda upp testamente',
    'step3.physical_assets': 'Fysiska tillgångar',
    'step3.add_physical_asset': 'Lägg till fysisk tillgång',
    'step3.beneficiaries': 'Förmånstagare',
    'step3.add_beneficiary': 'Lägg till förmånstagare',
    'step3.total_percentage': 'Total procent',
    'step3.continue_contact': 'Fortsätt till kontaktuppgifter',
    'step3.save_progress': 'Spara framsteg',
    'step3.name': 'För- och efternamn',
    'step3.personal_number': 'Personnummer',
    'step3.relationship': 'Relation till den avlidne',
    'step3.percentage': 'Andel (%)',
    'step3.account_number': 'Kontonummer',
    'step3.first_last_name': 'Till exempel Anna Andersson',
    'step3.registered_heirs': 'Registrerade arvingar',
    'step3.total_amount': 'Totala nettotillgångar',
    
    // Step 4 - Contact Info
    'step4.title': 'Kontaktuppgifter',
    'step4.subtitle': 'Samla in kontaktuppgifter från alla arvingar',
    'step4.heir_contact': 'Kontaktuppgifter för arvingar',
    'step4.phone': 'Telefonnummer',
    'step4.email': 'E-postadress',
    'step4.address': 'Adress',
    'step4.continue_signing': 'Fortsätt till e-signering',
    'step4.contact_info_desc': 'Skriv kontaktuppgifter till dödsbodelägare',
    'step4.send_documents': 'Skicka för påskrift',
    'step4.notification_preference': 'Notifieringsinställning',
    'step4.email_only': 'Email',
    'step4.sms_only': 'Sms',
    'step4.both': 'Email och Sms',
    
    // Representative document sending options
    'representative.send_options': 'Välj hur dokumenten ska skickas',
    'representative.send_email_sms': 'E-post och SMS',
    'representative.send_sms_only': 'Endast SMS',
    'representative.send_email_only': 'Endast e-post',
    'step4.sending_documents': 'Skickar dokument...',
    'step4.documents_sent': 'Dokument skickade!',
    'step4.documents_sent_desc': 'Dokument har skickats till arvingarna. De kommer att få ett e-postmeddelande med instruktioner för digital signering.',
    'step4.valid_email': 'Ange en giltig e-postadress',
    'step4.valid_phone': 'Ange ett giltigt telefonnummer (minst 10 siffror)',
    'step4.sent_at': 'Skickat',
    
    // Step 5 - Beneficiary Signing
    'step5.title': 'Arvingar signerar',
    'step5.subtitle': 'Alla arvingar måste signera arvskiftet med BankID',
    'step5.signing_status': 'Signeringsstatus',
    'step5.signed': 'Signerad',
    'step5.pending': 'Väntar på signering',
    'step5.sign_with_bankid': 'Signera med BankID',
    'step5.complete_signing': 'Slutför signering',
    'step5.signed_count': 'arvingar har signerat av',
    'step5.all_signed': 'Alla dödsbodelägare har signerat med BankID! Arvsskiftet kan nu skickas till banker för genomförande via PSD2 och Open Banking.',
    'step5.send_to_banks': 'Skicka till banker',
    'step5.sending_to_banks': 'Skickar till banker...',
    'step5.simulate_signing': 'Simulera signering',
    
    // Step 6 - Summary/Signing
    'step6.title': 'Sammanfattning och slutsignering',
    'step6.subtitle': 'Granska alla uppgifter och slutför arvskiftet',
    'step6.estate_summary': 'Sammanfattning av dödsbo',
    'step6.assets_summary': 'Tillgångar',
    'step6.distribution_summary': 'Fördelning',
    'step6.final_signature': 'Slutsignering',
    'step6.complete_estate': 'Slutför arvsskifte',
    'step6.deceased_person': 'Avliden person',
    'step6.heirs': 'Dödsbodelägare',
    'step6.total_assets': 'Totala tillgångar',
    'step6.total_debts': 'Totala skulder',
    'step6.net_amount': 'Nettobelopp',
    'step6.summary_complete': 'Komplett sammanfattning av alla steg. När du slutför kommer en PDF att skickas till alla angivna e-postadresser och arvsskiftet kommer att skickas till banker via PSD2/Open Banking.',
    'step6.send_pdf_summary': 'Skicka PDF-sammanfattning',
    'step6.sending_pdf': 'Skickar PDF...',
    'step6.complete_settlement': 'Skicka Arvskifte',
    'step6.completing': 'Slutför...',
    'step6.personal_number': 'Personnummer',
    
    // Footer
    'footer.copyright': '© 2024 Digitalt Arvsskifte - Säker hantering av arvsskiften',
    'footer.privacy': 'Integritet',
    'footer.terms': 'Villkor',
    'footer.support': 'Support'
  },
  en: {
    // Step labels
    'step.identification': 'Identification',
    'step.assets': 'Assets',
    'step.distribution': 'Distribution',
    'step.contact': 'Contact Information',
    'step.signing': 'E-signing',
    'step.summary': 'Summary',
    
    // Main headers
    'app.title': 'Digital Estate Settlement',
    'app.subtitle': 'Secure and efficient estate settlement management',
    
    // Common buttons
    'button.back': 'Back',
    'button.next': 'Next',
    'button.continue': 'Continue',
    'button.save': 'Save',
    'button.complete': 'Complete',
    'button.add': 'Add',
    'button.remove': 'Remove',
    'button.edit': 'Edit',
    'button.select': 'Select',
    'button.choose': 'Choose',
    
    // Assets page
    'assets.title': 'Assets and bank accounts',
    'assets.subtitle': 'Manually register the deceased\'s assets and debts',
    'assets.auto_import': 'Automatic import',
    'assets.manual_input': 'Manual input',
    'assets.continue_distribution': 'Continue to distribution',
    'assets.registered_assets': 'Registered assets and debts',
    'assets.total_assets': 'Total assets',
    'assets.total_debts': 'Total debts',
    'assets.net_distributable': 'Net distributable assets',
    'assets.add_asset': 'Add asset',
    'assets.bank': 'Bank',
    'assets.account_type': 'Account type',
    'assets.asset_type': 'Asset/Debt type',
    'assets.account_number': 'Account number',
    'assets.amount': 'Amount (SEK)',
    'assets.debt': 'Debt (SEK)',
    'assets.select_bank_first': 'Select bank first',
    'assets.select_account_type': 'Select account type',
    'assets.select_asset_type': 'Select asset/debt type',
    'assets.account_remain': 'Account should remain',
    'assets.debt_remain': 'Debt should remain',
    'assets.amount_remain': 'Amount that should remain (SEK)',
    'assets.reason_remain': 'Reason why the account should remain',
    'assets.reason_debt_remain': 'Reason why the debt should remain',
    
    'assets.start_auto_import': 'Start automatic import',
    'assets.importing': 'Importing account information...',
    'assets.accounts_holdings': 'Accounts and holdings:',
    'assets.marked_remain': 'Account marked to remain',
    'assets.to_distribute': 'To distribute:',
    'assets.debt_amount_help': 'Enter the debt amount as a positive number',
    'assets.remain_help_debt': 'Check if the debt should not be included in the distribution (e.g. mortgage to continue)',
    'assets.remain_help_asset': 'Check if the account should not be included in the distribution (e.g. tax refund)',
    'assets.remain_amount_help': 'Enter how much should remain after the settlement. The remaining amount will be distributed.',
    'assets.reason_placeholder_debt': 'E.g. mortgage to be taken over by specific heir, ongoing monthly payments, etc.',
    'assets.reason_placeholder_asset': 'E.g. tax refund, ongoing matter, etc.',
    'assets.reason_remain_general': 'E.g. tax refund, ongoing matter, mortgage to be taken over...',
    'assets.remain_tooltip_on': 'The account will remain',
    'assets.remain_tooltip_off': 'Click to mark that the account should remain',
    
    // Account categories
    'category.private_accounts': '💳 Private accounts',
    'category.savings_accounts': '💰 Savings accounts',
    'category.investment_accounts': '📈 Investment accounts',
    'category.business_accounts': '🏦 Business & association accounts',
    'category.youth_accounts': '🧒 Children & youth accounts',
    'category.payment_accounts': '💸 Payment & credit accounts',
    'category.loan_accounts': '🏠 Loan accounts',
    'category.pension_accounts': '⚖️ Pension accounts & insurance',
    
    // Step 1 - Identification
    'step1.title': 'Identification with BankID',
    'step1.subtitle': 'Enter the deceased\'s personal number to retrieve information from the Tax Agency',
    'step1.personal_number': 'Personal number',
    'step1.personal_number_placeholder': 'YYYYMMDD-XXXX',
    'step1.fetch_info': 'Fetch information',
    'step1.fetching': 'Fetching information...',
    'step1.deceased_info': 'Information about deceased',
    'step1.name': 'Name',
    'step1.born': 'Born',
    'step1.died': 'Died',
    'step1.last_residence': 'Last registered address',
    'step1.heirs_info': 'Heirs according to Tax Agency',
    'step1.relationship': 'Relationship',
    'step1.inheritance_share': 'Inheritance share',
    'step1.no_heirs': 'No heirs registered',
    'step1.continue_assets': 'Continue to assets',
    
    // Step 3 - Distribution
    'step3.title': 'Asset distribution',
    'step3.subtitle': 'Determine how assets should be distributed among heirs',
    'step3.testament_question': 'Is there a will?',
    'step3.yes': 'Yes',
    'step3.no': 'No',
    'step3.upload_testament': 'Upload will',
    'step3.physical_assets': 'Physical assets',
    'step3.add_physical_asset': 'Add physical asset',
    'step3.beneficiaries': 'Beneficiaries',
    'step3.add_beneficiary': 'Add beneficiary',
    'step3.total_percentage': 'Total percentage',
    'step3.continue_contact': 'Continue to contact information',
    'step3.save_progress': 'Save progress',
    'step3.name': 'Name',
    'step3.personal_number': 'Personal number',
    'step3.relationship': 'Relationship',
    'step3.percentage': 'Percentage (%)',
    'step3.account_number': 'Account number',
    'step3.progress_saved': 'Progress saved!',
    'step3.save_pdf': 'Save as PDF',
    'step3.add_heir': 'Add heir',
    'step3.first_last_name': 'First and last name',
    'step3.registered_heirs': 'Registrerade arvingar',
    'step3.total_amount': 'Totala nettotillgångar',
    'step3.relationship_to_deceased': 'Relationship to deceased',
    'step3.account_for_payment': 'Account number for payment',
    
    // Step 4 - Contact Info
    'step4.title': 'Contact information',
    'step4.subtitle': 'Collect contact information from all heirs',
    'step4.heir_contact': 'Contact information for heirs',
    'step4.phone': 'Phone number',
    'step4.email': 'Email address',
    'step4.address': 'Address',
    'step4.continue_signing': 'Continue to e-signing',
    'step4.contact_info_desc': 'We need contact information to send documents for digital signing.',
    'step4.send_documents': 'Send documents for signing',
    'step4.sending_documents': 'Sending documents...',
    'step4.documents_sent': 'Documents sent!',
    'step4.documents_sent_desc': 'Documents have been sent to the heirs. They will receive an email with instructions for digital signing.',
    'step4.notification_preference': 'Notification preference',
    'step4.email_only': 'Email only',
    'step4.sms_only': 'SMS only',
    'step4.both': 'Both email and SMS',
    
    // Representative document sending options
    'representative.send_options': 'Choose how documents should be sent',
    'representative.send_email_sms': 'Email and SMS',
    'representative.send_sms_only': 'SMS only',
    'representative.send_email_only': 'Email only',
    'step4.valid_email': 'Enter a valid email address',
    'step4.valid_phone': 'Enter a valid phone number (at least 10 digits)',
    'step4.sent_at': 'Sent',
    
    // Step 5 - Beneficiary Signing
    'step5.title': 'Heirs signing',
    'step5.subtitle': 'All heirs must sign the estate settlement with BankID',
    'step5.signing_status': 'Signing status',
    'step5.signed': 'Signed',
    'step5.pending': 'Pending signature',
    'step5.sign_with_bankid': 'Sign with BankID',
    'step5.complete_signing': 'Complete signing',
    'step5.signed_count': 'heirs have signed out of',
    'step5.all_signed': 'All estate owners have signed with BankID! The estate settlement can now be sent to banks for execution via PSD2 and Open Banking.',
    'step5.send_to_banks': 'Send to banks',
    'step5.sending_to_banks': 'Sending to banks...',
    'step5.simulate_signing': 'Simulate signing',
    
    // Step 6 - Summary/Signing
    'step6.title': 'Summary and final signing',
    'step6.subtitle': 'Review all information and complete the estate settlement',
    'step6.estate_summary': 'Estate summary',
    'step6.assets_summary': 'Assets',
    'step6.distribution_summary': 'Distribution',
    'step6.final_signature': 'Final signature',
    'step6.complete_estate': 'Complete estate settlement',
    'step6.deceased_person': 'Deceased person',
    'step6.heirs': 'Estate owners',
    'step6.total_assets': 'Total assets',
    'step6.total_debts': 'Total debts',
    'step6.net_amount': 'Net amount',
    'step6.summary_complete': 'Complete summary of all steps. When you complete, a PDF will be sent to all specified email addresses and the estate settlement will be sent to banks via PSD2/Open Banking.',
    'step6.send_pdf_summary': 'Send PDF summary',
    'step6.sending_pdf': 'Sending PDF...',
    'step6.complete_settlement': 'Complete estate settlement',
    'step6.completing': 'Completing...',
    'step6.personal_number': 'Personal number',
    
    // Footer
    'footer.copyright': '© 2024 Digital Estate Settlement - Secure estate settlement management',
    'footer.privacy': 'Privacy',
    'footer.terms': 'Terms',
    'footer.support': 'Support'
  }
};

export const useTranslation = () => {
  const [language, setLanguage] = useState<Language>('sv');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  const getStepLabels = (): string[] => {
    return [
      t('step.identification'),
      t('step.assets'),
      t('step.distribution'),
      t('step.contact'),
      t('step.signing'),
      t('step.summary')
    ];
  };

  return {
    t,
    language,
    changeLanguage,
    getStepLabels
  };
};