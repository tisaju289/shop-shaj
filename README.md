# Shop Shaj

Build a complete, production-ready, modern and highly professional Bangladeshi clothing e-commerce website template that can be reused and sold to multiple different clients.

The entire website must be designed primarily for Bangladeshi local customers.

IMPORTANT:

The entire customer-facing website UI must be in Bangla.

Use Hind Siliguri as the primary font throughout the entire website.

The design must feel premium, elegant, modern, trustworthy and suitable for a professional Bangladeshi fashion/clothing brand.

The website must be fully responsive for desktop, tablet and mobile.

The system must be built with a clean, scalable and reusable architecture.

Do not hardcode products, categories, banners, texts, prices or business information.

Everything that can reasonably be changed by a client must be manageable from the admin panel.

Use Supabase as the backend/database/auth/storage solution.

The frontend/application should be designed so that the same codebase can be deployed for different clients while each client can connect it to their own separate Supabase project/database.

Never mix data between different client Supabase projects.

Keep Supabase configuration/environment variables isolated and easy to replace for each deployment.

==================================================

TECHNOLOGY & ARCHITECTURE
==================================================

Use a modern production-ready stack:

React

TypeScript

Vite

Tailwind CSS

shadcn/ui where appropriate

Supabase

React Router

Proper reusable components

Clean component architecture

Responsive design

Optimized image loading

Proper loading, empty and error states

SEO-friendly page structure

Use a modular architecture so the same project can easily be customized for different clothing businesses.

Create a centralized configuration system for:

Store name

Logo

Favicon

Phone number

WhatsApp number

Email

Address

Facebook URL

Instagram URL

TikTok URL

Theme colors

Currency

Delivery charge

Free delivery threshold

Footer information

Social links

Hero slider content

Homepage sections

Promotional banners

Do not hardcode these values in UI components.

==================================================
2. CUSTOMER WEBSITE PAGES

Create the following main pages:

Home

Shop

Category

Product Details

Search Results

Cart

Checkout

Order Success

About Us

Contact Us

Privacy Policy

Terms & Conditions

Return & Refund Policy

The navigation should be simple and professional.

Header should contain:

Logo

হোম

শপ

ক্যাটাগরি

অফার

আমাদের সম্পর্কে

যোগাযোগ

Search icon

Wishlist icon

Cart icon

Mobile menu

Use a sticky header on desktop/mobile where appropriate.

==================================================
3. HOMEPAGE

Create a visually impressive homepage.

Section order:

A. Hero Slider

Create a large premium hero slider.

Each slide should support:

Large fashion model image

Bangladeshi/local fashion aesthetic

Clothing product/model photography

Small subtitle

Main Bangla heading

Short description

CTA button

Optional secondary CTA

Custom background image

Custom overlay

Active/inactive state

Sort order

Example CTA:

"এখনই শপ করুন"

The hero should look like a premium fashion brand website.

Use smooth transitions and subtle animations.

Do NOT generate random fake model images yourself. Build the UI so admin can upload hero images from Supabase Storage.

B. Category Section

Create a beautiful category grid.

Example categories:

শাড়ি

থ্রি-পিস

কুর্তি

কামিজ

টপস

বটমস

হিজাব

নতুন কালেকশন

But these must be dynamic from database.

Each category should support:

Name

Slug

Image

Description

Status

Sort order

C. Best Selling Products

Create a premium product carousel/grid.

Show:

Product image

Product name

Regular price

Sale price

Discount percentage

Rating

Review count

Wishlist button

Quick view

Add to cart

Best selling products should be determined dynamically from order/product sales data.

D. Trending Products

Create another visually different product section.

Trending products should be dynamically manageable from admin.

E. Promotional Offer Carousel

Create a full-width promotional banner carousel.

Each banner should support:

Desktop image

Mobile image

Title

Subtitle

CTA text

CTA URL

Start date

End date

Active status

Sort order

F. Hot Products

Create another product section for manually selected "হট প্রোডাক্ট".

G. Newsletter / Customer CTA

Create a clean CTA section encouraging customers to follow/subscribe.

H. Footer

Professional multi-column footer containing:

Store information

Quick links

Customer service

Categories

Contact information

Social media

Payment methods

Copyright

==================================================
4. SHOP PAGE

Create a professional e-commerce shop page.

Features:

Product grid

Category filter

Price range filter

Size filter

Color filter

Availability filter

Sorting

Search

Pagination or infinite scroll

Mobile filter drawer

Product count

Clear filters

Sorting options:

নতুন

জনপ্রিয়

কম দাম থেকে বেশি

বেশি দাম থেকে কম

