//initializing image classifier
let classifier;
//holding the video we want to classify
let video;
// for users to input their answer
let answerbox;
//submit button
let submitbutton;

let qIndex = 0;


//variable for displaying results on the page
let label = "Model loading...";
let imageModelURL = "https://teachablemachine.withgoogle.com/models/HmMegiSBC/";

//these are global so gotResult can see them
let question = "";
let lastLabel = "";
let responses = {
  Happy: [
    "And underneath the smile, what's there?",
    "Why, what has happened in your life recently?",
    "Is this joy, or is it performance?",
    "How long do you think it will last?",
    "Good to hear. Session over,"
  ],
  "Sad/Upset": [
    "How long have you been carrying that pain?",
    "What would happen if you let it out into the world?",
    "Do you believe it will get better - does hope still reside in you?",
    "If it does or doesn't, why?",
    "If it does, if it doesn't, life...will get better. I promise. Session Over"
  ]
};

function preload() {
  ml5.setBackend('webgl');
  classifier = ml5.imageClassifier(imageModelURL);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  //webcam hidden
  video = createCapture(VIDEO);
  video.size(800, 500);
  video.hide();
  //detect emotion
  classifier.classifyStart(video, gotResult);

  //answer box position
  answerbox = createInput();
  answerbox.position(50, 700);
  answerbox.size(200, 20);
  //submit
  submitbutton = createButton("Submit.");
  submitbutton.size(58, 20);
  submitbutton.position(260, 702);
  submitbutton.mousePressed(NextQ);
}

function draw() {
  background(255);
  image(video, 0, 0);
  fill(0);
  textFont("Times New Roman");
  textSize(22);
  text("Detected: " + label, 20, 540);
  textSize(28);
  text(question, 20, 580, width - 40);


}
  //when emotion is detected show first question

function gotResult(results) {
  label = results[0].label;
  if (label !== lastLabel) {
    lastLabel = label;
    qIndex = 0;
    question = responses[label][0];
  }
}


function NextQ() {
  qIndex = qIndex + 1;
  question = responses[label][qIndex];
  answerbox.value("") // empty box
}
