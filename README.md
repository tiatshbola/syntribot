#  Dr Synthetica The AI Therapist

An interactive webcam art piece built with [p5.js](https://p5js.org/) and
[ml5.js](https://ml5js.org/). It reads your facial expression through the
webcam using a [Teachable Machine](https://teachablemachine.withgoogle.com/)
image model, then opens a short "therapy session" — a sequence of probing
questions that branch on whether you appear **happy** or **sad/upset**.


## How it works

1. On load, the sketch starts the webcam (hidden) and an ml5 image classifier
   trained on a Teachable Machine model.
2. After a brief analysis window, the detected emotion picks a bank of
   questions.
3. Dr Synthetica asks one question at a time. You type a reply and submit; the
   session walks through the bank until it ends.

The emotion model lives at:
https://tiatshbola.github.io/syntribot/

## Running it

https://tiatshbola.github.io/syntribot/

```sh
# from the project folder
python -m http.server 8000
# then open http://localhost:8000
```

Allow the camera permission when prompted.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page markup and script includes |
| `sketch.js` | Current version — uses HTML elements, a transcript log, timed analysis, and a restart button |
| `sketch.original.js` | The original first-draft sketch (canvas-drawn text, single input box). Kept for reference |
| `script.js` | Additional page script |
| `style (1).css` | Styling |

## Versions

`sketch.js` is the evolved version of the project. `sketch.original.js`
preserves the original draft, which drew everything to the canvas and used a
single p5 input box. The current version moved the UI into real HTML elements,
added a conversation transcript, a timed "analysing" delay before reading the
expression, and a restart button.

## AI disclosure

An AI assistant (Claude, Anthropic) helped with debugging, the interaction
wiring, and the interface styling. The concept and all the question writing are
the author's own.
