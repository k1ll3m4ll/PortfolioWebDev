document.addEventListener("DOMContentLoaded", function () {
    const links = document.querySelectorAll("nav ul li a");
    const currentUrl = window.location.href;

    links.forEach(link => {
        if (link.href === currentUrl) {
            link.classList.add("active");
        }
    });
});




const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Dino-Bild laden
const dinoImage = document.getElementById('dinoImage');

//Skalierungsfaktor auf Basis der Canvas-Größe
const scaleX = canvas.width / 800;
const scaleY = canvas.height / 200;

// Dino-Eigenschaften
const dino = {
    x: 50*scaleX,
    y: 160 * scaleY,
    width: 20 * scaleX,
    height: 20 * scaleY,
    color: 'black',
    gravity: 0.6*scaleY,
    jumpStrength: -10 * scaleY,
    velocityY: 0 * scaleY,
    isJumping: false
};

// Hindernis-Eigenschaften
const obstacles = [];
const obstacleWidth = 20* scaleX;
const obstacleHeight = 20 * scaleY;
let obstacleFrequency = 120; // Häufigkeit neuer Hindernisse
let frameCount = 0;
let gameSpeed = 3;

// Spielstatus
let isGameOver = false;
let isGameRunning = false; // Zustand des Spiels (gestartet/pausiert)
let score = 0;

// Zeichnet den Dino als Bild innerhalb der Hitbox
function drawDino() {
    // Bild an der Position des Dinos innerhalb der Hitbox zeichnen
    ctx.drawImage(dinoImage, dino.x, dino.y, dino.width, dino.height);
}

// Zeichnet die Hindernisse
function drawObstacles() {
    ctx.fillStyle = 'darkgray';
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

// Aktualisiert die Position des Dinos und lässt ihn springen
function updateDino() {
    if (dino.isJumping) {
        dino.velocityY += dino.gravity;
        dino.y += dino.velocityY;

        // Stoppt den Sprung, wenn der Dino den Boden erreicht
        if (dino.y >= 160) {
            dino.y = 160;
            dino.isJumping = false;
            dino.velocityY = 0;
        }
    }
}

// Erzeugt neue Hindernisse
function generateObstacles() {
    if (frameCount % obstacleFrequency === 0) {
        obstacles.push({
            x: canvas.width,
            y: 160* scaleY,
            width: obstacleWidth,
            height: obstacleHeight
        });
    }
    frameCount++;
}

// Bewegt die Hindernisse und entfernt sie, wenn sie den linken Rand erreichen
function updateObstacles() {
    obstacles.forEach((obstacle, index) => {
        obstacle.x -= gameSpeed;

        // Entfernt das Hindernis, wenn es aus dem Bild verschwindet
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(index, 1);
            score++; // Erhöht den Score für jedes überwundene Hindernis
        }
    });
}

// Überprüft die Kollision zwischen Dino und Hindernissen
function checkCollision() {
    for (let obstacle of obstacles) {
        if (
            dino.x < obstacle.x + obstacle.width &&
            dino.x + dino.width > obstacle.x &&
            dino.y < obstacle.y + obstacle.height &&
            dino.y + dino.height > obstacle.y
        ) {
            isGameOver = true;
        }
    }
}

// Zeichnet den Punktestand
function drawScore() {
    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.fillText('Score: ' + score, 10, 20);
}

// Hauptspielschleife
function gameLoop() {
    if (isGameOver) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'red';
        ctx.font = '20px Arial';
        ctx.fillText('Game Over! Dein Score: ' + score, canvas.width / 2 - 80, canvas.height / 2);
        return;
    }

    if (isGameRunning) {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Canvas löschen
        drawDino();
        drawObstacles();
        drawScore();

        updateDino();
        generateObstacles();
        updateObstacles();
        checkCollision();

        requestAnimationFrame(gameLoop);
    } else {
        requestAnimationFrame(gameLoop); // Bleibt im Loop für Pause/Unpause
    }
}

// Steuerung: Leertaste oder Pfeiltaste „nach oben“ zum Springen
document.addEventListener('keydown', (e) => {
    if ((e.code === 'Space' || e.code === 'ArrowUp') && !dino.isJumping && isGameRunning) {
        dino.isJumping = true;
        dino.velocityY = dino.jumpStrength;
    } else if (e.code === 'KeyP') {
        // Pause-Funktion mit Taste "P"
        isGameRunning = !isGameRunning;
        if (isGameRunning) gameLoop(); // Spiel wieder aufnehmen
    }
});

// Startet das Spiel beim Klicken auf den Play-Button
document.getElementById('playButton').addEventListener('click', () => {
    if (!isGameRunning && !isGameOver) {
        isGameRunning = true;
        gameLoop();
    }
});
