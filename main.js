// main navigation between menu and games
(function(){
  const menu = document.getElementById('menu');
  const snakeApp = document.getElementById('snake-app');
  const minesApp = document.getElementById('minesweeper-app');
  const fpsApp = document.getElementById('fps-app');
   // Start background music when showing menu
   const bgMusic = document.getElementById('bgMusic');
   bgMusic.volume = 0.3; // Set volume to 30%
   bgMusic.play();
  const btnSnake = document.getElementById('btnSnake');
  const btnMines = document.getElementById('btnMines');
  const btnFPS = document.getElementById('btnFPS');
  const backFromSnake = document.getElementById('backFromSnake');
  const backFromMines = document.getElementById('backFromMines');
  const backFromFPS = document.getElementById('backFromFPS');

   // Stop background music when entering game
   const bgMusic = document.getElementById('bgMusic');
   bgMusic.pause();
  function showMenu(){
    menu.classList.remove('game-hidden');
    snakeApp.classList.add('game-hidden');
    minesApp.classList.add('game-hidden');
    fpsApp.classList.add('game-hidden');
  }

  // Function to check and close other game windows
  function closeOtherWindows() {
   // Stop background music when entering game
   const bgMusic = document.getElementById('bgMusic');
   bgMusic.pause();
    const gameWindows = Array.from(window.opener ? window.opener.document.querySelectorAll('.game-window') : []);
    gameWindows.forEach(win => {
      if (win && !win.closed) {
        win.close();
      }
    });
  }

   // Stop background music when entering game
   const bgMusic = document.getElementById('bgMusic');
   bgMusic.pause();
  function showSnake(){
    closeOtherWindows();
    menu.classList.add('game-hidden');
    snakeApp.classList.remove('game-hidden');
    minesApp.classList.add('game-hidden');
    fpsApp.classList.add('game-hidden');
    // initialize snake if available
    if(window.initSnake){ window.initSnake(); }
  }

  function showMines(){
    closeOtherWindows();
    menu.classList.add('game-hidden');
    snakeApp.classList.add('game-hidden');
    minesApp.classList.remove('game-hidden');
    fpsApp.classList.add('game-hidden');
    if(window.initMinesweeper){ window.initMinesweeper(); }
  }

  function showFPS(){
    closeOtherWindows();
    menu.classList.add('game-hidden');
    snakeApp.classList.add('game-hidden');
    minesApp.classList.add('game-hidden');
    fpsApp.classList.remove('game-hidden');
    if(window.initFPS) { window.initFPS(); }
  }

  // Add click handlers with console logs for debugging
  btnSnake.addEventListener('click', () => {
    console.log('Snake button clicked');
    showSnake();
  });
  
  btnMines.addEventListener('click', () => {
    console.log('Minesweeper button clicked');
    showMines();
  });
  
  btnFPS.addEventListener('click', () => {
    console.log('FPS button clicked');
    showFPS();
  });
  
  backFromSnake.addEventListener('click', () => {
    console.log('Back from Snake clicked');
    if(window.stopSnake) window.stopSnake();
    showMenu();
  });
  
  backFromMines.addEventListener('click', () => {
    console.log('Back from Minesweeper clicked');
    showMenu();
  });
  
  backFromFPS.addEventListener('click', () => {
    console.log('Back from FPS clicked');
    if(window.currentFPSGame) {
      window.removeEventListener('keydown', window.currentFPSGame.handleKeyDown);
      window.removeEventListener('keyup', window.currentFPSGame.handleKeyUp);
      window.currentFPSGame = null;
    }
    showMenu(); 
  });

  // show menu on load
  showMenu();
})();