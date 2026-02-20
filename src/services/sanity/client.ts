import { createClient } from '@sanity/client'

const sanityClient = createClient({
  projectId: process.env.REACT_APP_SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID || 'YOUR_PROJECT_ID',
  dataset: process.env.REACT_APP_SANITY_DATASET || process.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2024-02-01',
  useCdn: true,
})

export default sanityClient
