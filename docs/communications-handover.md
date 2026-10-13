# Communications toolkit audit and client handover

Audit date: 6 October 2026. Updated 13 October 2026 with the resources the client supplied. Route: `/communications`.

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
- As in the prototype, the hero shows the World Coding Cup logo above the eyebrow. It uses the shared `WccLogo` component, the same lockup as the homepage, exposed to assistive technology as “Tangible World Coding Cup”.
- The photographs use larger originals from the existing gallery, responsive Astro image outputs and their natural proportions. Captions sit outside the photographs.
- The shared TemplateDialog displays the correct title, category and editing guidance for each template. Text can be edited before copying.
- Modals are centred, the Copy button spans the content width, and long copy remains scrollable. The button remains visible across the tested viewport sizes.
- The modal supports close, Escape and backdrop dismissal, keeps Tab navigation within its controls, returns focus to its opener and prevents background scrolling.
- Successful copies announce feedback. Blank messages are prevented from replacing the clipboard. When clipboard access is rejected, the text is selected with instructions to use the device's Copy command.
- The omitted media guidance, photography checklist items and all nine story submission details have been restored.
- The old prototype `#downloads` anchor is supported alongside the page's `#resources` section.

## Client resources

Wendy van Eyck shared the logo pack, newsletter graphic, social graphics and website graphics through Google Drive on 12 October 2026, in comments on the ClickUp task “WCC Participation Page” (`869fcf801`). She also asked for `stories@worldcodingcup.com` to forward to her inbox; 11&1 is setting up that mailbox.

| Item | Status | Page behaviour |
| --- | --- | --- |
| World Coding Cup logo pack | Supplied, with gaps listed below | Download · ZIP · PNG + SVG |
| Social media graphics | Supplied. Wendy expects to add more files this week | Download · ZIP · JPG + PNG |
| Newsletter graphic | Supplied | Download · JPG |
| Website graphics | Supplied | Download · ZIP · PNG |
| Story submission destination | `stories@worldcodingcup.com`, forwarding to Wendy. Mailbox not yet created | Active `mailto:` button, visible address and Copy email address action |
| Amazon sponsor attribution guide | Not supplied | “Guide to be supplied” |
| Approved Amazon hashtag | Not supplied | `[APPROVED AMAZON HASHTAG]` retained in social captions |
| Final copy approval | Pending | Complete prototype wording retained |

The resource cards read each file's size at build time, so a missing download fails `npm run build`.

### Published downloads

Files are served from `public/downloads/`. Each ZIP contains one folder named after the ZIP, so extracting it does not scatter files. Inside, Wendy's working names were replaced with descriptive ones.

