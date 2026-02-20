export default {
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Product Name',
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
      name: 'price',
      title: 'Price (USD)',
      type: 'number',
      validation: (Rule: any) => Rule.required().min(0),
    },
    {
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'brand',
      title: 'Brand',
      type: 'reference',
      to: [{ type: 'brand' }],
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
    {
      name: 'attributes',
      title: 'Attributes',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'attribute' }],
        },
      ],
      description: 'e.g., wireless, ergonomic, waterproof, etc.',
    },
    {
      name: 'styleTags',
      title: 'Style Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          'modern',
          'minimalist',
          'industrial',
          'scandinavian',
          'industrial-modern',
          'ergonomic-tech',
          'sustainable',
          'luxury',
          'budget-friendly',
          'vintage',
        ],
      },
      description: 'e.g., modern, minimalist, industrial',
    },
    {
      name: 'performanceMetrics',
      title: 'Performance Metrics',
      type: 'object',
      fields: [
        {
          name: 'durabilityScore',
          title: 'Durability Score',
          type: 'number',
          validation: (Rule: any) => Rule.min(0).max(100),
          description: '0-100 scale',
        },
        {
          name: 'returnRate',
          title: 'Return Rate (%)',
          type: 'number',
          validation: (Rule: any) => Rule.min(0).max(100),
          description: 'Percentage of returns',
        },
        {
          name: 'warrantyYears',
          title: 'Warranty (Years)',
          type: 'number',
          validation: (Rule: any) => Rule.min(0),
        },
        {
          name: 'averageRating',
          title: 'Average Rating',
          type: 'number',
          validation: (Rule: any) => Rule.min(0).max(5),
          description: '0-5 star rating',
        },
      ],
    },
    {
      name: 'sustainabilityScore',
      title: 'Sustainability Score',
      type: 'number',
      validation: (Rule: any) => Rule.min(0).max(100),
      description: '0-100 scale based on materials, production, packaging',
    },
    {
      name: 'compatibility',
      title: 'Compatible Products',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'product' }],
        },
      ],
      description: 'Other products that work well with this one',
    },
    {
      name: 'requiredAccessories',
      title: 'Required Accessories',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'product' }],
        },
      ],
      description: 'Products required to function (e.g., cables, stands)',
    },
    {
      name: 'alternatives',
      title: 'Alternative Products',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'product' }],
        },
      ],
      description: 'Similar products for when this one is over budget',
    },
    {
      name: 'image',
      title: 'Product Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'images',
      title: 'Product Images Gallery',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
        },
      ],
    },
    {
      name: 'sku',
      title: 'SKU',
      type: 'string',
      description: 'Stock Keeping Unit',
    },
    {
      name: 'inStock',
      title: 'In Stock',
      type: 'boolean',
      initialValue: true,
    },
    {
      name: 'externalUrl',
      title: 'External Product URL',
      type: 'url',
      description: 'Link to purchase this product',
    },
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image',
      price: 'price',
    },
    prepare(selection: any) {
      const { title, media, price } = selection
      return {
        title: title,
        media: media,
        subtitle: `$${price}`,
      }
    },
  },
}