সর্বাধিক বিক্রিত

সর্বাধিক রেটিং

Make all filters functional using Supabase data.

==================================================
5. CATEGORY PAGE

Create dynamic category pages.

Example:

/category/saree
/category/three-piece
/category/kurti

Each category page should include:

Category banner

Category name

Category description

Product count

Filters

Sorting

Product grid

Category pages must be generated dynamically from database categories.

==================================================
6. PRODUCT DETAILS PAGE

Create a premium product details page.

Include:

Multiple product images

Image gallery

Zoom

Product name

SKU

Price

Sale price

Discount

Availability

Size selection

Color selection

Quantity selector

Add to cart

Buy now

Wishlist

Product description

Specifications

Delivery information

Return policy

Reviews

Related products

Recently viewed products

Product variants must be supported.

Each product can have:

Multiple sizes

Multiple colors

Different stock quantities

Optional different prices

Variant-specific images

==================================================
7. CART SYSTEM

Create a fully functional shopping cart.

Features:

Add product

Remove product

Update quantity

Variant selection

Product subtotal

Delivery charge

Discount

Coupon

Grand total

Persist cart appropriately for guest users.

==================================================
8. CHECKOUT

Build a simple Bangladeshi-friendly checkout.

Fields:

নাম

মোবাইল নম্বর

বিকল্প মোবাইল নম্বর

সম্পূর্ণ ঠিকানা

বিভাগ

জেলা

থানা/উপজেলা

নোট

Delivery options:

ঢাকার ভিতরে

ঢাকার বাইরে

Payment method initially:

Cash on Delivery

Design the checkout to make it easy to add future payment gateways such as:

bKash

Nagad

Rocket

SSLCommerz

Do not hardcode payment gateway credentials.

==================================================
9. ORDER SYSTEM

Create database-backed order management.

Order should store:

Order ID

Customer information

Products

Variants

Quantity

Subtotal

Delivery charge

Discount

Total

Payment method

Payment status

Order status

Shipping address

Customer note

Created date

Order statuses:

নতুন অর্ডার

নিশ্চিত করা হয়েছে

প্রসেসিং

প্যাকেজিং

পাঠানো হয়েছে

ডেলিভারি সম্পন্ন

বাতিল

রিটার্ন

==================================================
10. ADMIN PANEL

This is one of the most important parts.

Create a complete professional admin dashboard.

Admin routes should be protected.

Dashboard should show:

মোট বিক্রয়

মোট অর্ডার

নতুন অর্ডার

মোট পণ্য

কম স্টকের পণ্য

মোট কাস্টমার

আজকের বিক্রয়

এই মাসের বিক্রয়

Recent orders

Best selling products

Sales chart

Order status chart

==================================================
11. ADMIN PRODUCT MANAGEMENT

Admin must be able to:

Add product

Edit product

Delete product

Duplicate product

Publish/unpublish

Manage stock

Manage SKU

Manage price

Manage sale price

Manage discount

Manage product images

Manage sizes

Manage colors

Manage variants

Manage categories

Manage tags

Set featured product

Set best selling

Set trending

Set hot product

Image upload must use Supabase Storage.

Support multiple images per product.

==================================================
12. ADMIN CATEGORY MANAGEMENT

Admin can:

Create category

Edit category

Delete category

Upload category image

Set category description

Set status

Change ordering

Create parent/child categories if needed

==================================================
13. ADMIN ORDER MANAGEMENT

Create a complete order management interface.

Admin can:

View orders

Search orders

Filter orders

View order details

Change order status

Change payment status

Update customer information

Add internal note

Print/download invoice

Cancel order

Create a professional Bangla invoice layout.

==================================================
14. ADMIN CUSTOMER MANAGEMENT

Admin can:

View customers

Search customers

View customer order history

View total spending

View order count

View customer information

==================================================
15. ADMIN HERO SLIDER MANAGEMENT

Admin can:

Add slider

Upload desktop image

Upload mobile image

Add heading

Add subtitle

Add description

Add button text

Add button URL

Enable/disable

Reorder slides

==================================================
16. ADMIN PROMOTIONAL BANNER MANAGEMENT

Admin can manage promotional carousel banners.

Fields:

Banner image

Mobile image

Title

Subtitle

Button

Link

Start date

End date

Active status

Sort order

==================================================
17. HOMEPAGE CUSTOMIZATION

Make the homepage highly customizable.

Admin should be able to control:

Section visibility

Section ordering

Section titles

Section subtitles

Number of products

Selected products

Selected categories

Hero slider

Promotional banners

For example:

Best Selling section:
ON/OFF

Trending section:
ON/OFF

Hot Products:
ON/OFF

