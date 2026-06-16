// Dr Synthetica
// Webcam emotion classifier + branching therapy session

let classifier, video, label = "";
let sessionStart = 0;
let waitSeconds = 5;

// Teachable Machine model
let imageModelURL =
  "https://teachablemachine.withgoogle.com/models/HmMegiSBC/";

// Question banks
let responses = {
  happy: [
    "And underneath the smile, what's there?",
    "Why, what has happened in your life recently?",
    "Is this joy, or is it performance?",
    "How long do you think it will last?",
    "Good to hear. Session over."
  ],

  "sad/upset": [
    "How long have you been carrying that pain?",
    "What would happen if you let it out into the world?",
    "Do you believe it will get better - does hope still reside in you?",
    "If it does or doesn't, why?",
    "If it does, if it doesn't, life will get better. I promise. Session over."
  ]
};

let sessionBank = null;
let questionIndex = 0;
let sessionOver = false;

let transcript = [];
let scores = {};

let detectedEl;
let transcriptEl;
let replyInput;

// Load Teachable Machine model
function preload() {
  ml5.setBackend("webgl");
  classifier = ml5.imageClassifier(imageModelURL, {
    flipped: true
  });
}

// Create element if it doesn't already exist
function ensure(id, tag, parent) {
  let el = select("#" + id);

  if (!el) {
    el = createElement(tag || "div");
    el.id(id);
    el.parent(parent || document.body);
  }

  return el;
}

function setup() {
  let box = ensure("videoBox", "div");

  // Canvas
  let cnv = createCanvas(560, 420);
  cnv.parent(box);

  // Webcam
  video = createCapture(VIDEO);
  video.size(560, 420);
  video.hide();

  // HTML elements
  detectedEl = ensure("detected", "div");
  transcriptEl = ensure("transcript", "div");
  replyInput = ensure("reply", "input");

  ensure("replyBtn", "button").mousePressed(handleReply);
  ensure("beginBtn", "button").mousePressed(restart);

  sessionStart = millis();

  // Start classification
  classifier.classifyStart(video, gotResult);
}

function draw() {
  background(0);

  if (video) {
    image(video, 0, 0, width, height);
  }

  let elapsed = (millis() - sessionStart) / 1000;

  if (elapsed < waitSeconds) {
    detectedEl.html(
      "Analysing... " + ceil(waitSeconds - elapsed)
    );
  } else {
    detectedEl.html(
      "Reading: " + (label || "—")
    );
  }
}

function gotResult(results) {
  if (!results || results.length === 0) return;

  let top = results[0];

  for (let r of results) {
    if (r.confidence > top.confidence) {
      top = r;
    }
  }

  label = top.label;

  let elapsed = (millis() - sessionStart) / 1000;

  if (elapsed < waitSeconds) {
    scores[top.label] =
      (scores[top.label] || 0) + top.confidence;
    return;
  }

  if (sessionBank === null) {
    label = pickWinner();

    sessionBank = bankFor(label);

    questionIndex = 0;

    transcript.push([
      "Dr Synthetica",
      sessionBank[questionIndex]
    ]);

    renderTranscript();
  }
}

function pickWinner() {
  let best = null;
  let bestScore = -1;

  for (let k in scores) {
    if (scores[k] > bestScore) {
      bestScore = scores[k];
      best = k;
    }
  }

  return best || label || "happy";
}

function bankFor(lbl) {
  let key = lbl.toLowerCase();

  if (responses[key]) return responses[key];

  if (key.includes("happy")) {
    return responses["happy"];
  }

  if (key.includes("sad") || key.includes("upset")) {
    return responses["sad/upset"];
  }

  return responses["happy"];
}

function handleReply() {
  if (!sessionBank || sessionOver) return;

  let reply = replyInput.value().trim();

  if (reply !== "") {
    transcript.push(["You", reply]);
  }

  replyInput.value("");

  questionIndex++;

  if (questionIndex < sessionBank.length) {
    transcript.push([
      "Dr Synthetica",
      sessionBank[questionIndex]
    ]);
  } else {
    sessionOver = true;
  }

  renderTranscript();
}

function renderTranscript() {
  let html = "";

  for (let entry of transcript) {
    let who = entry[0];
    let text = entry[1];

    let cls =
      who === "You" ? "user" : "bot";

    html +=
      '<div class="msg ' +
      cls +
      '"><span class="who">' +
      who +
      '</span><div class="text">' +
      text +
      "</div></div>";
  }

  transcriptEl.html(html);
}

function restart() {
  sessionBank = null;
  questionIndex = 0;
  sessionOver = false;

  transcript = [];
  label = "";
  scores = {};

  replyInput.value("");
  transcriptEl.html("");

  sessionStart = millis();
}
