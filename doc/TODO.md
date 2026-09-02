# Later:


# TODO:
- create hagroup.lv
- move folders under hagroup

# NOTE
This file is a byte-for-byte duplicate of alwaysup/doc/TODO.md, and the two
repos' `todo.md` files are duplicates of each other too. They describe two
different sites backed by two different Firebase projects (hagroup-47ebc and
cloudie-7b8b4), so keeping them identical guarantees at least one of them is
describing the wrong system. Worth splitting.

The "improve design" line is done — see the design entries under Done.


# Verify:
- ensure email form works
  Code path hardened end to end (see Done). Still needs a human in the console,
  because nothing in .github deploys rules or functions — they only ship by hand:
    1. `gcloud firestore databases list --project cloudie-7b8b4` — the function
       is pinned to europe-north1 and a v2 Firestore trigger must sit in a region
       compatible with the database. If they disagree the deploy is accepted,
       documents are written, and no function ever runs. This is the most likely
       cause of "no email arrives".
    2. `firebase deploy --only firestore:rules,storage,functions --project cloudie-7b8b4`
    3. `firebase functions:secrets:set NOTIFY_EMAIL` → info@hagroup.lv (new;
       without it notifications go to the sending Gmail account itself).
    4. Re-check GMAIL_APP_PASSWORD: the local copy is 19 characters, i.e. a
       16-char password with Google's three display spaces still in it. The
       function now strips whitespace, so this is belt and braces.


# Done:
- [x] contact email is info@hagroup.lv, and Privacy §15 renders it (the live site
      still showed hello@alwaysup.lv; source had dropped the address entirely)
- [x] contact form: distinct failure states instead of one generic red banner —
      invalid email, rate-limited, Firebase unconfigured and generic error each
      have their own copy in LV/EN/RU
- [x] contact form: 15s timeout on the Firestore write. A write promise does not
      reject when the backend is unreachable, so the button sat on "Sending…"
      forever showing neither banner
- [x] contact form: 60s client cooldown (lib/rateLimit.ts, ported from the archive
      site, where it already existed)
- [x] contact form: real email validation and maxLength on every field, mirroring
      the Firestore rules so the UI and the rules cannot disagree
- [x] contact form: the typed message survives a failed send instead of being
      cleared
- [x] firebase.ts: fails loudly and offers the phone fallback when the build had
      no VITE_FIREBASE_* config, instead of shipping `undefined` and hanging
- [x] SECURITY: notification emails escape every submitted value. They were
      interpolated raw, so a submitter could put arbitrary HTML — a phishing
      anchor wearing our own From address — straight into the owner's inbox
- [x] SECURITY: uploaded CVs are no longer world-readable. storage.rules had
      `allow read: if true` on /careers/{fileName}; the emailed download URL
      still works, because its token is honoured independently of the rules
- [x] SECURITY: stopped logging the Gmail app password's length on every submit
- [x] SECURITY: consents is create-only and append-only. It allowed unauthenticated
      update on a client-chosen document id, so anyone could overwrite anyone
      else's consent record by guessing an id
- [x] rules: field-count caps and size limits on every optional field that reaches
      the notification email
- [x] cookie banner: was hardcoded English on a Latvian-first site; now LV/EN/RU
- [x] doc/firebase.md no longer pastes a stale, more permissive copy of the rules
- remove social icons from bottom
- remove phone number from bottom footer under SIA HA Group
- small businesses -> businesses
- remove section: Simple, transparent pricing (Packages)
- replace Easy to update → Analytics Ready in Everything your website needs
- remove: 100+ Websites built
- remove the email address: hello@alwaysup.lv (from Contact + all legal pages)
- introduce lang support (LV, ENG, RU)
