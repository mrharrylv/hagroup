Agent mode instructions:
- Follow best practices
- Update docs
- Ensure lang support (i18n EN/LV/RU)
- Ensure data/json content and lang support
- Move completed TODO to TO TEST section
- Move confirmed [x] TO TEST items to COMPLETED

# TODO:
<!--Firebase Storage: Cannot be enabled via CLI. Must click "Get Started" in Firebase Console first. Steps below.-->
[] Firebase Storage: enable in console (https://console.firebase.google.com/project/cloudie-7b8b4/storage) for career CV uploads
    Steps:
    1. Go to https://console.firebase.google.com/project/cloudie-7b8b4/storage
    2. Click "Get Started" → choose "Start in production mode" → pick region (eur3 for EU) → Done I want o use FREE 
    but get error 
    An unknown error occurred. Please refresh the page and try again. 

    3. Run: `cd services/firebase && firebase deploy --only storage --project cloudie-7b8b4`
    4. Storage rules (storage.rules) are already written — allows career CV uploads (PDF/DOCX, <5MB)
    5. Code already links storage file to career_applications Firestore doc (CareerContact.tsx uploads CV, stores downloadURL)

# TO TEST: 
[] Reviews data disabled: emptied reviews.json to [] (backup in reviews.backup.json), added Review type + assertion in Reviews.tsx and ReviewsPage.tsx — homepage Reviews section hidden, /reviews page shows empty
[] DifficultContact disabled: added feature flag `FLAGS.difficultContact = false` in `src/lib/flags.ts` — hides toggle button and 3D-flip back-face in Contact. Set to `true` to re-enable.
[] DifficultContact buttons: replaced all emojis with Iconify icons (spin→refresh-circle, stop→stop-circle, result→check-circle, submit→arrow-right, badge→danger-triangle), removed 🔥 from separator
[] Blur removed: removed GradualBlur from Hero, GradualBlur from Contact, and viewport-fixed bottom blur from Layout
[] HorizontalCards: improved swap transition — spring cubic-bezier(0.22,1,0.36,1) 0.6s, active card lifts on swap, direction-aware animation
[] DifficultContact: removed overflow-y-auto scroll from back-face, compacted spacing (space-y-4, smaller headings/margins, 80px checkbox area)
[] DifficultContact separator: added 🔥 hr divider above "Turn On Difficult Mode" toggle
[] Threads divider: increased height from h-32/h-48 to h-48/h-64/h-80 with wider spread (distance 0.35)
[] Hero blur at bottom of site: added GradualBlur (bottom, strength 3, 8rem, 6 layers) wrapping Contact section
[] Threads effect: increased amplitude from 0.8 → 2.1, distance 0.3
[] Difficult mode contact: email corruption (periodic char swap every 3s), scrollable back-face for button overflow fix
[] Click spark: indigo spark lines on every click across the site (ClickSpark component wrapping Layout)
[] Gradual blur: bottom edge blur on Hero section (GradualBlur component, 6 layers, strength 3)
[] Services dropdown: card-nav style animated panel — scaleY + staggered slide-in for each service card
[] Footer logo: replaced img+white-box with SVG Logo component (same as header, currentColor adapts to dark/light)
[] Dark/light mode: smooth 300ms CSS transition on background-color, color, border-color, box-shadow, fill (no-transition on initial load)
[] Difficult mode contact: vertical 3D slot machine reel (150ms), solid dark bg on light-mode flip, 15s countdown submit delay confirm (EN/LV/RU), transparent checkbox border, reversed email, glow-delete textarea
[] Difficult mode contact form: 3D flip, inverted theme, hard-to-read name, mirrored company, double-char email, glow-red-delete details, bounded runaway checkbox, 6-digit rolling budget (EN/LV/RU)
[] Social links: temp data added in social.json (LinkedIn, Instagram, WhatsApp, email, phone)
[] Footer logo: white background box in dark mode for readability
[] TechStack light mode: removed glow effect, kept black text + scale on hover (glow only in dark mode)
[] Work section: fixed title to use titlePrefix + titleAccent ("Our Work" with indigo accent)
[] Contact form: deployed Firestore rules — form submissions should now work
[] Career form: removed email from error message in EN/LV/RU
[] Careers page: removed "We're Hiring" badge
[] Contact page: added scroll-to-top (footer link loads at top)
[] Company details: removed "Company" tag bubble, removed email section
[] Submit + WhatsApp buttons: shared via Contact component, made narrower (not full-width)
[] Header nav: Services + Our Work centered with flex-1 justify-center
[] Threads background: added WebGL Threads animation between Methodology and Work (indigo accent, ogl)
[] Colors: extracted all design tokens to src/lib/colors.ts with semantic names

# COMPLETED: 
[x] Powered by Industry Standards: icons/text at 70% default, glow to 100% + indigo drop-shadow on hover
[x] Comprehensive Solutions (Services): SpotlightCard radius reduced (700→400, 500→300) for tighter hover glow
[x] Service pages: hover effects on stats, features, process boxes, and technology tags
[x] Page transitions: smooth fade+slide on route change (PageTransition component)
[x] Projects page: clicking a project card opens its external URL in new tab
[x] About page: removed "Company" top icon, added hover effects on all cards (border glow, scale, shadow)
[x] Header: removed "Contact Us" nav link, Book Consultation button scrolls to /#contact, styled with indigo accent color
[x] Our Methodology - each Phase hover nice effect (glow, scale, brightness transitions)
[x] horizontal-card component, cards are no longer transparent (brightness filter + solid borders)
[x] ensure if there are no reviews in json, section is hidden
[x] make smaller gaps between sections (py-12 sm:py-16)
[x] make sections have clearer boundary (hr dividers, Work section border-y)
[x] Powered by Industry Standards hover - each tech lights up on hover, default greyed out
[x] Split About Us and Company Details into 2 separate pages (/about + /company-details)
[x] Careers form with Firebase (Firestore + Storage for CV uploads)
[x] HERO background create more intense effect (Antigravity: more particles, higher opacity, larger connections)
[x] creata a comonent called horizontal-cards and use it for both reviews and past projects. same, different content
    fix: 
        - cards are not transeprents
        - clicking on background cards will rotate it to front 
        - click on card will not open a page.  
        - update docs and code that there are no past project or review dedicated individual pages. only the ALL <> page. listing them in a different design
[x] When Services drowdown is open in header. add blur effect on the rest of the page
[x] for reviews use the same design as projects.
[x] the horizontal card swap in projects, remvoe th arrow to back and forward. 
[x] HERO add some nice effect. -> https://reactbits.dev/animations/antigravity
[x] Ready to Start Your Project?
    Join our growing list of satisfied clients. Let's discuss how we can help your business.
    -> use acent color for background of that box., this looks different color.
[x] Logo on header, logo is wrong, fix it.
[x] Client reviews and Past Projects - to use rotating horizontal card rotation THE ONE which was implemented for Industires! 
[x] Contact section should be same width as others. 