| Download | File | Drive source (file ID) | Processing |
| --- | --- | --- | --- |
| `world-coding-cup-logos.zip` | `world-coding-cup-logo-colour.png` (324×209) | `LOGO_WCC-01 Colour.png` (`1t_Q8GnV57oTy5FscjKQbc1mlWhkujHgo`) | Copied unchanged |
| | `world-coding-cup-logo-white.png` (2369×2369) | `LOGO_WCC-01_white.png` (`1zd4RKDYG97cjMijFcd1rCBdqtiM-B-bq`) | Copied unchanged |
| | `world-coding-cup-logo-white.svg` | `LOGO_WCC-01.svg` (`1Hc4FgY7Ykx3Sky2ttThsT5lGBJt1uCeU`) | “World Coding Cup” outlined; see below |
| `world-coding-cup-social-graphics.zip` | `world-coding-cup-social-landscape-learners.jpg` (1201×631) | `05 Amazon Socials-01.jpg` (`1gbZs9oNeS0qv53D8zyYyTFciZ5wPc6tj`) | Resized from 300 ppi; see below |
| | `world-coding-cup-social-portrait-learners.jpg` (1081×1351) | `05 Amazon Socials-02.jpg` (`1l1E4yOsVztPaQSCO5IZXubqxWOvv3DNN`) | Resized from 300 ppi |
| | `world-coding-cup-social-story-learners.jpg` (1081×1922) | `05 Amazon Socials-03.jpg` (`1yIVN4GBH2sCAtUy0z5uaDBwKy5XDTZ4Q`) | Resized from 300 ppi |
| | `world-coding-cup-social-story-racing.png` (1081×1921) | `05 Amazon Socials-04.png` (`1OtBBH1lrLvDx2GFyeSvombG6-aRwIK9L`) | Copied unchanged |
| | `world-coding-cup-social-portrait-cockpit.png` (1081×1351) | `05 Amazon Socials-05.png` (`1ahbANljb7Y2gCVkugKjg1A9uU2LT794M`) | Copied unchanged |
| | `world-coding-cup-social-landscape-racing.png` (1201×631) | `05 Amazon Socials-06.png` (`1xiQsoe7cKyJidN9txri8HadKfrpn2AfF`) | Copied unchanged |
| `world-coding-cup-newsletter-header.jpg` | — (5000×1832) | `01 WCC_Header_Email_20Aug26.jpg` (`1mtIBqVRtkX7fTlgG67LI84TXyriDrIns`) | Copied unchanged |
| `world-coding-cup-website-graphics.zip` | `world-coding-cup-website-banner.png` (1200×440) | `02 Screenshot_start.png` (`1swHEcaIeBQek1XEq76-ERmyQ3iPPbTDe`) | Copied unchanged |
| | `world-coding-cup-website-background.png` (2000×1024) | `02 backgroundImage.png` (`1Sdi6R2kyc9vjbcc5SwB6adlsQsR8QWMH`) | Copied unchanged |
| | `world-coding-cup-website-racing-cars.png` (887×765) | `02 Screenshot_cars.png` (`1Ins1wh8oYHGpj6NDO5djlXdLl2WzyBC3`) | Copied unchanged |
| | `world-coding-cup-website-cockpit.png` (886×778) | `02 Screenshot_racing.png` (`1euxdz7Cvm3ScggdEMyUlIFaoRRiwWG8i`) | Copied unchanged |
| | `world-coding-cup-website-speed-stars-game.png` (1080×1440) | `03 Speedstars game.png` (`1aKIz2lAhilMcWP_fCl2ZUhl9nPoK_GT8`) | Copied unchanged |

Drive folders: logo pack `1esu332P4zf4M9Y37WuhX7deYNieEA9HH`, social graphics `1rfQEWPTYqLJ6M13QE7usdt_8oWiJv0R3`, website graphics `1ZNhT2U3_fLuqfq1EBHR4pGpt4bfJ49zp`. All are shared as “anyone with the link can view”.

**Logo SVG.** The supplied SVG set “World Coding Cup” as live text in Super Deluxe Sans. On a computer without that font it rendered in a fallback serif, in mixed case. The published SVG keeps Wendy's paths for the mark and “TANGIBLE” unchanged. It replaces the live text with the outlined lettering already used in the homepage logo, at `translate(51.46 123.13)`. Rendered at 4×, it matches the font-rendered original apart from edge anti-aliasing: 0.12% of inked pixels differ.

**Social graphics 01–03.** These were exported at 300 ppi (5001×2626, 4501×5626 and 4501×8001; 14.3 MB together). Their racing counterparts were exported at screen size. They were resized with a Lanczos filter to the matching screen widths (1201, 1081 and 1081 px), kept sRGB and saved as quality-90 JPEGs with 4:4:4 chroma. This reduced the social pack from about 18 MB to 3.2 MB, which matters for schools on mobile data. The full-resolution originals remain in Drive.

### Updating the downloads

