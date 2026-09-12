# ডিপ্লয় গাইড — নতুন ক্লায়েন্টের জন্য স্টোর চালু করা

এই টেমপ্লেটটি যত খুশি ক্লায়েন্টের জন্য আলাদা আলাদা করে চালু করা যায়। প্রতিটি ক্লায়েন্টের জন্য **নতুন Supabase প্রজেক্ট** + **নতুন ডিপ্লয়মেন্ট** — এই ২টাই লাগবে। কোড একটাই থাকবে।

---

## ধাপ ১: নতুন Supabase প্রজেক্ট খুলুন

1. [supabase.com](https://supabase.com) → **New Project**
2. নাম দিন (যেমন `client-x-store`), ডাটাবেজ পাসওয়ার্ড দিন, রিজিওন সিলেক্ট করুন (Singapore ভালো)
3. প্রজেক্ট তৈরি হতে ২-৩ মিনিট অপেক্ষা করুন

## ধাপ ২: ডাটাবেজ সেটআপ (SQL ইমপোর্ট)

1. Supabase ড্যাশবোর্ড → বাম পাশে **SQL Editor** → **New query**
2. এই রেপোর `database-setup.sql` ফাইলের **সম্পূর্ণ কনটেন্ট কপি** করে পেস্ট করুন
3. **Run** চাপুন (১ মিনিটের মধ্যে শেষ হবে)

এতে তৈরি হবে:
- সব টেবিল (প্রোডাক্ট, অর্ডার, ক্যাটাগরি, হিরো স্লাইডার, ভিডিও, সেটিংস ইত্যাদি)
- সব নিরাপত্তা নিয়ম (RLS পলিসি)
- ছবি আপলোডের স্টোরেজ বাকেট (`store-media`)
- ডেমো প্রোডাক্ট, ক্যাটাগরি ও ডিফল্ট সেটিংস

## ধাপ ৩: Auth সেটিং

1. **Authentication → Sign In / Providers** → **Email** চালু আছে কিনা দেখুন
2. **Authentication → Sign In / Up** → **Confirm email** — ক্লায়েন্ট চাইলে বন্ধ করে দিন (তাহলে রেজিস্ট্রেশনের পর সাথে সাথে লগইন হবে)

## ধাপ ৪: API কি সংগ্রহ

**Project Settings → Data API / API Keys** থেকে নিন:
- **Project URL** (যেমন `https://abcdefgh.supabase.co`)
- **Publishable (anon) key** — `sb_publishable_...` বা পুরনো স্টাইলের `anon` JWT

## ধাপ ৫: কোডে কানফিগার

প্রজেক্ট রুটে `.env` ফাইল এডিট করুন:

```env
VITE_SUPABASE_PROJECT_ID=আপনার-প্রজেক্ট-আইডি
VITE_SUPABASE_PUBLISHABLE_KEY=আপনার-publishable-কি
VITE_SUPABASE_URL=https://আপনার-প্রজেক্ট.supabase.co
SUPABASE_URL=https://আপনার-প্রজেক্ট.supabase.co
SUPABASE_PUBLISHABLE_KEY=আপনার-publishable-কি
```

> প্রতিটি ক্লায়েন্টের জন্য আলাদা `.env` ব্যবহার হবে — ডেটা সম্পূর্ণ আলাদা থাকবে।

## ধাপ ৬: Cloudflare Workers-এ ডিপ্লয়

### একবারের প্রস্তুতি
```bash
npm install -g wrangler
wrangler login          # ব্রাউজারে Cloudflare লগইন হবে
```

### ডিপ্লয়
```bash
bun install
bun run build
wrangler deploy         # প্রথমবার worker নাম চাইলে দিন (যেমন client-x-store)
```

### Environment Variables / Secrets (Cloudflare-এ) — ৬টি variable

এই project-এ আলাদা `SUPABASE_SERVICE_ROLE_KEY` বা `LOVABLE_CRON_SECRET` দেওয়ার দরকার নেই। Cloudflare Worker-এ নিচের ৬টি variable দিলেই store, auth, admin, products, orders, uploads এবং dashboard কাজ করবে।

Cloudflare Dashboard → **Workers & Pages → আপনার Worker → Settings → Variables and Secrets**-এ গিয়ে **Add** করুন। প্রতিটির Type সঠিকভাবে বেছে নিন — সিক্রেট কি-গুলো অবশ্যই **Secret (encrypted)** টাইপে রাখবেন, প্লেইন টেক্সটে নয়।

| নাম | Type | বাধ্যতামূলক? | কী কাজ করে | কোথা থেকে পাবেন |
|---|---|---|---|---|
| `SUPABASE_PROJECT_ID` | Plaintext | হ্যাঁ | Project identity/configuration | Supabase Dashboard → Project Settings → General → Reference ID |
| `SUPABASE_PUBLISHABLE_KEY` | Plaintext | হ্যাঁ | SSR, auth middleware এবং server-side RLS queries | Supabase Dashboard → Project Settings → API → Publishable key |
| `SUPABASE_URL` | Plaintext | হ্যাঁ | Server-side Supabase URL | Supabase Dashboard → Project Settings → API → Project URL |
| `VITE_SUPABASE_PROJECT_ID` | Plaintext | হ্যাঁ | Browser build-time project identity | `SUPABASE_PROJECT_ID`-এর একই value |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Plaintext | হ্যাঁ | Browser build-time publishable key | `SUPABASE_PUBLISHABLE_KEY`-এর একই value |
| `VITE_SUPABASE_URL` | Plaintext | হ্যাঁ | Browser build-time Supabase URL | `SUPABASE_URL`-এর একই value |

> **নিরাপত্তা সতর্কতা:** Publishable key browser-এ থাকা স্বাভাবিক। Database-এর নিরাপত্তা RLS policy দিয়ে নিয়ন্ত্রিত হয়। Service-role key না থাকায় server-side client-ও RLS bypass করে না।

#### কীভাবে যোগ করবেন (ধাপে ধাপে)
1. Cloudflare Dashboard → **Workers & Pages** → আপনার Worker সিলেক্ট করুন
2. **Settings** ট্যাব → **Variables and Secrets** সেকশনে যান
3. **Add variable** ক্লিক করুন
4. **Variable name** এ উপরের নাম (যেমন `SUPABASE_URL`) হুবহু বসান (বড়/ছোট হাতের মিল থাকতে হবে)
5. **Type** হিসেবে ৬টি variable-এর জন্য **Plaintext** বেছে নিন
6. **Value** বসিয়ে **Deploy / Save** করুন
7. সবগুলো যোগ হওয়ার পর Worker টা একবার রিডিপ্লয় (`wrangler deploy`) করুন, যাতে নতুন ভ্যারিয়েবলগুলো কার্যকর হয়

#### বিল্ড টাইম বনাম রানটাইম — খেয়াল রাখুন
- **বিল্ড টাইম:** `VITE_`-এর ৩টি variable browser bundle-এ ব্যবহৃত হয়। Cloudflare build/deploy-এর আগে এগুলোর সঠিক value দিতে হবে।
- **রানটাইম:** `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` এবং `SUPABASE_PROJECT_ID` Worker environment থেকে server code-এ ব্যবহৃত হয়।
- **Facebook CAPI:** service-role key না দিলে এই optional server-side tracking বন্ধ থাকবে; store/order/auth কাজ বন্ধ হবে না। CAPI বাধ্যতামূলক হলে আলাদা secret এবং RLS-bypass backend দরকার হবে।

### কাস্টম ডোমেইন
Cloudflare Dashboard → Workers → আপনার worker → **Settings → Domains & Routes** → **Add Custom Domain** (ডোমেইন Cloudflare-এ থাকলে ১ ক্লিকেই হয়)

---

## ধাপ ৭: প্রথম অ্যাডমিন তৈরি

1. লাইভ সাইটে যান → `/auth` → রেজিস্টার করুন
2. লগইনের পর ব্রাউজারের কনসোল বা অ্যাডমিন লিংকে গেলে `claim_admin()` স্বয়ংক্রিয়ভাবে প্রথম ইউজারকে অ্যাডমিন বানিয়ে দেবে (কোনো অ্যাডমিন না থাকলে প্রথম সাইন-ইন করা ইউজারই অ্যাডমিন পায়)
3. `/admin` → সেটিংস থেকে স্টোরের নাম, লোগো, রঙ, হিরো স্লাইডার — সব কাস্টমাইজ করুন

---

## প্রতি নতুন ক্লায়েন্টের চেকলিস্ট

| ধাপ | কাজ | সময় |
|---|---|---|
| ১ | নতুন Supabase প্রজেক্ট | ৩ মিনিট |
| ২ | `database-setup.sql` রান | ১ মিনিট |
| ৩ | Worker-এ ৬টি variable বসানো | ২ মিনিট |
| ৪ | `wrangler deploy` | ২ মিনিট |
| ৫ | ক্লায়েন্টকে `/auth` দিয়ে অ্যাডমিন বানাতে বলা | ২ মিনিট |

**মোট: ~১০ মিনিটে নতুন ক্লায়েন্টের স্টোর লাইভ।**

## গুরুত্বপূর্ণ নোট

- প্রতিটি ক্লায়েন্টের ডেটা সম্পূর্ণ আলাদা থাকে (আলাদা Supabase প্রজেক্ট) — একজনের অর্ডার/কাস্টমার অন্যজন দেখতে পায় না
- `database-setup.sql` শুধু একবার রান করতে হয় নতুন প্রজেক্টে; পুনরায় রান করলে ডুপ্লিকেট এরর আসতে পারে
- প্রথম sign-in করা user-এর admin claim database-এর `claim_admin()` RPC দিয়ে হয়, তাই service-role key লাগে না
- ডেমো প্রোডাক্টের ছবি নেই — অ্যাডমিন প্যানেল থেকে ক্লায়েন্ট নিজের ছবি আপলোড করবে
