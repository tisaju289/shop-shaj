# ট্র্যাকিং সেটিংস ট্যাব

## কী তৈরি হবে
- অ্যাডমিন সেটিংসে নতুন **ট্র্যাকিং** ট্যাব যোগ হবে।
- Facebook Pixel ID, Conversions API access token, test event code এবং GA4 Measurement ID সংরক্ষণ/চালু-বন্দ করার ব্যবস্থা থাকবে।
- গোপন CAPI token সাধারণ স্টোর সেটিংস বা ওয়েবসাইটে প্রকাশ হবে না; আলাদা সুরক্ষিত রেকর্ডে থাকবে এবং সংরক্ষণের পর masked অবস্থায় দেখা যাবে।
- সফল অর্ডারকে ডিফল্ট `Purchase` conversion ধরা হবে; browser Pixel ও CAPI একই event ID ব্যবহার করবে, যাতে Facebook দ্বিগুণ গণনা না করে। GA4-এও purchase পাঠানো হবে।
- প্রাইভেসি পাতায় সক্রিয় tracking provider ও ব্যবহারের উদ্দেশ্য সম্পর্কে স্বয়ংক্রিয় disclosure যোগ হবে।

## সম্মতি ও গোপনীয়তা
- প্রশ্নটি এড়িয়ে যাওয়ায় নিরাপদ default ব্যবহার হবে: consent-required বা অজানা অঞ্চলে কোনো Pixel, GA4 বা CAPI event পাঠানো হবে না; অন্য অঞ্চলে tracking চলবে।
- ইমেইল/ফোন customer matching পাঠানো হবে না। ভবিষ্যতে matching চাইলে আলাদা explicit advertising consent record প্রয়োজন হবে।

## কারিগরি বিবরণ
- Public IDs ও enable switches বিদ্যমান store settings-এ থাকবে। CAPI token admin-only `tracking_secrets`-এ থাকবে।
- Server-side purchase reporter order ID যাচাই করবে, provider error স্পষ্টভাবে ফেরত দেবে, এবং repeated submission আটকাতে idempotency record ব্যবহার করবে।
- Tracking loader একবারই script বসাবে, route/page view ও checkout/purchase events পাঠানোর helper দেবে।
- প্রয়োজনীয় database migration, RLS/GRANT, admin UI, storefront wiring, privacy disclosure এবং responsive validation একসাথে করা হবে।