Offer Banner:
ON/OFF

Allow drag-and-drop ordering if practical.

==================================================
18. COUPON & DISCOUNT SYSTEM

Create coupon management.

Admin can create:

Coupon code

Percentage discount

Fixed discount

Minimum order amount

Maximum discount

Usage limit

Start date

Expiry date

Active/inactive

Coupon validation must happen securely on the backend/database side.

==================================================
19. INVENTORY MANAGEMENT

Create stock management.

Features:

Product stock

Variant stock

Low stock warning

Out of stock status

Stock adjustment

Inventory history if practical

Prevent customers from ordering unavailable quantities.

==================================================
20. STORE SETTINGS

Create a complete settings section.

Admin can change:

GENERAL:

Store name

Logo

Favicon

Contact information

Address

SOCIAL:

Facebook

Instagram

TikTok

YouTube

WhatsApp

DELIVERY:

Dhaka delivery charge

Outside Dhaka delivery charge

Free delivery threshold

ORDER:

Minimum order amount

COD availability

SEO:

Meta title

Meta description

Open Graph image

Google verification code

FOOTER:

Footer text

Copyright text

Footer links

THEME:

Primary color

Secondary color

Button style

Border radius

Light/dark branding options if useful

==================================================
21. MULTI-CLIENT / REUSABLE ARCHITECTURE

This website is intended to be sold to many different clothing businesses.

IMPORTANT ARCHITECTURAL REQUIREMENT:

There should be ONE reusable frontend codebase.

Each client will have:

Their own Supabase project

Their own Supabase database

Their own Supabase Storage

Their own admin users

Their own products

Their own orders

Their own customers

Their own settings

The frontend should not assume a specific client's data.

Use environment variables for Supabase:

VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY

Create a clean Supabase client configuration layer so these values can easily be replaced for each deployment.

Do not hardcode Supabase project URLs or keys.

The application must function independently when connected to another Supabase project with the same database schema.

Create proper SQL migrations/schema for all required tables.

==================================================
22. DATABASE DESIGN

Design a clean relational Supabase database.

Suggested tables:

profiles

products

product_images

product_variants

categories

product_categories

orders

order_items

customers

coupons

coupon_usage

hero_slides

promotional_banners

homepage_sections

reviews

wishlist

store_settings

inventory_transactions

Use UUID primary keys.

Add:

created_at

updated_at

where appropriate.

Create appropriate indexes.

Use foreign keys correctly.

==================================================
23. SUPABASE SECURITY

Implement proper Row Level Security.

Requirements:

Customers should not be able to access other customers' private information.

Customers should not be able to modify products.

Customers should not be able to modify orders belonging to others.

Admin routes must be protected.

Admin operations must require authenticated admin users.

Sensitive operations must be secured using Supabase policies.

Never expose service-role keys in frontend code.

Use only the Supabase anon/public key on the client.

Validate important business logic securely.

==================================================
24. ADMIN AUTHENTICATION

Create secure admin authentication.

Admin login:

Email

Password

Include:

Login

Logout

Forgot password

Protected admin routes

Session persistence

Only authorized admin users should access the admin dashboard.

==================================================
25. IMAGE MANAGEMENT

Use Supabase Storage.

Create organized storage buckets/folders for:

products

categories

hero

banners

store

Provide image preview before upload.

Optimize images where possible.

Use lazy loading on customer-facing product images.

==================================================
26. UI/UX DESIGN

Design language:

Premium Bangladeshi fashion

Minimal

Elegant

Clean

Modern

High-end

Trustworthy

Conversion-focused

Avoid:

Generic template appearance

Excessive gradients

Excessive animations

Cluttered layouts

Tiny typography

Poor spacing

Overly colorful UI

Use generous whitespace.

Use elegant cards.

Use subtle hover effects.

Use smooth but restrained animations.

All UI text should be in natural Bangla.

Use Bangla numerals only if appropriate; otherwise standard Arabic numerals are acceptable for prices and product data.

==================================================
27. HIND SILIGURI FONT

Use Hind Siliguri throughout the entire website.

Make sure:

Headings use Hind Siliguri

Body text uses Hind Siliguri

Buttons use Hind Siliguri

Navigation uses Hind Siliguri

Admin panel uses Hind Siliguri

Forms use Hind Siliguri

Typography must look natural and polished for Bangla users.

==================================================
28. MOBILE EXPERIENCE

The mobile experience is extremely important.

Optimize for Bangladeshi mobile shoppers.

Mobile homepage should include:

Compact header

Search

Mobile navigation

Hero slider

Horizontal category scroll

Horizontal product carousel

Promotional banners

