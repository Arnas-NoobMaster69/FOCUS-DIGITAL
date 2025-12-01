// --- 1. SETUP LIBRARIES ---
gsap.registerPlugin(ScrollTrigger);

// --- 2. SMOOTH SCROLL (LENIS) ---
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    mouseMultiplier: 0.6, // Мягкий скролл
    smoothTouch: false,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);


// --- 3. PRELOADER & INITIAL ANIMATIONS ---
const tlLoader = gsap.timeline({
    paused: true,
    onComplete: () => {
        // Убираем прелоадер и запускаем анимации HERO
        document.querySelector('.loader').style.pointerEvents = 'none';
        
        // Hero Text Reveal (Kinetic Typography)
        gsap.to('.split-text', {
            y: "0%",
            duration: 1.2,
            stagger: 0.15,
            ease: "power4.out",
        });
        
        // Hero Footer Fade In
        gsap.from('.fade-in', {
            opacity: 0,
            y: 20,
            duration: 1,
            ease: "power2.out",
            stagger: 0.15,
        }, "-=0.8");
    }
});

// Анимация текста в прелоадере
tlLoader.from('.loader-text', {
    y: "100%",
    stagger: 0.1,
    duration: 1,
    ease: "power3.out"
}, 0.2)
// Анимация прогресса
.to('.loader-progress', {
    width: "100%",
    duration: 1.5,
    ease: "power2.inOut"
}, 0)
// Убираем прелоадер
.to('.loader', {
    y: "-100%",
    duration: 1,
    ease: "power3.inOut"
}, 1.5);

// Имитация загрузки для запуска анимации
setTimeout(() => {
    tlLoader.play();
}, 500);


// --- 4. GSAP SCROLL TRIGGERS ---

// Parallax/Scale effect on the Separator
gsap.to(".parallax-sep", {
    scrollTrigger: {
        trigger: ".parallax-sep",
        start: "top bottom",
        end: "bottom top",
        scrub: 0.5,
    },
    y: 100, // Сдвиг для эффекта параллакса
    scale: 1.1 // Небольшое увеличение для глубины
});


// Parallax on Stat Cards
gsap.utils.toArray('.stat-card').forEach(card => {
    const speed = parseFloat(card.dataset.speed);
    
    gsap.from(card, {
        y: 100 * (speed - 1), // Сдвиг в зависимости от data-speed
        opacity: 0,
        scrollTrigger: {
            trigger: card,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
        }
    });
});

// Simple Fade-In for Section Titles
gsap.utils.toArray('.section-title').forEach(title => {
    gsap.from(title, {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
            trigger: title,
            start: "top 90%",
            toggleActions: "play none none reverse"
        }
    });
});

// --- 5. THREE.JS (DIGITAL TERRAIN / LANDSCAPE) ---

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
    alpha: true, 
    antialias: true,
    canvas: document.getElementById('webgl').appendChild(document.createElement('canvas'))
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Геометрия: Плоскость с высокой детализацией
const planeSize = 30;
const segments = 64; 
const geometry = new THREE.PlaneGeometry(planeSize, planeSize, segments, segments);

// Материал: Базовый Mesh с Wireframe и неоновым цветом
const material = new THREE.MeshBasicMaterial({
    color: 0xFF4D00, // Accent color
    wireframe: true,
    transparent: true,
    opacity: 0.2
});

const mesh = new THREE.Mesh(geometry, material);
mesh.rotation.x = -Math.PI * 0.5; // Поворот, чтобы лежала горизонтально
scene.add(mesh);

// Камера
camera.position.z = 10;
camera.position.y = 5;
camera.rotation.x = -Math.PI * 0.1;

const clock = new THREE.Clock();
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (event) => {
    // Нормализация координат мыши от -0.5 до 0.5
    mouseX = (event.clientX / window.innerWidth) - 0.5;
    mouseY = (event.clientY / window.innerHeight) - 0.5;
});

function animate3D() {
    requestAnimationFrame(animate3D);

    const elapsedTime = clock.getElapsedTime();
    const positions = geometry.attributes.position.array;
    
    // Анимация вершин (Волны)
    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        
        // Высота (Z-координата) = Волна времени + Небольшой шум
        positions[i + 2] = (
            Math.sin(x * 0.5 + elapsedTime * 0.5) * 0.5 + 
            Math.cos(y * 0.5 + elapsedTime * 0.5) * 0.5
        ) * 0.5; 
    }
    
    geometry.attributes.position.needsUpdate = true;
    
    // Плавное следование камеры за мышью
    const targetX = mouseX * 2;
    const targetY = mouseY * 2;
    
    camera.position.x += (targetX - camera.position.x) * 0.02;
    camera.position.y += (-targetY + 5 - camera.position.y) * 0.02;
    
    renderer.render(scene, camera);
}

animate3D();

// Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


// --- 6. MAGNETIC BUTTON (CTA) ---
const btn = document.querySelector('.btn-main');
if (btn) {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const maxMove = 20; // Максимальное смещение
        
        const moveX = ((x - centerX) / centerX) * maxMove;
        const moveY = ((y - centerY) / centerY) * maxMove;

        gsap.to(btn, {
            x: moveX,
            y: moveY,
            scale: 1.05,
            duration: 0.3,
            ease: "Power2.out"
        });
    });

    btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
            x: 0,
            y: 0,
            scale: 1,
            duration: 0.5,
            ease: "elastic.out(1, 0.5)"
        });
    });
}
