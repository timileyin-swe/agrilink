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

The "Watch the 2-minute demo" button and the Demo section appear by themselves when this file exists:

```
assets/agrilink-demo.mp4
```

Use MP4 (H.264 video, AAC audio), 1280×720 or 1920×1080, under 25 MB. Until the file is there, the button, the menu item and the section stay hidden.

## How the AGRILINK word works

`hero.css` and `pitch.js`: the harvest film (`assets/harvest.mp4`) plays behind a page-coloured layer with the word cut out (`assets/word.svg` as a CSS mask). While you scroll the pinned stage, the layer grows (`--zoom`) until the film fills the screen, then the story panel fades in over it (`--intro-fade`). With reduced motion, save-data or 2G, the word stays still and shows the photo.
