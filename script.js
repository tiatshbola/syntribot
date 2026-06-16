

//  trained Teachable Machine model:
const MODEL_URL = "https://teachablemachine.withgoogle.com/models/HmMegiSBC/";

// Question banks. Keys are matched case-insensitively to  class names,

const RESPONSES = {
  "happy": [
    "And underneath the smile — what's there?",
    "Who taught you to look pleased on command?",
    "Is this joy, or is it performance?"
  ],
  "sad": [
    "How long have you been carrying that?",
    "What would happen if you let it out here?",
    "Who do you wish was asking you this instead of me?"
  ]
};

const FALLBACK_QUESTION = "I don't have a script for what you're showing me. Sit with that.";
const CONFIDENCE_THRESHOLD = 0.55; // model must be this sure before she speaks
const STABLE_MS = 1200;            // a state must hold this long before she responds

//runtime
let model, webcam;
let currentState = null, candidateState = null, candidateSince = 0, lastQuestion = "";

const startBtn    = document.getElementById("start-btn");
const placeholder = document.getElementById("feed-placeholder");
const questionEl  = document.getElementById("question");

startBtn.addEventListener("click", init);

async function init() {
  startBtn.disabled = true;
  startBtn.textContent = "Loading…";

  try {
    model = await tmImage.load(MODEL_URL + "model.json", MODEL_URL + "metadata.json");

    // Warn (in console) if your class names don't match the RESPONSES keys.
    const labels = model.getClassLabels ? model.getClassLabels() : [];
    labels.forEach(l => {
      if (!(l.toLowerCase() in RESPONSES)) console.warn(`No question bank for class "${l}". Add a key "${l.toLowerCase()}" to RESPONSES.`);
    });

    const flip = true; // Teachable Machine flips the webcam on X
    webcam = new tmImage.Webcam(360, 360, flip);
    await webcam.setup();
    await webcam.play();

    placeholder.remove();
    document.getElementById("webcam-container").appendChild(webcam.canvas);

    startBtn.textContent = "Session running";
    questionEl.textContent = "Look at me.";

    window.requestAnimationFrame(loop);
  } catch (err) {
    console.error(err);
    startBtn.disabled = false;
    startBtn.textContent = "Begin session";
    questionEl.textContent = "Couldn't start — check the camera permission.";
  }
}

async function loop() {
  webcam.update();
  await predict();
  window.requestAnimationFrame(loop);
}

async function predict() {
  const prediction = await model.predict(webcam.canvas);

  // highest-probability class
  let top = prediction[0];
  for (const p of prediction) if (p.probability > top.probability) top = p;

  if (top.probability < CONFIDENCE_THRESHOLD) return;

  // only respond once a state has held steady (so it isn't jittery)
  if (top.className !== candidateState) {
    candidateState = top.className;
    candidateSince = performance.now();
    return;
  }
  if (performance.now() - candidateSince >= STABLE_MS && candidateState !== currentState) {
    currentState = candidateState;
    questionEl.textContent = pickQuestion(currentState);
  }
}

function pickQuestion(state) {
  const bank = RESPONSES[state.toLowerCase()] || [FALLBACK_QUESTION];
  let choice = bank[Math.floor(Math.random() * bank.length)];
  if (bank.length > 1) {
    let guard = 0;
    while (choice === lastQuestion && guard < 8) { choice = bank[Math.floor(Math.random() * bank.length)]; guard++; }
  }
  lastQuestion = choice;
  return choice;
}
