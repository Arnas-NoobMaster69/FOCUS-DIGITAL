// --- 1. SETUP SMOOTH SCROLL (LENIS) ---
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false, // Важно для мобильных, чтобы не было "тягучести"
    touchMultiplier: 2,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// --- 2. THREE.JS BACKGROUND (Abstract Wireframe) ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

// Оптимизация для ретины и мобилок (чтобы не лагало)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); 
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Геометрия: Икосаэдр (сфера из треугольников)
const geometry = new THREE.IcosahedronGeometry(2, 2); // Радиус 2, детализация 2
const material = new THREE.MeshBasicMaterial({ 
    color: 0x4d4dff, // Accent color
    wireframe: true,
    transparent: true,
    opacity: 0.3
});
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

camera.position.z = 5;

// Анимация вращения и искажения
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
});

// Анимация 3D
const clock = new THREE.Clock();

function animateThree() {
    targetX = mouseX * 0.001;
    targetY = mouseY * 0.001;

    // Плавное следование за мышью
    sphere.rotation.y += 0.05 * (targetX - sphere.rotation.y);
    sphere.rotation.x += 0.05 * (targetY - sphere.rotation.x);
    
    // Постоянное вращение
    sphere.rotation.z += 0.002;

    // Пульсация (Scale)
    const time = clock.getElapsedTime();
    const scale = 1 + Math.sin(time) * 0.05;
    sphere.scale.set(scale, scale, scale);

    renderer.render(scene, camera);
    requestAnimationFrame(animateThree);
}
animateThree();

// Ресайз окна
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


// --- 3. GSAP ANIMATIONS ---
gsap.registerPlugin(ScrollTrigger);

// Анимация появления текста в Hero
const tlHero = gsap.timeline();
tlHero.to('.hero-title .line span', {
    y: "0%",
    duration: 1.2,
    stagger: 0.15,
    ease: "power4.out",
    delay: 0.2
})
.from('.hero-sub', {
    opacity: 0,
    y: 20,
    duration: 1
}, "-=0.5");

// Горизонтальный скролл (ТОЛЬКО ДЛЯ ПК)
// На мобильных CSS делает flex-direction: column, поэтому отключаем триггер там
if (window.innerWidth > 768) {
    const races = document.querySelector(".projects-track");
    
    function getScrollAmount() {
        let racesWidth = races.scrollWidth;
        return -(racesWidth - window.innerWidth);
    }

    const tween = gsap.to(races, {
        x: getScrollAmount,
        duration: 3,
        ease: "none",
    });

    ScrollTrigger.create({
        trigger: ".horizontal-scroll-wrapper",
        start: "top 20%",
        end: () => `+=${getScrollAmount() * -1}`,
        pin: true,
        animation: tween,
        scrub: 1,
        invalidateOnRefresh: true,
        // markers: true // Для отладки
    });
}

// Анимация появления элементов при скролле
gsap.utils.toArray('.service-item').forEach(item => {
    gsap.from(item, {
        y: 50,
        opacity: 0,
        duration: 1,
        scrollTrigger: {
            trigger: item,
            start: "top 90%",
            toggleActions: "play none none reverse"
        }
    });
});

// Магнитный курсор (простая реализация)
const cursor = document.querySelector('.cursor');

document.addEventListener('mousemove', (e) => {
    gsap.to(cursor, {
        x: e.clientX - 10,
        y: e.clientY - 10,
        duration: 0.1,
        ease: "power2.out"
    });
});

// Ховер эффекты для ссылок (увеличение курсора)
const links = document.querySelectorAll('a, .project-card, .service-item');
links.forEach(link => {
    link.addEventListener('mouseenter', () => {
        gsap.to(cursor, { scale: 3, duration: 0.3 });
    });
    link.addEventListener('mouseleave', () => {
        gsap.to(cursor, { scale: 1, duration: 0.3 });
    });
});
