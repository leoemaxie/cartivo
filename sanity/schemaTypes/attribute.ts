export default {
  name: 'attribute',
  title: 'Attribute',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
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
      name: 'type',
      title: 'Attribute Type',
      type: 'string',
      options: {
        list: [
          { title: 'Material', value: 'material' },
          { title: 'Waterproof', value: 'waterproof' },
          { title: 'Ergonomic', value: 'ergonomic' },
          { title: 'Wireless', value: 'wireless' },
          { title: 'Adjustable', value: 'adjustable' },
          { title: 'Noise Canceling', value: 'noiseCanceling' },
          { title: 'Portable', value: 'portable' },
          { title: 'Weather Resistant', value: 'weatherResistant' },
          { title: 'Energy Efficient', value: 'energyEfficient' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
  ],
}
