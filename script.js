const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 400; canvas.height = 600;

let gameActive = false;
let score = 0;
let speed = 5;
let obstacles = [];
let roadOffset = 0;
let frameCount = 0;

const player = { x: 175, y: 480, w: 45, h: 85, color: #ff4757 };
const keys = {};

window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

function startGame() {
    score = 0; speed = 5; obstacles = []; gameActive = true;
    document.querySelectorAll('.overlay').forEach(el => el.classList.add('hidden'));
    loop();
}

function spawnObject() {
    const isPoint = Math.random() < 0.2;
    obstacles.push({
        x: Math.random() * (canvas.width - 50),
        y: -100, w: isPoint ? 25 : 45, h: isPoint ? 25 : 85,
        type: isPoint ? 'point' : 'car',
        // Màu xanh lá cho vật phẩm, màu xám/trắng cho xe địch
        color: isPoint ? '#2ecc71' : `hsl(0, 0%, ${Math.random() * 50 + 40}%)`
    });
}

function update() {
    if (!gameActive) return;

    roadOffset = (roadOffset + speed) % 50;
    if (keys['ArrowLeft'] && player.x > 15) player.x -= 8;
    if (keys['ArrowRight'] && player.x < canvas.width - player.w - 15) player.x += 8;

    speed = 5 + Math.floor(score / 800);

    if (frameCount % Math.max(15, 80 - speed * 2) === 0) spawnObject();

    obstacles.forEach((obj, i) => {
        obj.y += speed;
        
        // Va chạm
        if (player.x < obj.x + obj.w && player.x + player.w > obj.x &&
            player.y < obj.y + obj.h && player.y + player.h > obj.y) {
            if (obj.type === 'car') {
                gameActive = false;
                document.getElementById('game-over-screen').classList.remove('hidden');
                document.getElementById('final-score').innerText = `SCORE: ${score}`;
            } else {
                score += 150; // Ăn điểm xanh
                obstacles.splice(i, 1);
            }
        }

        if (obj.y > canvas.height) {
            obstacles.splice(i, 1);
            if (obj.type === 'car') score += 10;
        }
    });

    document.getElementById('current-score').innerText = score;
    frameCount++;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Đường đi (Màu xám tối)
    ctx.fillStyle = "#1a1a1a"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Vạch kẻ đường trắng (Thay cho màu vàng)
    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 4; ctx.setLineDash([30, 25]);
    ctx.lineDashOffset = -roadOffset;
    ctx.beginPath(); ctx.moveTo(canvas.width/2, 0); ctx.lineTo(canvas.width/2, canvas.height);
    ctx.stroke();

    // Vạch lề đường (Cyan neon nhẹ)
    ctx.setLineDash([]);
    ctx.strokeStyle = "#00d4ff22";
    ctx.strokeRect(10, -10, canvas.width-20, canvas.height+20);

    // Vẽ người chơi (Xe Đỏ)
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.w, player.h);
    // Đèn xe xanh điện (Cyan)
    ctx.fillStyle = "#00d4ff";
    ctx.fillRect(player.x + 5, player.y, 8, 4);
    ctx.fillRect(player.x + player.w - 13, player.y, 8, 4);

    // Vẽ chướng ngại vật & Điểm
    obstacles.forEach(obj => {
        ctx.fillStyle = obj.color;
        if (obj.type === 'point') {
            ctx.beginPath(); ctx.arc(obj.x + obj.w/2, obj.y + obj.h/2, obj.w/2, 0, Math.PI*2); ctx.fill();
        } else {
            ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
        }
    });
}

function loop() {
    if (!gameActive) return;
    update(); draw();
    requestAnimationFrame(loop);
}