1. Download the new or replacement files from the Drive folders above.
2. Name them `world-coding-cup-<pack>-<format>-<subject>.<ext>` and place them in the pack folder (for example `world-coding-cup-social-graphics/`).
3. Export social graphics at screen size, not 300 ppi.
4. From the directory containing the pack folder, rebuild the ZIP without macOS metadata. For example: `zip -X -r -9 <project>/public/downloads/world-coding-cup-social-graphics.zip world-coding-cup-social-graphics`.
5. If formats change, update the card's `detail` and `format` text in `src/pages/communications.astro`. Sizes update automatically.

Keep every file under 25 MB, the per-file limit on some static hosts such as Cloudflare Pages.

### Gaps in the supplied files — questions for Wendy

- **Logo pack:** there is no mono version. The prototype card promised “full colour, mono and white versions”, so the card now says “Colour and white versions”. The only colour logo is a 324×209 PNG, which is too small for print or banners. Please supply a high-resolution colour PNG and an outlined colour SVG, plus a mono version if schools should have one.
- **Social graphics:** there is no square (1:1) format, so the card says “Landscape, portrait and story formats” rather than the prototype's “square and story formats”. Please export the additional files due this week at screen size.
- **Newsletter graphic:** this is a 5000×1832, 3.2 MB print-resolution JPG. It suits printed newsletters. A 1200 px-wide export would be lighter for email newsletters.
- **Website graphics:** these do not include the World Coding Cup logo or sponsor attribution. The Speed Stars mockups show Formula 1 and Pirelli marks inside the game. Please confirm that schools may republish these images on their own websites.
- **Still outstanding:** the Amazon sponsor attribution guide, the approved Amazon hashtag and final copy approval.

### Story submissions

`storySubmissionEmail` in `src/data/communications.ts` is `stories@worldcodingcup.com`. The Share button opens an email with the subject “World Coding Cup story: [SCHOOL NAME]”. Its body lists fields that mirror the on-page checklist and asks for photographs as attachments, with videos and large files shared as links. The address is also shown on the page with a Copy email address button, because `mailto:` links do nothing on computers without a default mail app. If the clipboard is unavailable, the button selects the address and explains how to copy it.

Before deploying:

- Create the mailbox or forwarding to Wendy's inbox.
- Use the live button to send one plain test email and one with about 10 MB of photographs. Confirm that both arrive.

Setting `storySubmissionEmail` to `null` restores the disabled “Story submissions opening soon” state.

A mail link still cannot validate uploads, confirm receipt or carry large videos. If the client later wants a form, they must supply the required fields, upload types and limits, consent wording, privacy destination and confirmation message.

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

Physical devices and Safari/Firefox were not exercised in this audit.

### 13 October 2026 update

The client-resources update was checked in headless Chromium against both the development server and the production preview. All 63 checks passed in each, with no page or console errors.

| Check | Result |
| --- | --- |
| Downloads | All four links return the files in `public/downloads/` byte for byte, carry a `download` attribute and download under the expected filenames |
| Card labels | Format and size labels and accessible names (for example “Download World Coding Cup logos (ZIP, 72 KB)”) match the files |
| Placeholders | “Files to be added” and the “being prepared” note are gone. The sponsor guide is still marked “Guide to be supplied” |
| ZIP integrity | `unzip -t` passes for all three packs. Each contains a single folder and no macOS metadata |
| Story email | The `mailto:` targets `stories@worldcodingcup.com` with the expected subject and CRLF-separated body. The disabled state is gone |
| Copy email address | Copies the address. A rejected clipboard selects the address and shows instructions in a status region |
| Hero logo | Exposed once as an image named “Tangible World Coding Cup” |
| Homepage | Logo markup is structurally identical after the `WccLogo` refactor: same paths, still decorative, same reveal hook and 320 px width at 1440 px |
| Templates | All 11 template buttons still open the audited copy |
| Layout | No horizontal overflow or clipped resource/submission content at 1440, 1024, 768, 390 and 320 px |
| Build | `npm run build` passes |

No email was sent to `stories@worldcodingcup.com`, because the mailbox does not exist yet. Delivery must be tested once it is set up.
