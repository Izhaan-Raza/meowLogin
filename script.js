
let captchaRefreshInterval;


function stopCaptchaRefresh() {
  clearInterval(captchaRefreshInterval); 
}

function generatePattern() {
  const points = [];
  const gridSize = 3;
  const cellSize = 200 / gridSize;
  const padding = cellSize / 3;
  
  
  const numPoints = Math.floor(Math.random() * 3) + 4;
  
  while (points.length < numPoints) {
    const x = Math.floor(Math.random() * gridSize);
    const y = Math.floor(Math.random() * gridSize);
    const point = {
      x: x * cellSize + cellSize / 2,
      y: y * cellSize + cellSize / 2
    };
    
    
    const isTooClose = points.some(p => 
      Math.sqrt(Math.pow(p.x - point.x, 2) + Math.pow(p.y - point.y, 2)) < padding
    );
    
    if (!isTooClose) {
      points.push(point);
    }
  }
  
  return points;
}


function drawPattern(points) {
  const canvas = document.getElementById('patternCanvas');
  const ctx = canvas.getContext('2d');
  
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  
  const gridSize = 3;
  const cellSize = canvas.width / gridSize;
  
  for (let i = 1; i < gridSize; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cellSize, 0);
    ctx.lineTo(i * cellSize, canvas.height);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, i * cellSize);
    ctx.lineTo(canvas.width, i * cellSize);
    ctx.stroke();
  }
  
  
  ctx.strokeStyle = '#4f46e5';
  ctx.lineWidth = 2;
  
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();
  
  
  ctx.fillStyle = '#4f46e5';
  points.forEach((point, index) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
    ctx.fill();
    
    
    ctx.fillStyle = 'white';
    ctx.font = '10px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText((index + 1).toString(), point.x, point.y);
  });
}


function setupDrawCanvas() {
  const canvas = document.getElementById('drawCanvas');
  const ctx = canvas.getContext('2d');
  let isDrawing = false;
  let points = [];
  
  function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }
  
  function getTouchPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const touch = e.touches[0];
    
    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY
    };
  }
  
  function startDrawing(pos) {
    isDrawing = true;
    points = [pos];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 2;
  }
  
  function draw(pos) {
    if (!isDrawing) return;
    
    points.push(pos);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }
  
  function stopDrawing() {
    if (!isDrawing) return;
    isDrawing = false;
    validatePattern(points);
  }
  
  
  canvas.addEventListener('mousedown', (e) => {
    e.preventDefault();
    startDrawing(getMousePos(e));
  });
  
  canvas.addEventListener('mousemove', (e) => {
    e.preventDefault();
    draw(getMousePos(e));
  });
  
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseout', stopDrawing);
  
  
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startDrawing(getTouchPos(e));
  });
  
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    draw(getTouchPos(e));
  });
  
  canvas.addEventListener('touchend', stopDrawing);
}


function validatePattern(drawnPoints) {
  const similarity = calculatePatternSimilarity(drawnPoints, currentPattern);
  const threshold = 0.75; 
  
  if (similarity >= threshold) {
    document.getElementById('error').textContent = '';
    return true;
  } else {
    document.getElementById('error').textContent = 'Pattern does not match. Please try again.';
    const drawCanvas = document.getElementById('drawCanvas');
    const ctx = drawCanvas.getContext('2d');
    ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    return false;
  }
}


function calculatePatternSimilarity(drawn, original) {
  
  const simplifiedDrawn = simplifyPoints(drawn, original.length);
  
  
  let totalDistance = 0;
  const maxDistance = Math.sqrt(Math.pow(200, 2) + Math.pow(200, 2)); 
  
  simplifiedDrawn.forEach((point, i) => {
    const distance = Math.sqrt(
      Math.pow(point.x - original[i].x, 2) + 
      Math.pow(point.y - original[i].y, 2)
    );
    totalDistance += distance;
  });
  
  const averageDistance = totalDistance / original.length;
  return 1 - (averageDistance / maxDistance);
}


function simplifyPoints(points, targetLength) {
  const step = (points.length - 1) / (targetLength - 1);
  const simplified = [];
  
  for (let i = 0; i < targetLength; i++) {
    const index = Math.round(i * step);
    simplified.push(points[Math.min(index, points.length - 1)]);
  }
  
  return simplified;
}


let currentPattern = [];

function refreshCaptcha() {
  currentPattern = generatePattern();
  drawPattern(currentPattern);
  
  const drawCanvas = document.getElementById('drawCanvas');
  const ctx = drawCanvas.getContext('2d');
  ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
}
function setupAutoRefreshCaptcha() {
  
  captchaRefreshInterval = setInterval(refreshCaptcha, 1500);
}


document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const submitBtn = document.getElementById('submitBtn');
  const errorDiv = document.getElementById('error');
  const refreshBtn = document.getElementById('refreshCaptcha');
  const stabilizeBtn = document.getElementById('stabilizeCaptcha'); 
  
  
  setupDrawCanvas();
  
  
  refreshCaptcha();
  setupAutoRefreshCaptcha();
  
  
  refreshBtn.addEventListener('click', refreshCaptcha);


  
  stabilizeBtn.addEventListener('click', () => {
    stopCaptchaRefresh();
    stabilizeBtn.style.display = 'none'; 
    alert('Captcha stabilized.');
  });
  
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    errorDiv.textContent = '';
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
      errorDiv.textContent = 'All fields are required';
      return;
    }
    
    const drawCanvas = document.getElementById('drawCanvas');
    if (!drawCanvas.getContext('2d').getImageData(0, 0, drawCanvas.width, drawCanvas.height).data.some(x => x !== 0)) {
      errorDiv.textContent = 'Please draw the pattern';
      return;
    }
    
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';
    
    
    setTimeout(() => {
      alert('Login successful!');
      window.location.href = 'https://izhaan-raza.github.io/dumbathon_2025/';

      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In';
      form.reset();
      refreshCaptcha();
    }, 1000);
  });
});
