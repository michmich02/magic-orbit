# Magic Orbit

> Hand gestures meet ASCII magic.

[**View live demo →**](https://michmich02.github.io/magic-orbit/)

## Overview

Magic Orbit is a real-time interaction study built around the contrast between tactile hand movement and low-resolution ASCII graphics. Gesture input changes the rhythm and character of the orbiting composition.

## Interaction

- Allow camera access.
- Place one hand in view.
- Move and pose your hand to influence the orbit.

## Built with

`JavaScript` · `MediaPipe` · `ASCII rendering` · `CSS`

## Run locally

```sh
python3 -m http.server 8000 --directory docs
```

Open [http://localhost:8000](http://localhost:8000) in a desktop browser. Camera and microphone APIs require localhost or HTTPS; external models and CDN dependencies require an internet connection.

## Design notes

- Immediate visual feedback keeps the gesture-to-effect relationship legible.
- The experience is designed as a focused, full-screen interaction.
- Processing happens in the browser; camera and microphone streams are not uploaded by this project.