Sticky cart/action where appropriate

Make sure product cards work beautifully on small screens.

Checkout should be extremely easy on mobile.

==================================================
29. PERFORMANCE

Optimize for fast loading.

Implement:

Lazy loading

Responsive images

Code splitting where appropriate

Efficient Supabase queries

Pagination

Avoid unnecessary database requests

Skeleton loaders

Proper caching where appropriate

Do not load hundreds of products at once.

==================================================
30. ERROR / EMPTY / LOADING STATES

Every dynamic section should have proper states.

Examples:

Loading skeleton

No products found

No categories

Empty cart

Product unavailable

Network error

Order submission error

Image loading fallback

Use friendly Bangla messages.

==================================================
31. SEARCH

Create a global product search.

Search by:

Product name

SKU

Category

Tags

Create a professional search experience with:

Search suggestions

Recent searches where appropriate

Search result page

No result state

==================================================
32. SEO

Implement SEO-friendly structure.

Each product/category page should dynamically generate:

Page title

Meta description

Canonical URL

Open Graph metadata

Use clean URLs:

/shop
/category/:slug
/product/:slug

==================================================
33. DATA-DRIVEN FRONTEND

VERY IMPORTANT:

The customer-facing website should always read data from Supabase.

Do NOT create fake hardcoded product arrays as the actual source of truth.

Use realistic placeholder/demo data only if necessary during development, but structure the application around database-driven data.

Every major homepage section must be connected to the database/admin settings.

==================================================
34. REUSABLE COMPONENTS

Create reusable components such as:

Header

Footer

ProductCard

ProductGrid

ProductCarousel

CategoryCard

HeroSlider

PromoBanner

SearchBar

FilterSidebar

MobileFilter

PriceDisplay

RatingStars

WishlistButton

CartDrawer

QuantitySelector

CheckoutForm

OrderSummary

AdminSidebar

AdminHeader

DataTable

ImageUploader

RichTextEditor

ConfirmDialog

LoadingSkeleton

Avoid duplicating UI logic.

==================================================
35. ADMIN DASHBOARD DESIGN

The admin panel should look like a modern SaaS dashboard.

Include:

Sidebar navigation

Top header

Breadcrumbs

Dashboard cards

Tables

Charts

Forms

Tabs

Modals

Toast notifications

Confirmation dialogs

Admin navigation:

ড্যাশবোর্ড
অর্ডার
পণ্য
ক্যাটাগরি
কাস্টমার
কুপন
ইনভেন্টরি
হোমপেজ
স্লাইডার
অফার ব্যানার
রিভিউ
সেটিংস

==================================================
36. ADMIN CRUD

All major resources should have complete CRUD functionality.

Create:
Read:
Update:
Delete:

for:

Products

Categories

Orders

Customers where appropriate

Coupons

Hero slides

Promotional banners

Homepage sections

Store settings

Reviews

Use confirmation dialogs for destructive actions.

==================================================
37. SAMPLE CONTENT

Create initial demo content only for development/testing.

Use Bangladeshi-style product names such as:

এলিগেন্ট কটন থ্রি-পিস

প্রিমিয়াম জর্জেট শাড়ি

এমব্রয়ডারি কুর্তি

সিল্ক ফিউশন কামিজ

ক্যাজুয়াল লেডিস টপ

Use BDT currency:

৳

Use realistic Bangladeshi delivery examples.

But ensure all demo data can be deleted/replaced from admin.

==================================================
38. FINAL QUALITY REQUIREMENT

The final result should NOT look like a simple demo website.

It should look like a real, premium Bangladeshi fashion e-commerce platform that could be given to a paying client.

Prioritize:

Beautiful visual design

Excellent Bangla typography

Mobile responsiveness

Functional e-commerce flow

Fully dynamic Supabase data

Powerful admin panel

Reusable architecture

Easy client customization

Secure database policies

Clean maintainable code

Before finishing, verify that:

Customer website works

Admin login works

Product CRUD works

Category CRUD works

Hero slider works

Banner management works

Homepage sections are dynamic

Cart works

Checkout works

Orders are stored in Supabase

Admin can update order status

Product stock works

Images upload to Supabase Storage

Store settings work

Responsive design works

All visible UI text is in Bangla

Hind Siliguri is used globally

No Supabase service-role key is exposed

No critical business data is hardcoded

The project can be connected to another Supabase project simply by changing environment variables and applying the same database schema

Also provide the required Supabase SQL schema/migrations and clearly organize the code so another developer can deploy this same application for a new clothing client with a fresh Supabase project.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4e17ed21-fa8e-4673-93ce-01ad4c130e96).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
