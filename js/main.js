/* === МАТРИЦА НА ФОНЕ === */
// беру канвас и контекст
const canvas = document.getElementById('matrix-bg');
const ctx = canvas.getContext('2d');

// подгоняю размер под окно
function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
resize();
window.addEventListener('resize', resize);

// символы для падения
const chars = 'アイウエオカキクケコ0123456789';
const size = 14;
let cols = Math.floor(canvas.width / size);
let drops = Array(cols).fill(1);

// делаю некоторые колонки ярче для красоты
let brightCols = [];
for(let i=0; i<cols; i++) {
    if(Math.random() < 0.1) brightCols.push(i);
}

// функция отрисовки. вызывается каждые 50мс
function draw() {
    ctx.fillStyle = 'rgba(10,10,10,0.05)'; // полупрозрачный фон для эффекта следа
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for(let i=0; i<drops.length; i++) {
        const isBright = brightCols.includes(i);
        ctx.fillStyle = isBright ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.3)';
        ctx.font = size + 'px monospace';
        ctx.fillText(chars[Math.floor(Math.random()*chars.length)], i*size, drops[i]*size);
        
        // сброс капли когда дошла до низа + рандом чтоб не все сразу
        if(drops[i]*size > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
    }
}
setInterval(draw, 50);

/* === ЧАСЫ В СТАТУС-БАРЕ === */
function time() {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    const datePart = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
    const timePart = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    document.getElementById('datetime').textContent = `${datePart} // ${timePart}`;
}
time();
setInterval(time, 1000); // обновляю каждую секунду

/* === ЧАСТИЦЫ === */
// создаю div, кидаю в боди, удаляю через 20 сек чтоб не засорять память
function spawnParticle() {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random()*100 + 'vw';
    p.style.animationDuration = (Math.random()*10 + 10) + 's';
    p.style.opacity = Math.random()*0.5;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 20000);
}
setInterval(spawnParticle, 2000); // новая частица каждые 2 сек

/* === ЭФФЕКТ КЛИКА === */
// при клике создаю круг, он расширяется и исчезает
document.addEventListener('click', e => {
    const r = document.createElement('div');
    r.className = 'ripple';
    r.style.left = e.clientX + 'px';
    r.style.top = e.clientY + 'px';
    document.body.appendChild(r);
    setTimeout(() => r.remove(), 600);
});

/* === РАНДОМНЫЙ ГЛИТЧ ЭКРАНА === */
// раз в 8-15 сек слегка сдвигаю экран и меняю оттенок. чисто для атмосферы
function glitch() {
    const t = 100 + Math.random()*200;
    document.body.style.filter = `hue-rotate(${Math.random()*10}deg)`;
    document.body.style.transform = `translate(${(Math.random()-0.5)*2}px, ${(Math.random()-0.5)*2}px)`;
    setTimeout(() => { document.body.style.filter = 'none'; document.body.style.transform = 'none'; }, t);
}
setInterval(glitch, 8000 + Math.random()*7000);

/* === ЛОГИКА ГЛИТЧА ВЫВЕСКИ SAY_GEX === */
// раз в 30 сек буквы s и g гаснут, меняются на g и s, трясутся красным, потом обратно
document.addEventListener('DOMContentLoaded', () => {
    const sign = document.getElementById('neonSign'); // беру всю надпись целиком, чтобы трясти её полностью
    const chars = document.querySelectorAll('.sign-char');
    let isRunning = false; // флаг чтоб анимации не накладывались

    setInterval(() => {
        if (isRunning) return;
        isRunning = true;

        // 1. плавно гашу целевые буквы
        chars.forEach(el => el.classList.add('off'));

        setTimeout(() => {
            // 2. меняю текст + включаю красный режим + ВКЛЮЧАЮ ЖИРНЫЙ ГЛИТЧ НА ВСЮ СТРОКУ
            chars.forEach(el => el.textContent = el.dataset.g);
            chars.forEach(el => el.classList.remove('off'));
            chars.forEach(el => el.classList.add('error'));
            sign.classList.add('sign-glitching'); // <<< тут начинается RGB-сплит и тряска

            // 3. через 2.5 сек возвращаю всё как было
            setTimeout(() => {
                chars.forEach(el => el.classList.add('off'));
                
                setTimeout(() => {
                    chars.forEach(el => el.textContent = el.dataset.n);
                    chars.forEach(el => el.classList.remove('off', 'error'));
                    sign.classList.remove('sign-glitching'); // <<< глитч выключаю, возвращаю спокойный режим
                    isRunning = false;
                }, 300);
            }, 2500); // сколько висит "ошибка"
        }, 350); // время на затухание
    }, 30000); // интервал запуска
});