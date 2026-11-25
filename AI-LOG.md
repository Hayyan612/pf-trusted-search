# AI log: confident wrong answers and how I caught them

I built this with Claude (Claude Code) as my main tool. These are moments where it was confidently wrong about UAE real estate, and how I caught it. Full chats are in the Google Drive folder.

## 1. "Same size means the same flat"

**What the AI said.** After pulling all the ads, Claude grouped ads with the same bedrooms and size (within a few sq ft) and reported clusters of "duplicates", including one flat supposedly posted 11 times by different agencies.

**How I caught it.** 11 copies of one flat at prices from AED 105k to 135k did not make sense. Princess Tower is a 101-floor tower: the same layout repeats on almost every floor (the 1,181 sq ft 2-bed is the "04 series", one per floor). Same size is a floor plan, not a flat.

**What changed.** Duplicates now need matching photos as well as the same size and bedrooms. The "duplicates" became 7 real flats advertised more than once.

## 2. "These two ads share a photo, so one of them is fake"

**What the AI said.** Comparing photo fingerprints, Claude marked Royal Place's 1-bed at AED 69,990 as "likely misleading": it shared a photo with Royal Place's 2-bed, so the 1-bed had to be using another flat's photos.

**How I caught it.** I looked at the photos. The match was a sea-view shot from the balcony. Every flat on that side of the tower has nearly the same view. The interiors were different.

**What changed.** One shared photo now only means "Ask first". It takes 2+ matching photos of a different flat to mark an ad likely misleading.

## 3. "Security deposit is 5%, agency fee is 5% plus VAT"

**What the AI said.** Writing the simulated agent reply for rentals, Claude hard-coded "5% deposit, agency fee 5% + VAT" for every flat, furnished or not.

**How I caught it.** Most of Princess Tower's rentals are furnished. I checked renting guides (Property Finder, Bayut, Gulf News): the usual deposit is 5% of the yearly rent unfurnished and **10% furnished**. I also could not find a source for VAT on the residential agency fee, so the AI had stated that with no backing.

**What changed.** The reply now uses 10% for furnished flats and 5% otherwise, and drops the VAT claim. Lesson: even in mock data, numbers shown to a person must be checked, because they read as facts.

## 4. "Same photos plus a different size means two different flats"

**What the AI said.** The rules treated "same photos" with "different size" as two different flats, one borrowing the other's photos.

**How I caught it.** Looking at McCone (1,189 sq ft) and Seafront (1,305 sq ft) side by side: the same living room, sofa and lamp. It is one flat, and one of the agencies has the size wrong. The AI assumed sizes in ads are accurate. They are typed by agents.

**What changed.** Written into RULES.md as a known gap: "same photos, different size" should become its own question to the agent.

## 5. "Available 14 November" read as a future date

**What the AI said.** The availability check flagged an ad that says "vacant from 14 November 2026" as "Available 14 November 2026", a later date to ask about.

**How I caught it.** Reading the audit table on 25 November: that date had already passed. The ad text is simply out of date, which is a different signal (the ad was not updated).

**What changed.** Noted as a fix: a past date in the ad should read "ad text out of date, ask if still free", not "available later".

## 6. "Tolu is a different agent from Tolulope"

**What the AI said.** The new check for ads that name a different person to contact flagged an ad listed under Tolulope Majekodunmi because the text says "Tolu from White and Co". It also flagged "Mr" as a person, and missed a real case because the agency name came right after the person's name.

**How I caught it.** I read every one of the flagged ads before keeping the rule. "Tolu" is the agent's own short name; "Monty Darley" and "Montgomery Darley" are the same person too.

**What changed.** Names that share a first or last name, or start the same way, count as the same person; titles are ignored; the agency-name check only looks at the words right after the name. 5 real cases remain, each read by hand.

## 7. Scout's own model filled in a move-in date nobody gave

**What the AI said.** Testing the live assistant with "2-bed to rent, furnished, I have a cat", the LLM that reads the brief returned move-in "As soon as possible". I never said when. Scout then skipped the move-in question and would have asked agents about the wrong date.

**How I caught it.** Running the whole flow in Chrome: the quick questions asked for budget and household but not move-in, and the review screen showed "As soon as possible".

**What changed.** The instructions now say to fill a field only if the person said it, and that moveIn must be null when no date is given; the field description says the same. The review screen stays, so the person can always correct what the model read.

## 8. The negotiation message thanked the agent for a viewing that never happened

**What the AI said.** Testing the live "Write my negotiation brief" on a 3-bed, the model's message to the agent began "Thank you for showing us the property. We are very interested." The person had not viewed the flat or spoken to the agent. Sent as is, it would have been the person's first message, starting with a false claim.

**How I caught it.** Reading the API's output on the live site after deploying, before showing it to anyone. The numbers were right (they are checked in code); the words were not.

**What changed.** The instructions now say the person has not viewed the flat or spoken to the agent, never to thank them for a viewing, to use the agent's first name, and to keep it under 90 words. The next live run opened with "I am interested in the 3-bedroom unit and would like to make an opening offer". The same lesson shaped the free-text questions: when the model says "the ad already says…", code checks that the quote really is in the ad, and drops it if not.

## 9. My photo rule hid ads that were probably honest

**What the code said.** The photo-matching rule marked 6 ads "likely misleading": photos shared with another ad for a flat of a different size. All 6 carried the Verified badge, and I nearly led the one-pager with "6 fake ads".

**How I caught it.** Before writing it up, I opened the 6 side by side. They are 3 pairs, each from one agency. Two pairs are one ad for rent and one for sale, with sizes 4 and 59 sq ft apart: most likely the same flat offered both ways, sizes typed differently. Only one pair, two sale ads at AED 2.0M and 2.7M, looks like two different flats.

**What changed.** The one-pager now says what the data supports, not "6 fake ads". RULES.md (rule 2) records the overcall, who it hurts (the honest agents whose ads were hidden) and the fix: same agency, one rent and one sale, means "Ask first", not "misleading". I left the code as is for the submission and wrote the fix down rather than change the audit numbers at the last minute.

## 10. TrueUnit showed an ad that had already been taken down

**What it said.** TrueUnit listed McCone Properties' 2-bed at AED 115,990 (#175116789) as "Ask first" (one shared photo, and the ad text names a different contact), as if the ad were still live.

**How I caught it.** Checking 32 ads by hand on the evening of 25 Nov, the link opened Property Finder's "no longer available" page. I had captured it that morning. The ad it shared a photo with, Seafront's 2-bed at AED 115,000, is still live.

**What changed.** Nothing in the code before the deadline. The lesson is that the data is a snapshot and ads disappear within hours, so a real version must check an ad is still live before showing it as an option and before sending any question to its agent. That is now written in RULES.md ("When it is not sure") and in the hand-check notes in AUDIT.md. It also supports the idea itself: a flat that is gone is the first thing the person needs to know.
