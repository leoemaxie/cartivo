# Smart Setup Builder - Deployment Guide

## 📋 Prerequisites

Before deploying, ensure you have:

1. **Sanity Account & Project**
   - Create a free Sanity account at [sanity.io](https://sanity.io)
   - Create a new Sanity project

2. **Cartivo App**
   - This feature integrates with the Cartivo React application

3. **Environment Variables**
   - Sanity project credentials

---

## 🛠️ Setup Instructions

### Step 1: Initialize Sanity Project

If you don't have Sanity CLI installed:

```bash
npm install -g @sanity/cli
sanity login
sanity init
```

### Step 2: Add Sanity Schemas

Copy the schemas from `/sanity/schemas/` to your Sanity project:

```bash
# Copy to your Sanity project's schemas directory
cp sanity/schemas/*.ts YOUR_SANITY_PROJECT/schemas/
```

### Step 3: Deploy Sanity Studio

```bash
cd YOUR_SANITY_PROJECT
sanity deploy
```

### Step 4: Configure Environment Variables

Create `.env.local` in the project root:

```env
# Sanity Configuration
VITE_SANITY_PROJECT_ID=YOUR_PROJECT_ID
VITE_SANITY_DATASET=production
REACT_APP_SANITY_PROJECT_ID=YOUR_PROJECT_ID
REACT_APP_SANITY_DATASET=production
```

**To find your Project ID:**

```bash
sanity get-project-id
```

**Or from Sanity Dashboard:**
- Go to Sanity.io Dashboard
- Select your project
- Go to Settings → General
- Copy your Project ID

### Step 5: Populate Test Data

Use Sanity Studio to add test products:

1. Access your Sanity Studio: `https://your-project.sanity.studio`
2. Create categories (Furniture, Lighting, Accessories, etc.)
3. Create brands
4. Create attributes
5. Create products with relationships

**Example Data Structure:**

```
Category: Office Chair
  ├─ Product: Ergonomic Office Chair ($299)
  │  ├─ Brand: Herman Miller (Trust: 95)
  │  ├─ Compatibility: [Desk, Monitor Stand]
  │  ├─ Style Tags: [ergonomic-tech, modern]
  │  └─ Performance: Durability: 95, Rating: 4.8

Product: Standing Desk ($799)
  ├─ Brand: Autonomous (Trust: 88)
  ├─ Compatibility: [Monitor, Office Chair]
  ├─ Style Tags: [modern, ergonomic-tech]
  └─ Performance: Durability: 92, Rating: 4.5
```

### Step 6: Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` and navigate to the Smart Setup Builder.

### Step 7: Build for Production

```bash
npm run build
```

---

## 🌐 Deploy to Vercel

### Option 1: Using Vercel CLI

```bash
npm install -g vercel
vercel
```

### Option 2: Connect GitHub to Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Select your repository
5. Add environment variables in Vercel dashboard
6. Deploy

### Environment Variables in Vercel

In Vercel dashboard, go to **Settings → Environment Variables** and add:

```
VITE_SANITY_PROJECT_ID=YOUR_PROJECT_ID
VITE_SANITY_DATASET=production
REACT_APP_SANITY_PROJECT_ID=YOUR_PROJECT_ID
REACT_APP_SANITY_DATASET=production
```

---

## 🔗 Alternative Deployment Options

### Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

Set environment variables in Netlify dashboard.

### Deploy to AWS Amplify

```bash
npm install -g @aws-amplify/cli
amplify init
amplify publish
```

### Deploy to Docker

**Dockerfile:**

```dockerfile
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

**Build & Run:**

```bash
docker build -t cartivo-smart-setup .
docker run -p 3000:3000 -e VITE_SANITY_PROJECT_ID=YOUR_ID cartivo-smart-setup
```

---

## ✏️ Content Management

### Adding New Products via Sanity API

```typescript
import sanityClient from '@/services/sanity/client'

const createProduct = async (product: any) => {
  const response = await sanityClient.create({
    _type: 'product',
    name: product.name,
    slug: { _type: 'slug', current: product.name.toLowerCase().replace(/ /g, '-') },
    price: product.price,
    category: { _type: 'reference', _ref: product.categoryId },
    brand: { _type: 'reference', _ref: product.brandId },
    // ... other fields
  })
  return response
}
```

### Batch Import Products

Use Sanity's batch operations in `sanity/migrations/`:

```typescript
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'YOUR_PROJECT_ID',
  dataset: 'production',
  token: 'YOUR_TOKEN', // Get from Settings → API tokens
  apiVersion: '2024-02-01',
})

