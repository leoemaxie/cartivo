import { createClient } from '@sanity/client'

const sanityClient = createClient({
  projectId: import.meta.env.SANITY_PROJECT_ID || 'project-id',
  dataset:  import.meta.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2025-02-19',
  useCdn: true,
})

export default sanityClient
