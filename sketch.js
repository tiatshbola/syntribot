// Mrs Synthetic — p5.js + ml5.js
// AI DISCLOSURE: an AI assistant (Claude, Anthropic) helped with debugging, the
// interaction wiring, and the interface styling. The concept and all the
// question writing are my own.  >>> Rewrite this note in your own words.

let classifier, video, label = "";
let sessionStart = 0, waitSeconds = 5;
let imageModelURL = "https://teachablemachine.withgoogle.com/models/HmMegiSBC/";

let responses = {
  happy: [
    "And underneath the smile, what's there?",
    "Why, what has happened in your life recently?",
    "Is this joy, or is it performance?",
    "How long do you think it will last?",
    "Good to hear. Session over,"
  ],
  "sad/upset": [
    "How long have you been carrying that pain?",
    "What would happen if you let it out into the world?",
    "Do you believe it will get better - does hope still reside in you?",
    "If it does or doesn't, why?",
    "If it does, if it doesn't, life...will get better. I promise. Session Over"
  ]
};

let sessionBank = null, questionIndex = 0, sessionOver = false, transcript = [];
let detectedEl, transcriptEl, replyInput;

function preload() {
  ml5.setBackend('webgl');
  classifier = ml5.imageClassifier(imageModelURL, { flipped: true });
}

// Get an element by id, or create it if the host page doesn't have one.
// This lets the sketch run anywhere (p5 editor, OpenProcessing, local file)
// without depending on a matching index.html.
function ensure(id, tag, parent) {
  let el = select('#' + id);
  if (!el) {
    el = createElement(tag || 'div');
    el.id(id);
    el.parent(parent || document.body);
  }
  return el;
}

function setup() {
  let box = ensure('videoBox', 'div');

  let cnv = createCanvas(560, 420);
  cnv.parent(box);

  // createCapture's 2nd arg is a getUserMedia constraints object, NOT { flipped }.
  // (Flipping is handled by ml5's imageClassifier { flipped: true } in preload.)
  video = createCapture(
    { video: true, audio: false },
    () => {                       // success: camera is live
      detectedEl && detectedEl.html("Camera ready — analysing…");
      classifier.classifyStart(video, gotResult);
    }
  );
  video.size(560, 420);
  video.hide();

  video.elt.onerror = () => {
    detectedEl && detectedEl.html("Camera failed — check browser permission.");
  };

  detectedEl   = ensure('detected', 'div');
  transcriptEl = ensure('transcript', 'div');
  replyInput   = ensure('reply', 'input');

  ensure('replyBtn', 'button').mousePressed(handleReply);
  ensure('beginBtn', 'button').mousePressed(restart);

  sessionStart = millis();
}

function draw() {
  image(video, 0, 0, width, height);
  let elapsed = (millis() - sessionStart) / 1000;
  if (elapsed < waitSeconds) {
    detectedEl.html("Analysing\u2026 " + ceil(waitSeconds - elapsed));
  } else {
    detectedEl.html("Reading: " + (label || "\u2014"));
  }
}

function gotResult(results) {
  if (!results || results.length === 0) return;
  let elapsed = (millis() - sessionStart) / 1000;
  if (elapsed < waitSeconds) return;
  if (sessionBank === null) {
    label = results[0].label;
    sessionBank = bankFor(label);
    questionIndex = 0;
    transcript.push(["Dr Synthetica", sessionBank[questionIndex]]);
    renderTranscript();
  }
}

function bankFor(lbl) {
  let key = lbl.toLowerCase();
  if (responses[key]) return responses[key];
  if (key.includes("happy")) return responses["happy"];
  if (key.includes("sad") || key.includes("upset")) return responses["sad/upset"];
  return responses["happy"];
}

function handleReply() {
  if (!sessionBank || sessionOver) return;
  let reply = replyInput.value().trim();
  if (reply !== "") transcript.push(["You", reply]);
  replyInput.value("");
  questionIndex++;
  if (questionIndex < sessionBank.length) {
    transcript.push(["Dr Synthetica", sessionBank[questionIndex]]);
  } else {
    sessionOver = true;
  }
  renderTranscript();
}

function renderTranscript() {
  let html = "";
  for (let entry of transcript) {
    let who = entry[0], text = entry[1];
    let cls = (who === "You") ? "user" : "bot";
    html += '<div class="msg ' + cls + '"><span class="who">' + who + '</span><div class="text">' + text + '</div></div>';
  }
  transcriptEl.html(html);
}

function restart() {
  sessionBank = null; questionIndex = 0; sessionOver = false;
  transcript = []; label = "";
  replyInput.value(""); transcriptEl.html("");
  sessionStart = millis();
}
