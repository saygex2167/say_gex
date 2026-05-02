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

/* === ЛОГИКА ВЫВЕСКИ SAY_GEX === */
// раз в 30 сек имитация просадки напряжения + смена буфера терминала
document.addEventListener('DOMContentLoaded', () => {
    const sign = document.getElementById('neonSign');
    const chars = document.querySelectorAll('.sign-char');
    let isRunning = false;

    setInterval(() => {
        if (isRunning) return;
        isRunning = true;

        // 1. включаем режим "обрыв сигнала" (просадка + сканлайн)
        sign.classList.add('signal-break');

        // 2. гасим целевые буквы (имитация разряда конденсаторов)
        setTimeout(() => {
            chars.forEach(el => el.classList.add('off'));
        }, 80);

        // 3. в пике просадки меняем текст (буфер терминала)
        setTimeout(() => {
            chars.forEach(el => el.textContent = el.dataset.g);
            chars.forEach(el => el.classList.remove('off'));
            chars.forEach(el => el.classList.add('active-swap'));
        }, 180);

        // 4. восстановление (фосфорное послесвечение + снятие глитча)
        setTimeout(() => {
            chars.forEach(el => el.classList.add('off'));
        }, 280);

        setTimeout(() => {
            chars.forEach(el => el.textContent = el.dataset.n);
            chars.forEach(el => el.classList.remove('off', 'active-swap'));
            sign.classList.remove('signal-break');
            isRunning = false;
        }, 380);
    }, 30000);
});

/* === АУДИОПЛЕЕР + ФОНОВАЯ МУЗЫКА === */
// цепляю элементы плеера и аудио-тег
const audio = document.getElementById('bg-audio');
const playBtn = document.getElementById('player-play-btn');
const progressWrap = document.getElementById('progress-wrap');
const progressBar = document.getElementById('player-progress');
const timeDisplay = document.getElementById('player-time');

let audioStarted = false;
audio.volume = 0; // стартую с тишины для плавного входа

// форматирую секунды в 00:00
function formatTime(sec) {
    if (isNaN(sec)) return '00:00';
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

// обновляю прогресс и таймер
audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        const pct = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = pct + '%';
        timeDisplay.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
    }
});

// клик по кнопке плей/пауза
playBtn.addEventListener('click', () => {
    if (!audioStarted) {
        audioStarted = true;
        audio.play().catch(() => {});
        playBtn.textContent = '[ ■ ]';
        playBtn.classList.add('active');
        fadeInAudio();
    } else {
        if (audio.paused) {
            audio.play();
            playBtn.textContent = '[ ■ ]';
            playBtn.classList.add('active');
            fadeInAudio();
        } else {
            fadeOutAudio(() => {
                audio.pause();
                playBtn.textContent = '[ ▶ ]';
                playBtn.classList.remove('active');
            });
        }
    }
});

// клик по прогресс-бару (перемотка)
progressWrap.addEventListener('click', (e) => {
    if (!audio.duration) return;
    const rect = progressWrap.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    audio.currentTime = pct * audio.duration;
});

// первый клик в любом месте сайта (обход блокировки автоплея)
document.addEventListener('click', () => {
    if (!audioStarted) {
        audioStarted = true;
        audio.play().catch(() => {});
        playBtn.textContent = '[ ■ ]';
        playBtn.classList.add('active');
        fadeInAudio();
    }
}, { once: true });

// плавное нарастание до 25% громкости
function fadeInAudio() {
    let vol = 0;
    const interval = setInterval(() => {
        if (vol < 0.25) { vol += 0.01; audio.volume = vol; }
        else { clearInterval(interval); }
    }, 50);
}

// плавное затухание перед паузой
function fadeOutAudio(callback) {
    let vol = audio.volume;
    const interval = setInterval(() => {
        if (vol > 0) { vol -= 0.01; audio.volume = Math.max(0, vol); }
        else { clearInterval(interval); callback(); }
    }, 50);
}
