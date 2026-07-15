# Legitimate Interests Assessment: Storage-Notice Acknowledgements

Last reviewed: 2026-07-15

## Purpose and interest

SIA HA Group keeps a short-lived record that a visitor acknowledged the website's notice about strictly necessary browser storage. The purpose is to demonstrate transparent notice delivery and diagnose whether the acknowledgement mechanism is operating, without treating the action as consent to optional storage.

The proposed legal basis is SIA HA Group's legitimate interest under Article 6(1)(f) GDPR in maintaining a proportionate compliance record for its public website.

## Necessity

A local browser value alone can prevent the notice from reappearing, but it cannot confirm that the acknowledgement workflow successfully reached the backend. A limited server record is therefore useful for the stated accountability purpose. The record is not used to identify a person, track repeat visits, analyse behaviour, advertise, or profile.

## Impact on visitors

The Firestore record contains only:

- record type;
- necessary-storage choice;
- notice version;
- interface language;
- server creation time; and
- expiry time.

It does not contain a name, email address, user agent, page URL, or persistent visitor identifier. A random Firestore document ID is stored only in the visitor's browser as a receipt. Firebase and hosting providers may process ordinary connection data as described in the Privacy Policy.

## Safeguards

- The banner calls the action an acknowledgement, not consent.
- No optional analytics, advertising, social-media, or tracking storage is activated.
- Firestore security rules permit validated creation only and deny public reads, updates, and deletes.
- Extra fields, including visitor identifiers, are rejected by the rules.
- Records carry a maximum 12-month expiry and the `expiresAt` field is configured for Firestore TTL deletion.
- The public Privacy and Cookie Policies disclose the record, purpose, legal basis, recipients, fields, and retention period.
- Visitors may exercise GDPR rights or object by contacting info@hagroup.lv. The locally stored Firestore document ID can help identify the relevant record.

## Balance and conclusion

Given the narrow purpose, minimal data, absence of behavioural tracking, short retention period, and technical safeguards, the impact on visitors is limited and is not considered to override SIA HA Group's stated legitimate interest. This assessment must be reviewed if optional cookies, analytics, advertising, additional record fields, a persistent visitor identifier, or a longer retention period are introduced.
