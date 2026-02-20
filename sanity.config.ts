import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './schemas'

export default defineConfig({
  name: 'default',
  title: 'Cartivo Studio',
  projectId: process.env.SANITY_PROJECT_ID || 'YOUR_PROJECT_ID',
  dataset: process.env.SANITY_DATASET || 'production',
  plugins: [structureTool()],
  schema: {
    types: schemaTypes,
  },
})
