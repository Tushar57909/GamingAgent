// game.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const width = canvas.width;
const height = canvas.height;

// Player ship
const player = {
    x: width / 2,
    y: height - 50,
    width: 40,
    height: 20,
    speed: 5,
    color: 'white'
};

let keys = {};
let bullets = [];
let enemies = [];
let enemySpawnTimer = 0;
let score = 0;
let gameOver = false;

// Input handling
window.addEventListener('keydown', e => { keys[e.code] = true; });
window.addEventListener('keyup', e => { keys[e.code] = false; });

function spawnEnemy() {
    const size = 30;
    const x = Math.random() * (width - size);
    enemies.push({ x, y: -size, size, speed: 2 + Math.random() * 1.5, color: 'red' });
}

function update() {
    if (gameOver) return;
    // Player movement
    if (keys['ArrowLeft'] && player.x - player.speed > 0) player.x -= player.speed;
    if (keys['ArrowRight'] && player.x + player.width + player.speed < width) player.x += player.speed;
    // Shooting
    if (keys['Space']) {
        // limit fire rate
        if (!player.lastShot || Date.now() - player.lastShot > 300) {
            bullets.push({ x: player.x + player.width / 2, y: player.y, radius: 4, speed: 7, color: 'yellow' });
            player.lastShot = Date.now();
        }
    }
    // Update bullets
    bullets.forEach(b => b.y -= b.speed);
    bullets = bullets.filter(b => b.y > -b.radius);
    // Spawn enemies
    enemySpawnTimer++;
    if (enemySpawnTimer > 60) { // roughly one per second at 60fps
        spawnEnemy();
        enemySpawnTimer = 0;
    }
    // Update enemies
    enemies.forEach(e => e.y += e.speed);
    // Collision detection
    enemies = enemies.filter(e => {
        // Check collision with player
        if (e.x < player.x + player.width && e.x + e.size > player.x &&
            e.y < player.y + player.height && e.y + e.size > player.y) {
            gameOver = true;
            return false;
        }
        // Check collision with bullets
        for (let i = 0; i < bullets.length; i++) {
            const b = bullets[i];
            const dx = b.x - (e.x + e.size / 2);
            const dy = b.y - (e.y + e.size / 2);
            const distance = Math.hypot(dx, dy);
            if (distance < b.radius + e.size / 2) {
                // remove bullet
                bullets.splice(i, 1);
                score += 10;
                return false; // destroy enemy
            }
        }
        // Remove if off screen
        if (e.y > height) {
            gameOver = true;
            return false;
        }
        return true;
    });
}

function draw() {
    // Clear
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);
    // Draw player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    // Draw bullets
    bullets.forEach(b => {
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
    });
    // Draw enemies
    enemies.forEach(e => {
        ctx.fillStyle = e.color;
        ctx.fillRect(e.x, e.y, e.size, e.size);
    });
    // Draw score
    ctx.fillStyle = 'white';
    ctx.font = '20px sans-serif';
    ctx.fillText('Score: ' + score, 10, 30);
    // Game over
    if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = 'red';
        ctx.font = '48px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', width / 2, height / 2);
        ctx.font = '24px sans-serif';
        ctx.fillText('Final Score: ' + score, width / 2, height / 2 + 40);
    }
}

function loop() {
    update();
    draw();
    if (!gameOver) requestAnimationFrame(loop);
}

// Start the game
requestAnimationFrame(loop);
