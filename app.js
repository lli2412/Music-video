let canvas = document.getElementById("canvas");
let c = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;

let audio = document.getElementById("audio");
let file = document.getElementById("file");

let ctx = new AudioContext();
let src = ctx.createMediaElementSource(audio);
let analyser = ctx.createAnalyser();
src.connect(analyser);
analyser.connect(ctx.destination);
analyser.fftSize = 1024;
let bufferLength = analyser.frequencyBinCount;
let dataArray = new Uint8Array(bufferLength);

file.onchange = () => {
  let f = file.files[0];
  audio.src = URL.createObjectURL(f);
  audio.play();
};

let mode = "bars";
let skin = "neon";

function getColor(i, value) {
  if (skin === "neon") return `hsl(${i / bufferLength * 360}, 100%, 50%)`;
  if (skin === "space") return `rgb(${value}, ${value*0.5}, ${255-value})`;
  if (skin === "minimal") return "white";
}

function render() {
  requestAnimationFrame(render);
  analyser.getByteFrequencyData(dataArray);

  if (mode !== "waterfall") {
    c.fillStyle = "black";
    c.fillRect(0,0,canvas.width,canvas.height);
  } else {
    let imageData = c.getImageData(0,0,canvas.width,canvas.height);
    c.putImageData(imageData, 0, -1);
  }

  if (mode === "bars") {
    let barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;
    for(let i=0;i<bufferLength;i++){
      let barHeight = dataArray[i];
      c.fillStyle = getColor(i, barHeight);
      c.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      x += barWidth + 1;
    }
  }

  else if (mode === "wave") {
    analyser.getByteTimeDomainData(dataArray);
    c.beginPath();
    let slice = canvas.width / bufferLength;
    for(let i=0;i<bufferLength;i++){
      let v = dataArray[i] / 128.0;
      let y = v * canvas.height / 2;
      if(i===0) c.moveTo(0,y);
      else c.lineTo(i*slice,y);
    }
    c.strokeStyle=getColor(100,200);
    c.lineWidth=2;
    c.stroke();
  }

  else if (mode === "circle") {
    let cx = canvas.width/2, cy = canvas.height/2;
    let radius = 100;
    let angleStep = (Math.PI*2) / bufferLength;
    for(let i=0;i<bufferLength;i++){
      let value = dataArray[i];
      let angle = i*angleStep;
      let r = radius + value;
      let x = cx + Math.cos(angle) * r;
      let y = cy + Math.sin(angle) * r;
      c.strokeStyle=getColor(i,value);
      c.beginPath();
      c.moveTo(cx,cy);
      c.lineTo(x,y);
      c.stroke();
    }
  }

  else if (mode === "waterfall") {
    for (let i=0;i<bufferLength;i++) {
      let value = dataArray[i];
      c.fillStyle = getColor(i,value);
      c.fillRect(i, canvas.height-1, 1, 1);
    }
  }
}
render();

// Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}