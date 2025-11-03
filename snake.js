// Simple Snake game using canvas
(function(){
  const canvas = document.getElementById('snakeCanvas');
  if(!canvas) return; // not on page
  const ctx = canvas.getContext('2d');
  const size = 20; // cell size
  const cols = Math.floor(canvas.width/size);
  const rows = Math.floor(canvas.height/size);

  let snake = [{x:Math.floor(cols/2), y:Math.floor(rows/2)}];
  let dir = {x:1,y:0};
  let apples = []; // multiple apples
  let loop = null;
  let speed = 120; // ms
  let appleCount = 0;
  let maxApples = 1;
  let fibIndex = 0;
  let fibSeq = [1,1,2,3,5,8,13,21];
  let colorHead = '#facc15';
  let colorBody = '#f59e0b';
  let dead = false;

  function placeApples(n){
    apples = apples || [];
    while(apples.length < n){
      const a = {x: Math.floor(Math.random()*cols), y: Math.floor(Math.random()*rows)};
      let onSnake = snake.some(s=>s.x===a.x && s.y===a.y) || apples.some(ap=>ap.x===a.x && ap.y===a.y);
      if(!onSnake){ apples.push(a); }
    }
  }

  function drawApple(a){
    const x = a.x*size + size/2;
    const y = a.y*size + size/2;
    // apple body
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(x, y, size*0.35, 0, Math.PI*2);
    ctx.fill();
    // leaf
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.ellipse(x - size*0.12, y - size*0.45, size*0.12, size*0.08, -0.6, 0, Math.PI*2);
    ctx.fill();
  }

  function draw(){
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    // draw apples
    for(const a of apples) drawApple(a);
    // draw snake with eyes
    for(let i=snake.length-1;i>=0;i--){
      const s = snake[i];
      const px = s.x*size;
      const py = s.y*size;
      ctx.fillStyle = i===0 ? colorHead : colorBody;
      ctx.fillRect(px+1, py+1, size-2, size-2);
      if(i===0){
        // eyes
        ctx.fillStyle = '#111827';
        const ex = px + size*0.65;
        const ey1 = py + size*0.33;
        const ey2 = py + size*0.67;
        ctx.fillRect(ex-4, ey1-4, 4,4);
        ctx.fillRect(ex-4, ey2-4, 4,4);
      }
    }
  }

  function step(){
    const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};
    // wrap
    if(head.x < 0) head.x = cols-1;
    if(head.x >= cols) head.x = 0;
    if(head.y < 0) head.y = rows-1;
    if(head.y >= rows) head.y = 0;
    // collision
    if(snake.some(s=>s.x===head.x && s.y===head.y)){
      // game over - show restart/settings instead of auto-restart
      die();
      return;
    }
    snake.unshift(head);
    // check apples eaten
    let ate = false;
     // Play boop sound when eating apple
     const appleSound = document.getElementById('appleSound');
     appleSound.currentTime = 0; // Reset sound to start
     appleSound.play();
    for(let i=0;i<apples.length;i++){
      if(apples[i].x===head.x && apples[i].y===head.y){
        apples.splice(i,1);
        appleCount++;
        document.getElementById('appleCount').textContent = appleCount;
        ate = true;
        // Fibonacci progression if selected
        if(maxApples === -1){ // -1 marks fibonacci mode
          fibIndex = Math.min(fibIndex+1, fibSeq.length-1);
          placeApples(fibSeq[fibIndex]);
        }
        break;
      }
    }
    // ensure apples count (non-fib)
    if(maxApples !== -1){
      if(apples.length < maxApples) placeApples(maxApples);
    }
    // if we didn't eat, remove tail to keep length; if we ate, keep tail so snake grows
    if(!ate){ snake.pop(); }
    draw();
  }

  function changeDir(dx,dy){ if(dx===-dir.x && dy===-dir.y) return; dir = {x:dx,y:dy}; }
  function keyHandler(e){ const k=e.key; if(k==='ArrowUp'||k==='w') changeDir(0,-1); if(k==='ArrowDown'||k==='s') changeDir(0,1); if(k==='ArrowLeft'||k==='a') changeDir(-1,0); if(k==='ArrowRight'||k==='d') changeDir(1,0); }

  function start(){ dead=false; stop(); loop = setInterval(step, speed); document.addEventListener('keydown', keyHandler); }
  function stop(){ if(loop) clearInterval(loop); loop=null; document.removeEventListener('keydown', keyHandler); }
  function restart(){ snake = [{x:Math.floor(cols/2), y:Math.floor(rows/2)}]; dir={x:1,y:0}; apples=[]; appleCount=0; document.getElementById('appleCount').textContent = appleCount; if(maxApples===-1) { fibIndex=0; placeApples(fibSeq[fibIndex]); } else { placeApples(maxApples); } draw(); }

  function die(){
    dead = true;
    stop();
    // show restart and big settings buttons so the player can restart or change settings
    if(restartBtn) restartBtn.style.display = '';
    if(openSettings) openSettings.style.display = '';
  }

  // wire controls
  const restartBtn = document.getElementById('snakeRestart');
  if(restartBtn) restartBtn.addEventListener('click', ()=>{ 
    // hide restart and big settings while playing
    restartBtn.style.display = 'none';
    if(openSettings) openSettings.style.display = 'none';
    restart(); start(); 
  });

  // settings wiring
  const openSettings = document.getElementById('openSnakeSettings');
  const settingsPanel = document.getElementById('snakeSettings');
  const closeSettings = document.getElementById('closeSnakeSettings');
  openSettings.addEventListener('click', ()=>{ settingsPanel.classList.remove('game-hidden'); });
  closeSettings.addEventListener('click', ()=>{ settingsPanel.classList.add('game-hidden'); });
  const settingsToggle = document.getElementById('snakeSettingsToggle');
  if(settingsToggle) settingsToggle.addEventListener('click', ()=>{ settingsPanel.classList.remove('game-hidden'); });
  const colorInput = document.getElementById('snakeColor');
  colorInput.addEventListener('input', (e)=>{ colorBody = e.target.value; colorHead = shadeColor(colorBody, 25); });
  const speedInput = document.getElementById('snakeSpeed');
  speedInput.addEventListener('input', (e)=>{ speed = parseInt(e.target.value); if(loop){ start(); } });
  // multiplier
  document.getElementById('appleMultiplier').addEventListener('click', (e)=>{
    const btn = e.target.closest('.mult-btn'); if(!btn) return;
    const val = btn.dataset.val;
    document.querySelectorAll('.mult-btn').forEach(b=>b.classList.remove('selected'));
    btn.classList.add('selected');
    if(val === 'fib'){ maxApples = -1; fibIndex = 0; placeApples(fibSeq[fibIndex]); }
    else{ maxApples = parseInt(val); placeApples(maxApples); }
  });

  // start button and overlay
  const startBtn = document.getElementById('snakeStart');
  const overlay = document.getElementById('snakeOverlay');
  startBtn.addEventListener('click', ()=>{ 
    overlay.classList.add('game-hidden'); 
    // hide restart and big settings while playing
    if(restartBtn) restartBtn.style.display = 'none';
    if(openSettings) openSettings.style.display = 'none';
    restart(); start(); 
  });

  // utility to shade color for head
  function shadeColor(color, percent) {
    // color in #rrggbb
    const num = parseInt(color.slice(1),16), amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (clamp(R,0,255)<<16) + (clamp(G,0,255)<<8) + clamp(B,0,255)).toString(16).slice(1);
  }
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}

  // expose start/stop so main can call them
  window.initSnake = function(){ /* noop - file loaded and wired */ };
  window.startSnake = start;
  window.stopSnake = stop;
})();