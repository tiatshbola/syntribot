let classifier;
let video;
let label = "";

let imageModelURL =
  "https://teachablemachine.withgoogle.com/models/HmMegiSBC/";

let sessionStart = 0;
let waitSeconds = 5;

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
let transcript = [];
let scores = {};

let detectedEl;
let transcriptEl;
let replyInput;

function preload() {
  classifier = ml5.imageClassifier(imageModelURL);
}

function setup() {
  let cnv = createCanvas(560, 420);
  cnv.parent("videoBox");

  detectedEl = select("#detected");
  transcriptEl = select("#transcript");
  replyInput = select("#reply");

  select("#replyBtn").mousePressed(handleReply);
  select("#beginBtn").mousePressed(restart);

  video = createCapture(VIDEO);

  video.size(560, 420);
  video.hide();

  sessionStart = millis();

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
  label = top.label;

  let elapsed = (millis() - sessionStart) / 1000;

  if (elapsed < waitSeconds) {
    scores[top.label] =
      (scores[top.label] || 0) + top.confidence;
    return;
  }

  if (sessionBank === null) {
    sessionBank = bankFor(label);

    transcript.push([
      "Dr Synthetica",
      sessionBank[0]
    ]);

    renderTranscript();
  }
}

function bankFor(lbl) {
  let key = lbl.toLowerCase();

  if (key.includes("happy")) {
    return responses["happy"];
  }

  if (
    key.includes("sad") ||
    key.includes("upset")
  ) {
    return responses["sad/upset"];
  }

  return responses["happy"];
}

function handleReply() {
  if (!sessionBank) return;

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
  }

  renderTranscript();
}

function renderTranscript() {
  let html = "";

  for (let item of transcript) {
    html += `
      <div class="msg">
        <span class="who">${item[0]}</span>
        <div class="text">${item[1]}</div>
      </div>
    `;
  }

  transcriptEl.html(html);
}

function restart() {
  sessionBank = null;
  questionIndex = 0;
  transcript = [];
  scores = {};
  label = "";

  transcriptEl.html("");

  sessionStart = millis();
}
