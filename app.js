const audioElement = document.getElementById("audio");
const fileInput = document.getElementById("fileInput");
const playButton = document.getElementById("playBtn");
const stopButton = document.getElementById("stopBtn");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight * 0.5;

let audioCtx;
let analyser;
let source;
let dataArray;
let currentMode = "spectrum";

// Загружаем файл
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    audioElement.src = url;
  }
});

// Запуск музыки и визуализации
playButton.addEventListener("click", () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    source = audioCtx.createMediaElementSource(audioElement);

    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    draw();
  }
  audioElement.play();
});

// Остановка
stopButton.addEventListener("click", () => {
  audioElement.pause();
  audioElement.currentTime = 0;
});

// Переключение режимов
document.querySelectorAll("#modes button").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentMode = btn.dataset.mode;
  });
});

// Визуализация
function draw() {
  requestAnimationFrame(draw);

  analyser.getByteFrequencyData(dataArray);

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (currentMode === "spectrum") drawSpectrum();
  if (currentMode === "wave") drawWave();
  if (currentMode === "circle") drawCircle();
  if (currentMode === "cosmos") drawCosmos();
  if (currentMode === "fractal") drawFractal();
}

// === МОДЫ ===
function drawSpectrum() {
  const barWidth = (canvas.width / dataArray.length) * 2.5;
  let x = 0;
  for (let i = 0; i < dataArray.length; i++) {
    const barHeight = dataArray[i];
    ctx.fillStyle = "rgb(" + (barHeight + 100) + ",50,200)";
    ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
    x += barWidth + 1;
  }
}

function drawWave() {
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);
  for (let i = 0; i < dataArray.length; i++) {
    const y = (dataArray[i] / 255.0) * canvas.height;
    const x = (i / dataArray.length) * canvas.width;
    ctx.lineTo(x, canvas.height - y);
  }
  ctx.strokeStyle = "lime";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawCircle() {
  const radius = 100;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  for (let i = 0; i < dataArray.length; i++) {
    const angle = (i / dataArray.length) * Math.PI * 2;
    const r = radius + dataArray[i] * 0.5;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    ctx.fillStyle = "hsl(" + (i * 10) + ",100%,50%)";
    ctx.fillRect(x, y, 3, 3);
  }
}

function drawCosmos() {
  for (let i = 0; i < dataArray.length; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = dataArray[i] / 50;
    ctx.fillStyle = "rgba(0,150,255,0.7)";
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFractal() {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  // усредняем громкость (будет использоваться как пульс)
  let avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
  let pulse = 1 + avg / 200; // коэффициент пульсации

  ctx.save();
  ctx.translate(cx, cy);

  for (let i = 0; i < dataArray.length; i++) {
    const angle = (i / dataArray.length) * Math.PI * 6; // более закрученная спираль
    const radius = (i * 2 + dataArray[i]) * pulse; // радиус увеличивается от громкости
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    // цвет переливается + яркость от амплитуды
    ctx.fillStyle = `hsl(${(i * 6 + Date.now() / 15) % 360}, 100%, ${50 + avg / 10}%)`;

    ctx.beginPath();
    ctx.arc(x, y, 2 + avg / 50, 0, Math.PI * 2); // радиус точки пульсирует
    ctx.fill();
  }

  ctx.restore();
}
