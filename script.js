// --- 1. SETUP LENIS (Плавный скролл) ---
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
});
function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// --- 2. GSAP REGISTRATION ---
gsap.registerPlugin(ScrollTrigger);

// --- 3. CUSTOM CURSOR ---
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    // Dot следует мгновенно
    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;

    // Outline с задержкой (эффект желе)
    cursorOutline.animate({
        left: `${posX}px`,
        top: `${posY}px`
    }, { duration: 500, fill: "forwards" });
});

// --- 4. ANIMATED BACKGROUND (CANVAS BLOB) ---
const canvas = document.getElementById('liquid-canvas');
const ctx = canvas.getContext('2d');
let width, height;

// Настройка размера
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Параметры "капель"
const blobs = [
    { x: width * 0.2, y: height * 0.3, r: 150, dx: 1, dy: 1, color: 'rgba(255, 51, 0, 0.4)' },
    { x: width * 0.8, y: height * 0.7, r: 200, dx: -1.5, dy: -1, color: 'rgba(255, 51, 0, 0.2)' },
    { x: width * 0.5, y: height * 0.5, r: 180, dx: 0.5, dy: -1.5, color: 'rgba(100, 100, 255, 0.1)' }
];

function drawBlobs() {
    ctx.clearRect(0, 0, width, height);
    
    // Эффект размытия для слияния
    ctx.filter = 'blur(60px)';
    
    blobs.forEach(blob => {
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.r, 0, Math.PI * 2);
        ctx.fillStyle = blob.color;
        ctx.fill();
        
        // Движение
        blob.x += blob.dx;
        blob.y += blob.dy;
        
        // Отскок от стен
        if (blob.x < 0 || blob.x > width) blob.dx *= -1;
        if (blob.y < 0 || blob.y > height) blob.dy *= -1;
    });

    requestAnimationFrame(drawBlobs);
}
drawBlobs();

// --- 5. PRELOADER & HERO REVEAL ---
const tlLoader = gsap.timeline();

// Симуляция загрузки
let progress = 0;
const counterElement = document.querySelector('.counter');
const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 10) + 1;
    if (progress > 100) progress = 100;
    counterElement.innerText = `${progress}%`;
    if (progress === 100) clearInterval(interval);
}, 30);

// Анимация после загрузки страницы
window.onload = () => {
    setTimeout(() => {
        tlLoader
            .to('.preloader-text', { opacity: 0, duration: 0.5 })
            .to('.counter', { opacity: 0, duration: 0.5 }, "<")
            .to('.preloader', { y: "-100%", duration: 1.2, ease: "power4.inOut" })
            .from('.hero-title .line span', {
                y: "100%",
                duration: 1.5,
                stagger: 0.1,
                ease: "power4.out"
            }, "-=0.5")
            .from('.header', { opacity: 0, y: -20, duration: 1 }, "-=1");
    }, 1500); // Небольшая задержка чтобы увидеть 100%
};

// --- 6. SCROLL ANIMATIONS ---

// Pinning Philosophy Section
const items = document.querySelectorAll('.ph-item');
items.forEach((item, index) => {
    ScrollTrigger.create({
        trigger: item,
        start: "top center",
        end: "bottom center",
        onEnter: () => item.classList.add('active'),
        onLeave: () => item.classList.remove('active'),
        onEnterBack: () => item.classList.add('active'),
        onLeaveBack: () => item.classList.remove('active')
    });
});

// Work Images Hover Effect (для курсора)
const workItems = document.querySelectorAll('.work-item');
workItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
        cursorOutline.style.width = '80px';
        cursorOutline.style.height = '80px';
        cursorOutline.style.borderColor = '#FF3300';
    });
    item.addEventListener('mouseleave', () => {
        cursorOutline.style.width = '40px';
        cursorOutline.style.height = '40px';
        cursorOutline.style.borderColor = 'rgba(255,255,255,0.3)';
    });
});

// CTA Reveal
gsap.from(".cta-title span", {
    scrollTrigger: {
        trigger: ".cta",
        start: "top 70%",
    },
    y: 100,
    opacity: 0,
    duration: 1,
    stagger: 0.2,
    ease: "power3.out"
});
