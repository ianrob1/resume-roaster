# Resume Roast

Get your resume roasted in 60 seconds. Upload a PDF or DOCX, pay $19, and receive an ATS score, brutal feedback, bullet rewrites, missing keywords, and an improved resume—delivered by email and on the results page.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS
- **Backend:** Next.js API routes
- **Database:** Airtable
- **AI:** OpenAI API
- **Payments:** Stripe
- **Email:** Resend
- **File storage:** UploadThing

## Setup

1. **Clone and install**
   ```bash
   cd resume-roast && npm install
   ```

2. **Environment variables**  
   Copy `.env.local.example` to `.env.local` and fill in:
   - `OPENAI_API_KEY` — OpenAI API key
   - `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID` — from [Stripe Dashboard](https://dashboard.stripe.com). Create a Product "Resume Roast" with a $19 one-time Price and use that Price ID.
   - `UPLOADTHING_TOKEN` — from [UploadThing](https://uploadthing.com) (base64 token)
   - `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`, `AIRTABLE_TABLE_NAME` — Airtable base and table "resumes" with fields: email, resume_file, job_role, experience_level, raw_text, ats_score, roast_text, bullet_improvements, missing_keywords, rewritten_resume, status, created_at
   - `RESEND_API_KEY`, `EMAIL_FROM` — from [Resend](https://resend.com)
   - `NEXT_PUBLIC_APP_URL` — e.g. `http://localhost:3000` or your production URL

3. **Airtable**  
   Create a base with a table named `resumes` and single-select fields for `job_role` (Software Engineer, Product Manager, Marketing, Sales, Finance, Other), `experience_level` (Entry, Mid, Senior), and `status` (uploaded, processing, completed). Use Long text for roast, bullets, keywords, and rewritten resume.

4. **Stripe webhook**  
   For local testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe` and use the printed webhook secret. Subscribe to `checkout.session.completed`.

5. **Run**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## User Flow

1. Landing → **Upload** (resume + job role + experience + email)
2. **Checkout** → Stripe $19 payment
3. **Processing** → Poll until analysis completes
4. **Results** → ATS score, roast, bullet improvements, missing keywords, improved resume (and email with link)

## Deploy (Vercel)

- Set all env vars in the Vercel project.
- Add the Stripe webhook URL: `https://your-domain.com/api/webhooks/stripe` (event: `checkout.session.completed`).
- Verify your domain in Resend for `EMAIL_FROM`.
