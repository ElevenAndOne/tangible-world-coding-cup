/**
 * Creates the World Coding Cup story submission Google Form and its response sheet.
 *
 * Run once from script.google.com while signed in to the account that should own the form. It logs
 * the public form URL, the edit URL and the sheet URL.
 *
 * The 2026 form (owned by 11and1design@gmail.com) was built in the Forms editor on 20 October 2026
 * to this same specification, then set to collect typed-in email addresses, always send responders
 * a copy, show a progress bar and hide the "submit another response" link.
 *
 * The questions follow the toolkit's story checklist (src/pages/communications.astro, #submit) and
 * the 5 November photography brief from the client's "Sponsored by Amazon guidelines" doc.
 * There is deliberately no file-upload question: Google Forms makes every respondent sign in to a
 * Google account when a form has one. Schools share photo and video links instead, or email photos
 * to stories@worldcodingcup.com.
 */
function createStoryForm() {
  const form = FormApp.create("World Coding Cup 2026: share your school's story");
  form.setDescription([
    "Tell us how your learners took part in the Tangible World Coding Cup 2026, sponsored by Amazon. Every local story helps us build the global World Coding Cup story.",
    "",
    "It takes about 10 minutes. Have these ready: your learner and team numbers, one memorable moment, and a link to your best 3–5 photographs (and a short video if you have one).",
    "",
    "Only share photographs and video of learners whose permission is in place. If you can't share a link, email your photographs to stories@worldcodingcup.com with your school's name in the subject.",
  ].join("\n"));

  try {
    form.setEmailCollectionType(FormApp.EmailCollectionType.RESPONDER_INPUT);
  } catch (error) {
    form.setCollectEmail(true);
  }
  form.setLimitOneResponsePerUser(false);
  form.setAllowResponseEdits(false);
  form.setShowLinkToRespondAgain(false);
  form.setProgressBar(true);
  form.setPublishingSummary(false);
  form.setConfirmationMessage("Thank you! We've received your World Coding Cup story. The Tangible team will be in touch if we'd like to feature it or need anything else.");

  const wholeNumber = (help) => FormApp.createTextValidation().setHelpText(help).requireWholeNumber().build();
  const text = (title, help, required) => form.addTextItem().setTitle(title).setHelpText(help || "").setRequired(!!required);
  const paragraph = (title, help, required) => form.addParagraphTextItem().setTitle(title).setHelpText(help || "").setRequired(!!required);
  const yesNo = (title, help, required) => form.addMultipleChoiceItem().setTitle(title).setHelpText(help || "").setChoiceValues(["Yes", "No"]).setRequired(!!required);

  // About you
  form.addSectionHeaderItem().setTitle("About you");
  text("Your name", "", true);
  text("Your role", "For example: teacher, coordinator or principal.", true);
  text("Phone or WhatsApp number", "Optional. In case we need to reach you quickly.");
  text("School or organisation", "", true);
  text("City or town", "", true);
  text("Country", "", true);

  // Your tournament
  form.addPageBreakItem().setTitle("Your tournament");
  text("How many learners took part?", "", true).setValidation(wholeNumber("Please enter a number, for example 24."));
  text("How many teams did you enter?", "", true).setValidation(wholeNumber("Please enter a number, for example 6."));
  form.addCheckboxItem()
    .setTitle("Which categories did your teams play in?")
    .setChoiceValues(["Junior (about 7–13 years)", "Senior (about 13–18 years)", "Open (university or tertiary, 18+)"]);
  yesNo("Is this your first time taking part?");
  text("How many of your learners were girls?", "Optional. We use this to share stories about girls in coding.")
    .setValidation(wholeNumber("Please enter a number."));

  // Your story
  form.addPageBreakItem().setTitle("Your story");
  paragraph("Share one memorable moment", "What will you remember about the day? A breakthrough, a celebration or a moment of teamwork.", true);
  paragraph("A quote from a teacher or learner", "Optional. Say who said it. For adults, give their name and role. For learners, use their first name and age only, and only with permission.");
  text("Your result, if you know it", "Optional.");

  // Photographs and video
  form.addPageBreakItem()
    .setTitle("Photographs and video")
    .setHelpText("We're looking for natural, bright, real moments: hands-on coding, concentration, teamwork and celebration. Hands, close-ups of the game and teams photographed from behind work well when faces can't be shown. Check the whole frame for names on badges, worksheets and screens.");
  text("Link to your best 3–5 photographs", "Share a Google Drive, OneDrive or Dropbox folder that anyone with the link can view. Please don't use WeTransfer, because its links expire. You can also email your photographs to stories@worldcodingcup.com.");
  text("Link to a short video", "Optional. A link to a video on Google Drive, YouTube (unlisted is fine) or similar.");
  paragraph("Is there anything we should know about these images?", "Optional. For example, a learner who must not be identified, or an image where permission is uncertain. We'll check with you before using it.");

  // Where you've shared it
  form.addPageBreakItem().setTitle("Where you've shared it");
  paragraph("Links to anything you've shared", "Optional. Social media posts, newsletters or your school website. One link per line.");
  paragraph("Links to any media coverage", "Optional. Newspaper, radio or online coverage. One link per line.");

  // Permissions
  form.addPageBreakItem().setTitle("Permissions");
  form.addCheckboxItem()
    .setTitle("Photograph and video permissions")
    .setChoiceValues(["I confirm permission is in place for every learner who can be identified in the photographs and video I've shared, in line with our school's or organisation's safeguarding requirements."])
    .setRequired(true);
  form.addCheckboxItem()
    .setTitle("How may Tangible use your story and images?")
    .setChoiceValues([
      "In World Coding Cup 2026 coverage (website, social media and newsletters)",
      "In future Tangible communications",
      "Please contact me before using them",
    ])
    .setRequired(true);
  yesNo("May we contact you for more details or a media interview?");
  form.addSectionHeaderItem()
    .setTitle("How we use your answers")
    .setHelpText("Your answers are shared with the Tangible team at the LEVA Foundation. We use them to tell the World Coding Cup story and to contact you about your submission. We won't publish your contact details.");

  const sheet = SpreadsheetApp.create("World Coding Cup 2026 stories (responses)");
  form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());

  try {
    form.setPublished(true);
  } catch (error) {
    // Older Forms without the publish step accept responses as soon as they are created.
  }
  form.setAcceptingResponses(true);

  Logger.log("Form (share this): " + form.getPublishedUrl());
  Logger.log("Short link: " + form.shortenFormUrl(form.getPublishedUrl()));
  Logger.log("Edit: " + form.getEditUrl());
  Logger.log("Responses sheet: " + sheet.getUrl());
}
