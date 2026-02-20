# Cartivo PDF Shopping Reports

Cartivo PDF Shopping Reports extends **Cartivo**, the AI shopping copilot, by allowing users to generate **offline, shareable, and professional PDF reports** of their personalized shopping bundles.

The workflow is **end-to-end**:

**Input → AI Bundle Computation → PDF Generation → PDF Enhancement → Output**

---

## 💡 Features

✨ **Smart Bundle Report Generation**

* Generates product cards with image, name, price, and attributes
* Displays compatibility notes, style & sustainability scores
* Shows total budget and suggested alternatives

📄 **Dynamic PDF Generation**

* Uses **Foxit Document Generation API** to create clean, professional PDFs
* Layouts: tables, headers, sections, and product visuals

🖋 **PDF Enhancement**

* Uses **Foxit PDF Services API** to:

  * Merge multiple bundles for comparison
  * Add bookmarks / table of contents
  * Highlight key recommendations (“Best value”, “Most sustainable”)
  * Optimize for mobile or print

🔗 **Interactive Experience**

* Optionally adds QR codes linking back to Cartivo online
* Shareable reports for offline decision-making

---

## 🏗 Architecture Overview

```
[User Input: budget, category, style]
        │
        ▼
[Cartivo AI Engine + Sanity Queries]
        │
        ▼
[Foxit Document Generation API] → Generate dynamic PDF
        │
        ▼
[Foxit PDF Services API] → Enhance PDF (merge, annotate, optimize)
        │
        ▼
[Output: Downloadable / Shareable PDF]
```

---

## ⚙️ Setup Instructions

1. Clone the repo
   `git clone https://github.com/leoemaxie/cartivo.git`
2. Install dependencies
   `npm install`
3. Configure environment variables:

   * FOXIT_API_KEY
   * FOXIT_API_SECRET
   * SANITY_PROJECT_ID
4. Start the server
   `npm start`
5. Open the frontend and generate PDF reports

---

## 🔗 API Usage Callout

* **Document Generation API:** Generates dynamic PDFs of shopping bundles with product images, scores, and compatibility info.
* **PDF Services API:** Enhances generated PDFs with annotations, bookmarks, merges, and optimization for print or mobile.

---

## 🚀 Demo

* Users input shopping preferences → Cartivo computes Smart Bundle → PDF report is generated → Enhanced PDF is ready to download or share.

---

## 🏆 Why This Wins

* Real-world use case: printable or shareable shopping reports
* End-to-end workflow: AI reasoning → structured content → polished PDF
* Creative: integrates structured content, AI, and PDF automation
* Technical execution: modular, scalable, hackathon-ready

---

## 🧩 Future Enhancements

* Multi-bundle comparison PDFs
* Charts for price or sustainability breakdowns
* User preference memory for recurring PDF reports
* Browser extension for Cartivo → PDF export
