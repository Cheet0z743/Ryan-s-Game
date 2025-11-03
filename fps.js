class FPSGame {
    constructor(canvasId, mapWidth = 16, mapHeight = 16) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Game state
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        this.map = this.generateMap();
        this.isPaused = false;
        
        // Sound effects
        this.footstepSound = document.getElementById('footstepSound');
        this.footstepSound.volume = 0.3;
        this.lastStepTime = 0;
        this.stepInterval = 500; // Time between footsteps in ms
        
        // Visual settings
        this.wallColor = '#4B0082';
        this.floorColor = '#4B0082';
        this.wallTexture = 'solid';
        this.floorPattern = 'solid';
        
        // Player state
        this.playerX = this.mapWidth / 2;
        this.playerY = this.mapHeight / 2;
        this.playerAngle = 0;  // facing right
        this.moveSpeed = 0.1;
        this.rotSpeed = 0.1;

        // Raycasting settings
        this.FOV = Math.PI / 3;  // 60 degrees
        this.resolution = 320;    // number of rays
        this.stripWidth = this.canvas.width / this.resolution;
        this.maxDistance = Math.sqrt(mapWidth * mapWidth + mapHeight * mapHeight);

        // Controls state
        this.keys = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false
        };

        // Bind event listeners
        this.setupControls();
        this.setupSettings();

        // Start game loop
        this.lastTime = 0;
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    generateMap() {
        // Create empty map
        const map = Array(this.mapHeight).fill().map(() => Array(this.mapWidth).fill(0));
        
        // Add outer walls
        for (let y = 0; y < this.mapHeight; y++) {
            map[y][0] = 1;  // Left wall
            map[y][this.mapWidth - 1] = 1;  // Right wall
        }
        for (let x = 0; x < this.mapWidth; x++) {
            map[0][x] = 1;  // Top wall
            map[this.mapHeight - 1][x] = 1;  // Bottom wall
        }

        // Add some random pillars
        for (let i = 0; i < 10; i++) {
            const x = Math.floor(Math.random() * (this.mapWidth - 2)) + 1;
            const y = Math.floor(Math.random() * (this.mapHeight - 2)) + 1;
            // Don't place pillar too close to player spawn
            if (Math.abs(x - this.mapWidth/2) > 2 || Math.abs(y - this.mapHeight/2) > 2) {
                map[y][x] = 1;
            }
        }

        return map;
    }

    setupControls() {
        // Create bound event handlers that we can remove later
        this.handleKeyDown = (e) => {
            if (this.keys.hasOwnProperty(e.key)) {
                this.keys[e.key] = true;
            }
        };

        this.handleKeyUp = (e) => {
            if (this.keys.hasOwnProperty(e.key)) {
                this.keys[e.key] = false;
            }
        };

        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }

    setupSettings() {
        const fovSlider = document.getElementById('fovSlider');
        const resSlider = document.getElementById('resolutionSlider');
        const brightnessSlider = document.getElementById('brightnessSlider');
        const sensitivitySlider = document.getElementById('sensitivitySlider');

        // Set initial slider positions
        brightnessSlider.value = "1.0";
        document.getElementById('brightnessValue').textContent = "1.0";
        this.brightness = 1.0;

        fovSlider.addEventListener('input', (e) => {
            this.FOV = (parseInt(e.target.value) * Math.PI) / 180;
            document.getElementById('fovValue').textContent = e.target.value + '°';
        });

        resSlider.addEventListener('input', (e) => {
            this.resolution = parseInt(e.target.value);
            this.stripWidth = this.canvas.width / this.resolution;
            document.getElementById('resValue').textContent = e.target.value;
        });

        brightnessSlider.addEventListener('input', (e) => {
            this.brightness = parseFloat(e.target.value);
            document.getElementById('brightnessValue').textContent = this.brightness.toFixed(1);
        });

        sensitivitySlider.addEventListener('input', (e) => {
            this.rotSpeed = parseFloat(e.target.value) * 0.02;
            document.getElementById('sensitivityValue').textContent = e.target.value;
        });
    }

    castRay(angle) {
        let rayX = Math.cos(angle);
        let rayY = Math.sin(angle);
        let distance = 0;
        let hitX = this.playerX;
        let hitY = this.playerY;

        while (distance < this.maxDistance) {
            hitX = this.playerX + rayX * distance;
            hitY = this.playerY + rayY * distance;

            const mapX = Math.floor(hitX);
            const mapY = Math.floor(hitY);

            // Check if ray hit a wall
            if (mapX < 0 || mapX >= this.mapWidth || mapY < 0 || mapY >= this.mapHeight) {
                break;
            }

            if (this.map[mapY][mapX] === 1) {
                return {
                    distance: distance,
                    hitX: hitX,
                    hitY: hitY
                };
            }

            distance += 0.1;
        }

        return {
            distance: this.maxDistance,
            hitX: hitX,
            hitY: hitY
        };
    }

    update(deltaTime) {
        // Move forward/backward
        if (this.keys.ArrowUp) {
            const nextX = this.playerX + Math.cos(this.playerAngle) * this.moveSpeed;
            const nextY = this.playerY + Math.sin(this.playerAngle) * this.moveSpeed;
            if (!this.map[Math.floor(nextY)][Math.floor(nextX)]) {
                this.playerX = nextX;
                this.playerY = nextY;
            }
        }
        if (this.keys.ArrowDown) {
            const nextX = this.playerX - Math.cos(this.playerAngle) * this.moveSpeed;
            const nextY = this.playerY - Math.sin(this.playerAngle) * this.moveSpeed;
            if (!this.map[Math.floor(nextY)][Math.floor(nextX)]) {
                this.playerX = nextX;
                this.playerY = nextY;
            }
        }
            let moved = false;

            // Play footstep sound if moving
            if (moved) {
                const currentTime = Date.now();
                if (currentTime - this.lastStepTime > this.stepInterval) {
                    this.footstepSound.currentTime = 0;
                    this.footstepSound.play();
                    this.lastStepTime = currentTime;
                }
            }
        // Rotate
        if (this.keys.ArrowLeft) {
            this.playerAngle -= this.rotSpeed;
        }
        if (this.keys.ArrowRight) {
            this.playerAngle += this.rotSpeed;
        }
    }

    render() {
        // Clear screen
        this.ctx.fillStyle = '#0f172a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Cast rays and draw walls
        for (let i = 0; i < this.resolution; i++) {
            const rayAngle = this.playerAngle - this.FOV/2 + (i/this.resolution) * this.FOV;
            const ray = this.castRay(rayAngle);
            
            // Fix fisheye effect
            const adjustedDistance = ray.distance * Math.cos(rayAngle - this.playerAngle);
            
            // Calculate wall height
            const wallHeight = (this.canvas.height / adjustedDistance) * 1.5;
            
            // Calculate wall brightness based on distance and brightness setting
            const baseBrightness = Math.min(100 - adjustedDistance * (10 / this.brightness), 60);
            const adjustedBrightness = Math.min(baseBrightness * this.brightness, 90);
            this.ctx.fillStyle = `hsl(217, ${Math.min(24 * this.brightness, 40)}%, ${adjustedBrightness}%)`;
            
            this.ctx.fillRect(
                i * this.stripWidth, 
                (this.canvas.height - wallHeight) / 2,
                this.stripWidth + 1,  // +1 to avoid gaps
                wallHeight
            );
        }
    }

    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        if (!this.isPaused) {
            this.update(deltaTime);
            this.render();
        }

        requestAnimationFrame(this.gameLoop.bind(this));
    }
}

// Expose init function for menu system
window.initFPS = () => {
    // Clean up old instance if it exists
    if (window.currentFPSGame) {
        // Clean up event listeners
        window.removeEventListener('keydown', window.currentFPSGame.handleKeyDown);
        window.removeEventListener('keyup', window.currentFPSGame.handleKeyUp);
    }
    window.currentFPSGame = new FPSGame('fpsCanvas');
};