export async function importProducts(products: any[]) {
  const mutations = products.map((p) => ({
    create: {
      _type: 'product',
      ...p,
    },
  }))

  return client.transaction(mutations).commit()
}
```

---

## 🔐 Security Best Practices

1. **Never expose write tokens** - Use read-only public tokens for the frontend
2. **Use Sanity Roles** - Configure user roles in Sanity Dashboard
3. **Validate inputs** - Validate all user inputs on backend
4. **Rate limiting** - Implement rate limiting for API calls
5. **CORS Settings** - Configure CORS in Sanity dashboard

---

## 📊 Monitoring & Analytics

### Track Setup Builder Usage

```typescript
// In SmartSetupBuilder.tsx
const trackSetupGeneration = (result: SetupBuilderResult) => {
  console.log('Setup Generated:', {
    timestamp: new Date(),
    productCount: result.products.length,
    totalCost: result.totalCost,
    budget: constraints.maxBudget,
    isCompatible: result.isCompactible,
  })

  // Send to analytics
  if (window.gtag) {
    window.gtag('event', 'setup_generated', {
      product_count: result.products.length,
      total_cost: result.totalCost,
    })
  }
}
```

### Setup Google Analytics

Add to `index.html`:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || []
  function gtag() {
    dataLayer.push(arguments)
  }
  gtag('js', new Date())
  gtag('config', 'GA_ID')
</script>
```

---

## 🧪 Testing

### Unit Tests

```bash
npm install --save-dev vitest @testing-library/react
npm test
```

### E2E Tests

```bash
npm install --save-dev cypress
npx cypress open
```

---

## 🚨 Troubleshooting

### Issue: "Project ID not found"

**Solution:** Verify `VITE_SANITY_PROJECT_ID` is correctly set:

```bash
# Check environment
echo $VITE_SANITY_PROJECT_ID
```

### Issue: "No products returned from query"

**Solutions:**
1. Verify products exist in Sanity Studio
2. Check category references are valid
3. Ensure price filters match your test data
4. Check GROQ query syntax in browser console

### Issue: "CORS error when fetching from Sanity"

**Solution:** Allow your domain in Sanity:
1. Go to Sanity Dashboard → Settings → CORS
2. Add your domain: `http://localhost:5173`, `https://yourapp.vercel.app`

### Issue: "Kendo UI components not rendering"

**Solution:** Ensure Kendo licenses are valid:
```bash
npm install @progress/kendo-licensing
```

Add to your main.tsx:
```typescript
import '@progress/kendo-licensing'
```

---

## 📈 Performance Optimization

1. **Lazy load components:**

```typescript
const SmartSetupBuilder = lazy(() => import('@/app/components/SmartSetupBuilder'))
```

2. **Cache queries with SWR:**

```typescript
import useSWR from 'swr'

const { data: categories } = useSWR('categories', fetchCategories)
```

3. **Image optimization:**
- Use Sanity's image optimization
- Add width/height constraints

4. **Code splitting:**
```bash
npm run build # Automatically creates optimized chunks
```

---

## 📞 Support

For issues:
1. Check [Sanity Docs](https://www.sanity.io/docs)
2. Review [Kendo UI Docs](https://www.telerik.com/kendo-react-ui)
3. Check GitHub Issues
4. Contact support@your-domain.com

---

## ✅ Deployment Checklist

- [ ] Sanity project created and schemas deployed
- [ ] Environment variables configured
- [ ] Test data added to Sanity Studio
- [ ] Development server runs without errors
- [ ] Build completes successfully (`npm run build`)
- [ ] Smart Setup Builder component loads
- [ ] CORS settings configured
- [ ] Analytics configured
- [ ] Security settings reviewed
- [ ] Deployed to production
- [ ] SSL certificate valid
- [ ] Monitoring configured

---

## 📝 License

See LICENSE.md for details.
