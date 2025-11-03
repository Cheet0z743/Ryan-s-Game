// Simple Minesweeper - vanilla JS
// Expose `initMinesweeper()` so the menu can start the game when selected.
function initMinesweeper(){
  const boardEl = document.getElementById('board');
  const rowsInput = document.getElementById('rows');
  const colsInput = document.getElementById('cols');
  const minesInput = document.getElementById('mines');
  const newGameBtn = document.getElementById('newGame');
  const mineCountEl = document.getElementById('mineCount');
  const timerEl = document.getElementById('timer');
  const startBtn = document.getElementById('minesStart');
  const openSettings = document.getElementById('openMinesSettings');
  const settingsPanel = document.getElementById('minesSettings');
  const closeSettings = document.getElementById('closeMinesSettings');

  let rows=9, cols=9, mines=10;
  let grid = [];
  let firstClick=true;
  let flags=0;
  let revealed=0;
  let timer=null, time=0;
  let gameOver=false;

  function makeEmptyGrid(r,c){
    const g=[];
    for(let i=0;i<r;i++){
      const row=[];
      for(let j=0;j<c;j++){
        row.push({mine:false,adj:0,revealed:false,flagged:false});
      }
      g.push(row);
    }
    return g;
  }

  function placeMines(excludeR,excludeC){
    let placed=0;
    while(placed<mines){
      const r=Math.floor(Math.random()*rows);
      const c=Math.floor(Math.random()*cols);
      if(grid[r][c].mine) continue;
      if(Math.abs(r-excludeR)<=1 && Math.abs(c-excludeC)<=1) continue;
      grid[r][c].mine=true; placed++;
    }
    for(let i=0;i<rows;i++){
      for(let j=0;j<cols;j++){
        if(grid[i][j].mine) continue;
        let count=0;
        for(let di=-1;di<=1;di++) for(let dj=-1;dj<=1;dj++){
          if(di===0&&dj===0) continue;
          const ni=i+di, nj=j+dj;
          if(ni>=0 && ni<rows && nj>=0 && nj<cols && grid[ni][nj].mine) count++;
        }
        grid[i][j].adj=count;
      }
    }
  }

  function startTimer(){
    stopTimer();
    time=0; timerEl.textContent='Time: 0s';
    timer=setInterval(()=>{time++; timerEl.textContent=`Time: ${time}s`;},1000);
  }
  function stopTimer(){ if(timer){clearInterval(timer); timer=null;} }

  function newGame(){
    rows = parseInt(rowsInput.value)||9;
    cols = parseInt(colsInput.value)||9;
    mines = Math.min(parseInt(minesInput.value)||10, Math.max(1, rows*cols-1));
    grid = makeEmptyGrid(rows,cols);
    firstClick=true;
    flags=0; revealed=0; gameOver=false;
    mineCountEl.textContent = `Mines: ${mines}`;
    // make columns fractional so cells will scale to fill the container
    boardEl.classList.add('fr');
    boardEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    renderBoard();
    stopTimer(); time=0; timerEl.textContent='Time: 0s';
  }

  function renderBoard(){
    boardEl.innerHTML='';
    boardEl.style.gridTemplateColumns = `repeat(${cols}, ${getComputedStyle(document.documentElement).getPropertyValue('--cell-size')})`;
    for(let i=0;i<rows;i++){
      for(let j=0;j<cols;j++){
        const cell = document.createElement('div');
        cell.className='cell covered';
        cell.dataset.r=i; cell.dataset.c=j;
        cell.addEventListener('click', onLeftClick);
        cell.addEventListener('contextmenu', onRightClick);
        cell.addEventListener('mousedown', (e)=>{ e.preventDefault(); });
        boardEl.appendChild(cell);
      }
    }
  }

  function onLeftClick(e){
    if(gameOver) return;
    const r=parseInt(e.currentTarget.dataset.r);
    const c=parseInt(e.currentTarget.dataset.c);
    if(firstClick){ placeMines(r,c); startTimer(); firstClick=false; }
    revealCell(r,c);
    checkWin();
  }

  function onRightClick(e){
    e.preventDefault();
    if(gameOver) return;
    const r=parseInt(e.currentTarget.dataset.r);
    const c=parseInt(e.currentTarget.dataset.c);
    const cell = grid[r][c];
    if(cell.revealed) return;
    cell.flagged = !cell.flagged;
    flags += cell.flagged ? 1 : -1;
    updateCellElement(r,c);
    mineCountEl.textContent = `Mines: ${Math.max(0, mines-flags)}`;
    checkWin();
  }

  function revealCell(r,c){
    const cell = grid[r][c];
    if(cell.revealed || cell.flagged) return;
    const el = getCellEl(r,c);
    cell.revealed=true; el.classList.remove('covered'); el.classList.add('revealed');
    if(cell.mine){ el.classList.add('mine'); el.textContent='💣'; gameLost(); return; }
    revealed++;
    if(cell.adj>0){ el.textContent = cell.adj; el.classList.add('n'+cell.adj); }
    else{ // flood fill
      for(let di=-1;di<=1;di++) for(let dj=-1;dj<=1;dj++){
        const ni=r+di, nj=c+dj;
        if(ni>=0 && ni<rows && nj>=0 && nj<cols) revealCell(ni,nj);
      }
    }
  }

  function updateCellElement(r,c){
    const el = getCellEl(r,c); const cell = grid[r][c];
    el.classList.toggle('flagged', cell.flagged);
    if(cell.flagged){ el.textContent='⚑'; el.classList.add('covered'); }
    else if(!cell.revealed){ el.textContent=''; }
  }

  function revealAllMines(){
    for(let i=0;i<rows;i++) for(let j=0;j<cols;j++){
      if(grid[i][j].mine){ const el=getCellEl(i,j); el.classList.remove('covered'); el.classList.add('revealed','mine'); el.textContent='💣'; }
    }
  }

  function gameLost(){ gameOver=true; stopTimer(); revealAllMines(); alert('Game Over — you hit a mine.'); }

  function checkWin(){
    if(gameOver) return;
    const totalCells = rows*cols;
    if(revealed === totalCells - mines){ gameWin(); return; }
    if(flags === mines){
      let allFlagCorrect=true;
      for(let i=0;i<rows;i++) for(let j=0;j<cols;j++){
        if(grid[i][j].flagged && !grid[i][j].mine) allFlagCorrect=false;
      }
      if(allFlagCorrect){ gameWin(); }
    }
  }

  function gameWin(){ gameOver=true; stopTimer(); alert(`You win! Time: ${time}s`); }

  function getCellEl(r,c){ const index = r*cols + c; return boardEl.children[index]; }

  // wire controls
  newGameBtn.addEventListener('click', newGame);

  // mines start/settings wiring
  if(startBtn){ startBtn.addEventListener('click', ()=>{ document.getElementById('minesOverlay').classList.add('game-hidden'); newGame(); }); }
  if(openSettings){ openSettings.addEventListener('click', ()=>{ settingsPanel.classList.remove('game-hidden'); }); }
  if(closeSettings){ closeSettings.addEventListener('click', ()=>{ settingsPanel.classList.add('game-hidden'); }); }
  // mode buttons highlight and set values
  document.querySelectorAll('#minesSettings .mode-btn').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      document.querySelectorAll('#minesSettings .mode-btn').forEach(b=>b.classList.remove('selected'));
      btn.classList.add('selected');
      rowsInput.value = btn.dataset.rows;
      colsInput.value = btn.dataset.cols;
      // adjust mines to reasonable default
      minesInput.value = Math.max(1, Math.round((btn.dataset.rows*btn.dataset.cols)*0.15));
    });
  });

  // keyboard: R to reset
  document.addEventListener('keydown', (e)=>{ if(e.key.toLowerCase()==='r') newGame(); });

  // note: don't auto-start; the Start button must be pressed to begin
}

// make callable from other scripts
window.initMinesweeper = initMinesweeper;