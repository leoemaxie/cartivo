import { db } from "./db";
import { products } from "@shared/schema";
import { sql } from "drizzle-orm";

const DEFAULT_PRODUCTS = [
  {
    name: "Modern Minimalist Sneakers",
    price: "$129.00",
    rating: 4.8,
    category: "Recommended",
    img: "https://images.unsplash.com/photo-1543175420-34298ee94d44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzbmVha2VyJTIwZGVzaWduZXIlMjBmb290d2VhciUyMG1pbmltYWxpc3QlMjB3aGl0ZSUyMHNob2UlMjBwcm9kdWN0JTIwcGhvdG9ncmFwaHklMjBzdHVkaW98ZW58MXx8fHwxNzcxNTQ4MzY4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    name: "Eco-Friendly Linen Jacket",
    price: "$249.00",
    rating: 4.9,
    category: "Sustainable",
    img: "https://images.unsplash.com/photo-1759229874709-a8d0de083b91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXN0YWluYWJsZSUyMGZhc2hpb24lMjBlY28tZnJpZW5kbHklMjBvcmdhbmljJTIwY290dG9uJTIwY2xvdGhpbmclMjBtaW5pbWFsJTIwZGVzaWduJTIwZWFydGglMjB0b25lc3xlbnwxfHx8fDE3NzE1NDgzNjh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    name: "Smart Vision Glasses",
    price: "$399.00",
    rating: 4.7,
    category: "Trending",
    img: "https://images.unsplash.com/photo-1562330744-0e81c1e9dd88?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydCUyMGdsYXNzZXMlMjBhdWdtZW50ZWQlMjByZWFsaXR5JTIwdGVjaCUyMGZ1dHVyaXN0aWMlMjB3ZWFyYWJsZSUyMEFJJTIwaGVhZHNldCUyMGRlc2lnbnxlbnwxfHx8fDE3NzE1NDgzNjh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    name: "Designer Silk Scarf",
    price: "$89.00",
    rating: 4.6,
    category: "Recommended",
    img: "https://images.unsplash.com/photo-1621536531700-cb0d34d56699?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMG9mJTIwc3R5bGlzaCUyMHlvdW5nJTIwd29tYW4lMjBpbiUyMHByZW1pdW0lMjBvdXRmaXQlMjBwcm9mZXNzaW9uYWwlMjBoaWdoJTIwZmFzaGlvbiUyMHBob3RvZ3JhcGh5fGVufDF8fHx8MTc3MTU0ODM2OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
];

export async function seedProducts() {
  const existing = await db.select({ id: products.id }).from(products).limit(1);
  if (existing.length > 0) {
    console.log("Products already seeded, skipping...");
    return;
  }
  await db.insert(products).values(DEFAULT_PRODUCTS);
  console.log("Seeded default products");
}
