# Communications toolkit audit and client handover

Audit date: 6 October 2026. Updated 13 October 2026 with the resources the client supplied, and 20 October 2026 with the Amazon sponsorship guidelines and photography brief. Route: `/communications`.

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
| Story submission destination | `stories@worldcodingcup.com`, forwarding to Wendy. Mailbox not yet created | Since 20 October the Share button opens the interim Google Form (see Story submissions). The form tells schools they can email photographs to this address |
| Amazon sponsorship guidelines | Supplied 15 October 2026 (Google Doc “Sponsored by Amazon guidelines”) | Published in full as the `#sponsor-guidelines` section. See the 20 October update |
| Photography brief (5 November) | Supplied in the same Google Doc | Replaces the prototype photography lists in the `#photography` section |
| Approved Amazon hashtag | Not supplied. The guidelines require the words “sponsored by Amazon” but name no hashtag | `[APPROVED AMAZON HASHTAG]` retained in social captions |
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
- **Still outstanding:** the approved Amazon hashtag (or confirmation that there is none), standalone Sponsored by Amazon artwork, and final copy approval. The sponsor guide was supplied on 15 October.

### Story submissions

**Interim Google Form (20 October 2026).** Wendy chose a Google Form until the Zoho CRM is ready (ClickUp task `869fcf82m`). The “Share your World Coding Cup story” button opens it in a new tab.

| | |
| --- | --- |
| Public link | https://docs.google.com/forms/d/e/1FAIpQLSeEtzf4J_kSlRqQkJMl3_IffBBeJ1V5f97WolrpVRE1l3UOmg/viewform |
| Editor | https://docs.google.com/forms/d/1XvJ4mCwNv6fXujUAoE5Nuptk7AA5CvyULXoTFJoJZtc/edit |
| Owner | 11and1design@gmail.com. Not yet shared with anyone |
| Responses | “World Coding Cup 2026 story submissions (Responses)” sheet: https://docs.google.com/spreadsheets/d/1uyxSoAgTiTlKxaFtCnoY6l8NKhEE7wHazaR2x5nR1-0/edit |
| Specification | `scripts/create-story-form.gs`: 6 sections and 23 questions. The 2026 form was built in the editor to the same spec |

**Settings**

- **Sign-in:** none required. There is no file-upload question, because one would force respondents to sign in to Google. Schools share photo and video links instead, or email photographs to `stories@worldcodingcup.com`.
- **Email and copies:** respondents type their email address and always receive a copy of their answers.
- **Progress:** a progress bar is shown.
- **After submitting:** the “submit another response” link is hidden, and the confirmation message is custom.
- **Validation:** learner, team and girls counts must be whole numbers.

**Content**

The form does not ask for learners' names or personal details, as the photography brief requires. The permission confirmation and “How may Tangible use your story and images?” questions are both required.

**Still to confirm with Wendy:**

- who else can see responses (her as an editor or a sheet viewer, and anyone else)
- the image-use option wording
- the privacy note “How we use your answers”
- a closing date
- whether the form should move to a LEVA-owned account later

Setting `storySubmissionFormUrl` to `null` makes the button fall back to the email described below.

**Email fallback.** `storySubmissionEmail` in `src/data/communications.ts` is `stories@worldcodingcup.com`. Without a form URL, the Share button opens an email with the subject “World Coding Cup story: [SCHOOL NAME]”. Its body lists fields that mirror the on-page checklist and asks for photographs as attachments, with videos and large files shared as links. On 20 October, at the user's request, the hint showing the address and the Copy email address button were removed. The button is now the only route to the address. A `mailto:` link does nothing on a computer without a default mail app, so those visitors cannot see where to send their story.

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

## 20 October 2026 update: sponsorship guidelines and photography brief

Source: the Google Doc [Sponsored by Amazon guidelines](https://docs.google.com/document/d/155JOfi4UGo9wtvavt_WsQTI1q2gYFg2CdAHxMSsr3fk/edit) (`155JOfi4UGo9wtvavt_WsQTI1q2gYFg2CdAHxMSsr3fk`), last modified 15 October 2026. It contains the partner sponsorship guidelines, a photography brief for 5 November 2026 and a support contact.

### Page changes

| Area | Change |
| --- | --- |
| Sponsor guide | The “Guide to be supplied” strip is gone. A new `#sponsor-guidelines` section follows the resource library. It has three cards (Using the logo, Acknowledging Amazon in writing, Keep the sponsorship connected to the tournament) with the doc's wording, including both example sentences. The resource library intro links to it |
| Support contact | Below the guidelines: “Have a question or need support?” with a `mailto:` link to Wendy van Eyck (`wendy@levafoundation.org`) |
| Hero and submission trims | At the user's request, the hero eyebrow “2026 · School communications toolkit”, the hero's “Share your story with Tangible” button, the story-email hint and the Copy email address action (with its script) were removed. The example sentences have no left border |
| Photography | The section is now “Photography brief · 5 November 2026”. The prototype's “Great photos show” and “Before you share” lists are replaced by the brief's three groups: The look and feel, The shots we need and Protecting children. The “Children's safety comes first” callout stays |
| Social template | The during-event caption now opens “We're live at the Tangible World Coding Cup 2026, sponsored by Amazon!”. The guidelines require the words in original social posts, and this was the only template without them |
| Media Tips template | Adds the guidelines' “Direct requests for Amazon quotes or statements to the Tangible team.” to the local-story guidance |
| Icons | Lucide `image`, `pen-line` and `link` added to `Icon.astro` for the guideline cards |

The other five templates already say “sponsored by Amazon” and are unchanged. The two amended templates no longer match their fingerprints in `_reference/communications-copy-audit.json`. That file remains the record of the prototype copy.

Wording that differs from the doc:

- The brief is addressed to the photographer, so the intro adds: “Share this brief with whoever is taking photographs on the day.”
- The doc's contact line also invites stories (“or have a story you'd like us to share”). The page drops that clause so that stories still go to `stories@worldcodingcup.com`, which forwards to Wendy anyway.
- The doc's “Exa[mples]” heading and “Some examples of the kind of pictures we're looking for” are unfinished. The doc contains no example images (its only image is the Tangible wordmark), so nothing was published for them.

