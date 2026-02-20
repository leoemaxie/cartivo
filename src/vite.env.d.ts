/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Deepgram Voice Agent
  readonly VITE_DEEPGRAM_API_KEY?: string

  // Sanity Configuration
  readonly SANITY_PROJECT_ID?: string
  readonly SANITY_DATASET?: string
  readonly VITE_SANITY_DATASET?: string

  // Foxit PDF APIs
  readonly VITE_FOXIT_API_KEY?: string
  readonly VITE_FOXIT_DOC_GEN_URL?: string
  readonly VITE_FOXIT_PDF_SERVICES_URL?: string
  readonly VITE_FOXIT_TEMPLATE_ID?: string

  // App Configuration
  readonly VITE_APP_URL?: string

  // You.com API
  readonly VITE_YOU_API_KEY?: string

  // PerfectCorp Confidence Engine
  readonly VITE_PERFECT_CORP_API_KEY?: string
  readonly VITE_MOCK_PERFECT_CORP?: string
  readonly VITE_CONFIDENCE_API_URL?: string

  // Kendo License (Optional)
  readonly VITE_KENDO_LICENSE_KEY?: string

  // Analytics (Optional)
  readonly VITE_GOOGLE_ANALYTICS_ID?: string
  readonly VITE_SEGMENT_KEY?: string

  // External APIs (Optional)
  readonly VITE_AFFILIATE_API_KEY?: string
  readonly VITE_PRODUCT_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
