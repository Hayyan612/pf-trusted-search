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