### ClickUp task check

Task: [WCC Participation Page](https://app.clickup.com/t/869fcf801) (`869fcf801`, in progress, Client Review 1). The task has no checklist, attachments or subtasks. Its details are the description and Wendy's comments of 12–13 October. Checked 20 October 2026:

| Task detail | On the website | Result |
| --- | --- | --- |
| Logo pack folder | Logos ZIP | Drive folder unchanged: the same three files (12 Oct, 12 Oct, 24 Aug). All three are in the ZIP |
| Newsletter graphic | Newsletter JPG | Drive file last modified 25 August, 3,164,497 bytes, the same size as the published file |
| Social graphics: “It will have some more added this week” | Social ZIP | The folder still has the same six files (1 and 7 September). **No additional files were added** |
| Website graphics folder | Website ZIP | Unchanged: the same five files (21 August to 21 September) |
| `stories@worldcodingcup.com` forwarding to Wendy | Active `mailto:` button | Domain MX points to `mail.worldcodingcup.com`. The mailbox and forwarding were **not verified**: no email was sent |
| Wendy: how to comment on the page (Figma or screenshots?) | Not a page change | No reply in the thread |
| Description: list the UX gaps, and what is needed to make the page templatisable across tournaments | UX gaps are recorded in this handover | Written up on 20 October in the ClickUp doc [WCC communications toolkit: reusing it for future tournaments](https://app.clickup.com/2597132/docs/2f88c-128592) |

### Questions for Wendy

- **Sponsored by Amazon artwork:** the guidelines say to use “only the supplied Sponsored by Amazon artwork or official tournament templates”. The lockup appears inside the social graphics, but the downloads have no standalone version. Please supply one for the logo pack (colour and white, PNG and SVG), or confirm that schools should use only the templates. The Amazon files in the guidelines doc's Drive folder (`Amazon Logo`, `amazon_logo_aac049a5.zip`, `Amazon Programs Branding (2).pdf`) are Amazon's own brand assets, not the sponsorship lockup. They have not been published.
- **Hashtag:** the guidelines name no Amazon hashtag. Should the social captions drop `[APPROVED AMAZON HASHTAG]`?
- **Public email:** please confirm that `wendy@levafoundation.org` may be shown on the public toolkit page.
- **Example photographs:** supply the images for the brief's unfinished examples section if they should appear on the page.
- **Template wording:** please approve the two template amendments above.

### Verification

Checked in headless Chromium against the development server and the production preview (`output/playwright/toolkit/sponsor-guidelines-2026-10-20/qa.mjs`). All 39 checks passed on both:

- **Content:** the guideline and brief text is present. The `mailto:` link works. “Guide to be supplied” is gone.
- **Templates:** the Social and Media Tips modals open with the amended text. All 11 template buttons remain.
- **Layout:** no horizontal overflow or clipped text in either new section at 1440, 1024, 768, 390 and 320 px.
- **Errors:** no console or page errors.

The resource-library link lands 168 px below the top of the viewport, the same offset as the page's existing anchors.

The 13 October runner, adapted for the removed placeholder (`toolkit-qa-regression.mjs`), passed 60 of 63 checks. The three failures are the three buttons that open the deliberately amended Social (two buttons) and Media Tips templates. `npm run build` passes.

## 29 October 2026 update: Wendy's review of 21 October

Source: Wendy van Eyck's reply on ClickUp task `869fcf82m` (WCC Participation Page, interim submission form). She asked for no redesign: keep the visual style and layouts.

### Page changes

| Request | Change |
| --- | --- |
| Remove the duplicate ready-to-use copy section | The “Ready-to-use copy” card grid is gone. Its four cards opened the same templates as the Start here guide, which keeps all seven template buttons |
| Shorten the photography guidance | Same three groups and eight points, each cut to one or two sentences. The intro is one sentence plus the line asking schools to share the brief |
| Shorten the sponsorship guidance | Logo rules go from four to three. The writing card keeps one example sentence. The tournament card is two short paragraphs |
| Remove the WhatsApp CTA | `Footer` takes `whatsappCta={false}` on the toolkit, which hides the “Stay updated on our WhatsApp Channel” band there. The homepage keeps it. The small WhatsApp icon among the footer social links stays |
| Contact | The support line now points to `support@levafoundation.org` (“the Tangible team”) instead of Wendy |
| Hashtag | `#AmazonInCommunities` replaces `[APPROVED AMAZON HASHTAG]` in the before and after captions and is added to the during-event caption. The modal hint no longer mentions the placeholder |
| Canva templates | A separate “Personalise your own” strip below the downloads links to `https://canva.link/e0ils4wreth5tmo` (“Customise in Canva”, new tab). It is kept apart from the ready-made downloads |

Wording was shortened from Wendy's written instructions. Her annotated PDF was attached to the ClickUp comment and could not be retrieved, so any specific cuts it marks still need checking against the page.

### Still open

- **Sponsored by Amazon artwork:** Wendy will share approved versions for the logo pack.
- **Form access:** Michaela and Ryan to get the same access to the responses sheet as Wendy.
- **Form permissions wording and privacy note:** Wendy will review once she has access.
- **Closing date:** none. Submissions stay open after the tournament.
