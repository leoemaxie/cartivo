export default {
  name: 'brand',
  title: 'Brand',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Brand Name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
      },
    },
    {
      name: 'trustScore',
      title: 'Trust Score',
      type: 'number',
      description: 'Trust score from 0-100 based on reviews and ratings',
      validation: (Rule: any) => Rule.min(0).max(100),
    },
    {
      name: 'sustainabilityRating',
      title: 'Sustainability Rating',
      type: 'number',
      description: 'Sustainability rating from 0-100 based on environmental practices',
      validation: (Rule: any) => Rule.min(0).max(100),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
    {
      name: 'website',
      title: 'Website',
      type: 'url',
    },
    {
      name: 'image',
      title: 'Brand Logo',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
  ],
}
