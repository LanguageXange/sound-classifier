const mario = document.getElementById("mario");
const coin = document.getElementById("coin");
const emojiContainer = document.getElementById("emoji");
const startBtn = document.getElementsByTagName("button")[0];
const totalScore = document.getElementById("score");
let total = 0;
const URL = "https://teachablemachine.withgoogle.com/models/ylZrQXs-G/";
const info = [
  {
    direction: "none",
    emoji: "😴",
  },
  { emoji: "👏", direction: "TBD" }, // the first sound in the model is clapping
  { emoji: "⬆️", direction: "Up" },
  {
    emoji: "⬇️",
    direction: "Down",
  },
];

const getCurrentPosition = (ele, attribute) => {
  return parseInt(window.getComputedStyle(ele).getPropertyValue(attribute));
};

function random() {
  return Math.floor(Math.random() * 220) + 1;
}

function setRandomPosition() {
  coin.style.top = random() + "px";
}

function goUp() {
  const marioTop = getCurrentPosition(mario, "top");
  if (marioTop < 40) mario.style.top = "0px";
  else {
    mario.style.top = `${marioTop - 40}px`;
  }
}
function goDown() {
  const marioTop = getCurrentPosition(mario, "top");
  if (marioTop >= 150) mario.style.top = "190px";
  else {
    mario.style.top = `${marioTop + 40}px`;
  }
}

const setDirection = (score, threshold, emoji, direction) => {
  if (score > threshold && direction == "Up") {
    emojiContainer.innerHTML = emoji;
    goUp();
  }
  if (score > threshold && direction == "Down") {
    emojiContainer.innerHTML = emoji;
    goDown();
  }
  if (score > threshold && direction == "none") {
    emojiContainer.innerHTML = emoji;
  }
};

async function createModel() {
  const checkpointURL = URL + "model.json"; // model topology
  const metadataURL = URL + "metadata.json"; // model metadata

  const recognizer = speechCommands.create(
    "BROWSER_FFT", // fourier transform type, not useful to change
    undefined, // speech commands vocabulary feature, not useful for your models
    checkpointURL,
    metadataURL
  );

  // check that model and metadata are loaded via HTTPS requests.
  await recognizer.ensureModelLoaded();

  return recognizer;
}

async function init() {
  total = 0;
  totalScore.innerHTML = total;
  startBtn.style.visibility = "hidden";
  const recognizer = await createModel();
  recognizer
    .listen(
      (result) => {
        const scores = result.scores; // probability of prediction for each class
        // render the probability scores per class
        for (let i = 0; i < scores.length; i++) {
          setDirection(scores[i], 0.6, info[i].emoji, info[i].direction);
        }
      },
      {
        includeSpectrogram: true, // in case listen should return result.spectrogram
        probabilityThreshold: 0.75,
        invokeCallbackOnNoiseAndUnknown: true,
        overlapFactor: 0.5, // probably want between 0.5 and 0.75. More info in README
      }
    )
    .catch((err) => {
      alert("please allow microphone access to play the game");
      coin.classList.remove("start");
      startBtn.style.visibility = "visible";
    });

  coin.classList.add("start");

  setTimeout(() => {
    emojiContainer.innerHTML = "⌛";
    recognizer.stopListening();
    coin.classList.remove("start");
    startBtn.style.visibility = "visible";
  }, 60000); // Times Up After 1 minute
}

function getCollision() {
  const marioMinValue = getCurrentPosition(mario, "top");
  const coinMinValue = getCurrentPosition(coin, "top");
  const coinLeft = getCurrentPosition(coin, "left");
  const maxValue = marioMinValue + 50;
  const coinMaxValue = coinMinValue + 20;
  const hitTheBottom =
    coinMinValue >= marioMinValue && coinMinValue <= maxValue;
  const hitTheTop = coinMaxValue >= marioMinValue && coinMaxValue <= maxValue;
  if ((hitTheBottom || hitTheTop) && coinLeft < 10) {
    total += 1;
    setRandomPosition();
    totalScore.innerHTML = total;
  }
}

setInterval(getCollision, 25);
