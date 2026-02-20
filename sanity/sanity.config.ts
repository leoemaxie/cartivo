import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import 'dotenv/config'

export default defineConfig({
  name: 'default',
  title: 'Cartivo',

  projectId: process.env.SANITY_PROJECT_ID || 'project-id',
  dataset: process.env.SANITY_DATASET || 'production',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
