# Communications toolkit audit and client handover

Audit date: 6 October 2026. Route: `/communications`.

## Reference and copy corrections

The [published prototype](https://salad-adobe-26973888.figma.site) and the original Figma Make preview contain the same seven modal bodies. `_reference/communications-copy-audit.json` records the independently captured body text, titles, categories, instructions and fingerprints. The implementation in `src/data/communications.ts` was compared with that record in the browser, including the actual clipboard contents.

The previous implementation had abbreviated, generic text in six templates. All six have been replaced with the complete prototype copy. The missing Media Tips flow has also been added.

| Flow | Corrected content |
| --- | --- |
| Parents | Complete post-event WhatsApp/parent email message, greeting, school/location placeholders, sponsor paragraph and hashtags |
| Newsletter | Full article, school and learner counts, quote/moment placeholder, sponsor and programme attribution |
| Social media | Complete before, during and after captions, including the unresolved approved Amazon hashtag placeholder |
| Website | Full news article, team and result placeholders, organiser and sponsor attribution |
| Press release | Full announcement, local angle and quote, photograph consent statement, contact block and About section |
| Media email | Full subject, pitch, local angle, attachments, interview offer and contact details |
| Media tips | Local story guidance, publication categories, pitch advice and follow-up guidance |

The prototype's yellow placeholder highlighting has become plain bracketed text. Its authored message emojis remain part of the copied text; interface icons use SVGs. Card buttons have contextual accessible names. Actions that open an editable template say “Open…” in the quick guide so they describe what happens on click.

## UX and implementation fixes

- The toolkit imports the same Header and Footer as the homepage. Header section links return to the correct homepage section from this route.
- Hero, card, modal and migrated homepage CTAs use the shared Button component, with circular SVG icons. Copy uses a copy icon. Hover changes colour without moving the control or its icon.
- The hero uses the site's existing background pattern. The large closing statement has been reduced in size.
- The photographs use larger originals from the existing gallery, responsive Astro image outputs and their natural proportions. Captions sit outside the photographs.
- The shared TemplateDialog displays the correct title, category and editing guidance for each template. Text can be edited before copying.
- Modals are centred, the Copy button spans the content width, and long copy remains scrollable. The button remains visible across the tested viewport sizes.
- The modal supports close, Escape and backdrop dismissal, keeps Tab navigation within its controls, returns focus to its opener and prevents background scrolling.
- Successful copies announce feedback. Blank messages are prevented from replacing the clipboard. When clipboard access is rejected, the text is selected with instructions to use the device's Copy command.
- The omitted media guidance, photography checklist items and all nine story submission details have been restored.
- The old prototype `#downloads` anchor is supported alongside the page's `#resources` section.

## What the client must supply

These are resource categories, not known filenames. The prototype supplies no working asset destinations, so the original filenames cannot be identified. The four Download buttons and View sponsor guidelines button produced no visible action when checked. The local repository contains no matching downloadable toolkit ZIP/PDF packs.

| Required item | Files or information needed | Current page behaviour |
| --- | --- | --- |
| World Coding Cup logo pack | Approved full colour, mono and white logos, PNG + SVG in a ZIP, or a public download URL | “Files to be added” |
| Social media graphics | Approved square and story PNGs in a ZIP, or public download URLs | “Files to be added” |
| Newsletter graphic | Approved header PNG or its public URL | “Files to be added” |
| Website graphics | Approved banner and inline PNGs or their public URLs | “Files to be added” |
| Amazon sponsor attribution guide | Final PDF/public URL covering approved wording, logo usage and sponsorship guidance | “Guide to be supplied” |
| Approved Amazon hashtag | Final hashtag to replace `[APPROVED AMAZON HASHTAG]` in social captions | Bracketed placeholder retained |
| Story submission destination | Confirmed monitored email address or live form URL, plus the person/team responsible for submissions | Disabled “Story submissions opening soon” action with an explanation |
| Final copy approval | Approval of the 2026 references, participation claims, programme name, sponsor statements and consent wording | Complete prototype wording retained |

If the client chooses a submission form, also supply the required fields, upload types/limits, permissions/consent wording, privacy destination and confirmation message. The prototype has no upload form or backend: its submission action is a `mailto:` link. A working mail link cannot provide upload validation, a receipt or guaranteed delivery.

### Email verification

`stories@worldcodingcup.com` comes directly from the prototype. It was not independently invented in the implementation. The domain currently publishes `10 mail.worldcodingcup.com.` as its MX record, but this establishes only a domain mail route. Mailbox existence, ownership, monitoring and delivery remain unverified. No verification email was sent.

Until the client confirms the destination, `storySubmissionUrl` in `src/data/communications.ts` stays `null`. Once confirmed, set it to the approved HTTPS form URL or `mailto:` URL and verify that delivery/submission flow with the client.

### Content and launch decisions

- Most prototype templates describe an event that has already happened; only social media has all three timings. If schools need parent/newsletter/website announcements before race day, the client must supply approved additional versions.
- Bracketed school, city, date, results, quote and contact details are intentionally filled in by each school. Schools must confirm any photograph consent statements before using the text.
- The existing gallery photographs are now displayed at suitable resolutions. Confirm their reuse approval, or supply approved replacement event photographs.
- Confirm where the toolkit should be linked from the website or campaign. The current page retains the existing navigation requested by the user and is directly accessible at `/communications`.
- The inherited footer calls its destination a WhatsApp Channel, while the current destination responds as a Group Invite. Confirm the intended community URL with the client.

## Verification performed

The audit was run in Playwright Chromium against both the development page and the built production preview. The final production run checks the following:

| Check | Result |
| --- | --- |
| All 11 template entry buttons | Correct modal title, category, instructions, full body and actual clipboard content |
| All seven unique templates | Tested at 320×568, 390×844, 768×1024, 1024×768, 1440×960 and 844×390 |
| Modal geometry | Centred, no page overflow, full-width Copy button, accessible end of text |
| Clipboard | Complete source copy, edited copy, blank text handling and simulated permission rejection |
| Modal interactions | Close, Escape, backdrop, focus return, keyboard Tab containment and template reset on reopening |
| In-page actions | Both hero actions and the quick guide's submission jump reach the correct sections |
| Header navigation | All five section destinations exist on the homepage and are reached correctly |
| Mobile menu | Opens, closes with Escape and navigates to the homepage section |
| Shared layout | Header and Footer text match the homepage |
| Hover | Primary, teal, quiet and soft controls keep their icon positions |
| Photographs | All three load, expose responsive sources and retain their proportions |
| Resource/submission state | All five absent resource groups are labelled; unconfirmed story email is inactive |
| Homepage regression | Video opens/closes; Escape pauses and resets it |
| Production build | `npm run build` passes |
| Browser errors | No script or console errors in the final production audit |

Eleven unique existing external destinations responded with HTTP 200: Tangible home, Jotform registration, Google Calendar booking, Google Drive preparation PDF, Google Play, Apple App Store, Facebook, YouTube channel/video and the two WhatsApp invites. This confirms public responses, not successful registration, booking, membership, video playback or email delivery. No third-party forms were submitted and no groups were joined.

Screenshots and detailed audit output are available locally under `output/playwright/toolkit/` (ignored by Git), including `audit-4324.json`, `external-links.json`, `toolkit-final-desktop.png`, and the desktop/mobile modal screenshots. The browser runner is `output/playwright/toolkit/audit-browser.mjs`; run it from the project root with an optional preview origin argument.

Physical devices and Safari/Firefox were not exercised in this audit. Resource downloads and story delivery cannot be completed until the client supplies the files and confirms a destination.
