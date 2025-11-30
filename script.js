// GSAP Plugins Registration
gsap.registerPlugin(ScrollTrigger);

// 1. LENIS - Инициализация инерционного скроллинга
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Более плавный ease
    direction: 'vertical',
    smoothTouch: false, // Отключаем на тач-устройствах для лучшей производительности
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// 2. PRELOADER - Фикс и Анимация загрузки
function initPreloader() {
    lenis.stop(); // Останавливаем скролл на время загрузки
    const tl = gsap.timeline({
        onComplete: () => {
            document.querySelector('.preloader').style.display = 'none';
            lenis.start(); // Запускаем скролл после загрузки
            initHeroAnimation(); // Запускаем анимацию HERO
            initScrollAnimations(); // Запускаем анимации при прокрутке
        }
    });

    // Анимация текста
    tl.to(".loader-text span", {
        y: "0%",
        duration: 0.8,
        stagger: 0.05,
        ease: "power3.out"
    })
    .to(".loader-text span", {
        y: "-100%",
        duration: 0.8,
        stagger: 0.05,
        ease: "power3.in",
        delay: 0.5
    })
    // Исчезновение прелоадера
    .to(".preloader", {
        opacity: 0,
        duration: 0.5,
        ease: "power1.in"
    });
}
window.onload = initPreloader;


// 3. HERO АНИМАЦИЯ (Отдельная функция, запускается после прелоадера)
function initHeroAnimation() {
    // Анимация заголовка (вылет по строкам)
    gsap.to(".hero-title .line-reveal span", {
        y: "0%",
        duration: 1.5,
        stagger: 0.15,
        ease: "power4.out"
    });

    // Анимация субтекста
    gsap.from(".hero-subtext", {
        y: 20,
        opacity: 0,
        duration: 1,
        ease: "power2.out",
        delay: 0.5
    });
    
    // Mouse Parallax Effect (для анимированного объекта)
    document.addEventListener("mousemove", (e) => {
        const shape = document.querySelector('.placeholder-shape');
        if (shape) {
            const x = (e.clientX / window.innerWidth - 0.5) * 40; // max 40px move
            const y = (e.clientY / window.innerHeight - 0.5) * 40;
            gsap.to(shape, {
                x: -x,
                y: -y,
                rotation: x / 5,
                duration: 0.5,
                ease: "power2.out"
            });
        }
    });
}

// 4. SCROLLTRIGGER АНИМАЦИИ (Самый сложный эффект)
function initScrollAnimations() {

    // Эффект PINNED NARRATIVE (как Refokus/Obys)
    const pinTextElements = document.querySelectorAll('.pin-text');
    const narrativeSection = document.querySelector('.pin-narrative-section');

    ScrollTrigger.create({
        trigger: narrativeSection,
        start: "top top",
        end: "bottom bottom", // Прикрепляем секцию на всю ее высоту
        pin: true,
        scrub: 1,
        // markers: true, // Раскомментируй для дебага
    });

    // Анимация текста при прокрутке
    pinTextElements.forEach((text, index) => {
        const startPoint = (index * 100) + 10;
        const endPoint = startPoint + 80;

        ScrollTrigger.create({
            trigger: narrativeSection,
            start: `${startPoint}px top`,
            end: `${endPoint}px top`,
            scrub: 1,
            // markers: true, // Раскомментируй для дебага
            onUpdate: (self) => {
                // Если текст в фокусе, делаем его жирным и видимым
                const progress = self.progress;
                if (progress > 0 && progress < 1) {
                    text.style.opacity = 1;
                    text.style.color = 'var(--text-light)';
                    text.style.transform = `scale(1.02)`;
                } else if (progress >= 1) {
                    text.style.opacity = 0.3;
                    text.style.color = 'var(--text-muted)';
                    text.style.transform = `scale(1)`;
                } else {
                    text.style.opacity = 0.1;
                    text.style.color = 'var(--text-muted)';
                    text.style.transform = `scale(1)`;
                }
            }
        });
    });

    // Общая анимация появления блоков
    gsap.utils.toArray('.service-card').forEach((card, i) => {
        gsap.from(card, {
            y: 50,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: card,
                start: "top 90%",
                toggleActions: "play none none reverse",
            }
        });
    });

    // Анимация финального CTA
    gsap.from(".cta-line-1", {
        x: -200,
        opacity: 0,
        scrollTrigger: {
            trigger: ".final-cta",
            start: "top 80%",
            end: "top 50%",
            scrub: 1,
        }
    });
    gsap.from(".cta-line-2", {
        x: 200,
        opacity: 0,
        scrollTrigger: {
            trigger: ".final-cta",
            start: "top 80%",
            end: "top 50%",
            scrub: 1,
        }
    });
}
