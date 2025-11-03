# Minesweeper (static web)

A small, self-contained Minesweeper implementation (HTML/CSS/JS). Open `index.html` in your browser to play.

Files added:
- `index.html` — main UI
- `style.css` — styling
- `script.js` — game logic

How to run
- Double-click `index.html` to open in your default browser.
- Or serve the folder and open `http://localhost:8000` (useful if your browser restricts local file JS):

  In PowerShell:

```powershell
cd 'c:\Users\rstill\Downloads\minesweeper'
python -m http.server 8000
# then open http://localhost:8000
```

Controls
- Left-click to reveal a cell.
- Right-click (context menu) to toggle flag.
- Adjust rows, cols, and mines then click "New Game".
- Press `R` to reset.

Menu
- Open `index.html` and you'll see a small menu with two buttons: "Snake" and "Minesweeper".
- Click "Snake" to open the Snake game (canvas-based). Click Back to return to the menu.
- Click "Minesweeper" to open the Minesweeper game.

Notes and limitations
- This is a simple demo without persistent settings.
- First click is safe (mines won't be placed on the clicked cell or its immediate neighbors).

If you'd like a Windows-native GUI (tkinter) or a packaged executable, say so and I can add it.