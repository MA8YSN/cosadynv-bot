# assets/fonts/

Place a file named **`Inter-Regular.ttf`** in this exact folder before
the Welcome System's card text will render.

## Why this is needed

`@napi-rs/canvas` has no fallback system font on a bare Railway
container. Without an explicitly bundled font, `ctx.fillText()` calls
render nothing visible — the rest of the card (background, decorations,
avatar, server logo) works fine, since those don't depend on a font at
all. This was diagnosed from a real test render where every image
element appeared except the text.

## How to get the font

1. Go to https://fonts.google.com/specimen/Inter
2. Click **Get font** → **Download all**
3. Unzip the download, find `Inter-Regular.ttf` (usually inside a
   `static/` subfolder)
4. Copy just that one file into this folder (`assets/fonts/`), keeping
   the exact filename `Inter-Regular.ttf`
5. Commit it to git along with your other changes — this is a real
   asset the bot needs at runtime, not a build artifact

Any TTF works, not just Inter — free to use a different font. If you do,
either name the file `Inter-Regular.ttf` anyway, or update
`fontFileName` in `src/config/welcome.config.ts` to match your actual
filename.

## Where this gets loaded

`src/services/welcomeImageService.ts`'s `ensureFontRegistered()`
registers this file once per process, under the family name configured
as `fontFamily` in `src/config/welcome.config.ts` (`WelcomeCardFont` by
default — an internal alias, not tied to the font's real name). Both
V1 themes (Classic, Space) reference that same registered family.