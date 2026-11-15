# AgriLink

The story and showcase site for **AgriLink**, a phone app for small-scale tomato and pepper farmers in Kano State, Nigeria. Farmers list crates, receive offers directly from buyers, find drivers to move their harvest and book cold-room space. It works offline, in Hausa first plus English, Yoruba, Igbo and Pidgin, with voice support.

- Live app (one-tap demo sign-in, sample data, no sign-up): https://agrilink-lilac-five.vercel.app
- This site: https://timileyin-swe.github.io/agrilink

## Run locally

From the project directory, run:

```sh
python -m http.server 8000
```

Open http://localhost:8000. The site uses plain HTML, CSS and JavaScript and needs no build step.

## The demo film

The "Watch the 2-minute demo" button, the Demo menu item and the Demo section are hidden until the film is added. To switch them on:

1. Add the film as `assets/agrilink-demo.mp4` (MP4, H.264 video, AAC audio, 1280×720 or 1920×1080, under 25 MB).
2. In `pitch.js`, change `const DEMO_VIDEO_AVAILABLE = false;` to `true`.
3. Raise the version by one so returning visitors get the change: in `sw.js`, `agrilink-site-v19` and `?v=19` become `v20`; in `index.html`, the six `?v=19` on the style and script links become `?v=20`.
4. Commit and push.

While the switch is `false`, the page never asks for the file, so there is no error in the console.

## Screenshots

`assets/app/screen-*.webp` are real screens from the live app, each in light and dark (the app's own Appearance setting), 390×844 at 2×, saved 720 px wide: the Sell flow's review step, the farmer's deals, a filled cold room form, a plant check, and a buyer following a delivery. The page shows the dark ones when the site is dark.

## How the AGRILINK word works

`hero.css` and `pitch.js`: the harvest film (`assets/harvest.mp4`) plays behind a page-coloured layer with the word cut out (`assets/word.svg` as a CSS mask). While you scroll the pinned stage, the layer grows (`--zoom`) until the film fills the screen, then the story panel fades in over it (`--intro-fade`). With reduced motion, save-data or 2G, the word stays still and shows the photo. On phones the word keeps its letter shape: its width follows the screen and its height follows the width.

The story lines under "Our story" appear one by one as you scroll, and a few pictures, cards and leaves move at slightly different speeds (parallax). All of this runs in one animation frame in `pitch.js`, uses only transform and opacity, and is switched off with reduced motion.
