/**
 * =======================================================================
 * PREMIUM ROMANTIC EXPERIENCE - CORE LOGIC
 * Architecture: Vanilla JS, Highly Modular, Spring Physics, Canvas Particles
 * =======================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    initGlobalSystems();
    initPageRouting();
});

/* =======================================================================
   GLOBAL SYSTEMS (Cursor, Music, Page Transitions)
   ======================================================================= */
function initGlobalSystems() {
    // 1. Custom Cursor
    const cursor = document.querySelector(".custom-cursor");
    const follower = document.querySelector(".custom-cursor-follower");
    const interactives = document.querySelectorAll(".interactive");

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX, cursorY = mouseY;
    let followerX = mouseX, followerY = mouseY;

    document.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        // Smooth easing for cursor and follower
        cursorX += (mouseX - cursorX) * 0.5;
        cursorY += (mouseY - cursorY) * 0.5;
        followerX += (mouseX - followerX) * 0.15;
        followerY += (mouseY - followerY) * 0.15;

        cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
        follower.style.transform = `translate(${followerX}px, ${followerY}px)`;
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    interactives.forEach(el => {
        el.addEventListener("mouseenter", () => {
            cursor.classList.add("hover");
            follower.classList.add("hover");
        });
        el.addEventListener("mouseleave", () => {
            cursor.classList.remove("hover");
            follower.classList.remove("hover");
        });
    });

    // 2. Music Player (Seamless across pages via SessionStorage)
    const bgMusic = document.getElementById("bg-music");
    const playPauseBtn = document.getElementById("play-pause-btn");
    const volumeSlider = document.getElementById("volume-slider");
    const iconPlay = document.getElementById("icon-play");
    const iconPause = document.getElementById("icon-pause");

    // Restore state
    const savedTime = sessionStorage.getItem("musicTime") || 0;
    const isPlaying = sessionStorage.getItem("musicPlaying") === "true";
    const savedVolume = sessionStorage.getItem("musicVolume") || 0.5;

    bgMusic.currentTime = parseFloat(savedTime);
    bgMusic.volume = parseFloat(savedVolume);
    volumeSlider.value = savedVolume;

    // We must wait for interaction to play if not allowed by browser, 
    // but if it was playing previously, attempt play.
    if (isPlaying) {
        bgMusic.play().then(() => updatePlayState(true)).catch(() => updatePlayState(false));
    }

    playPauseBtn.addEventListener("click", () => {
        if (bgMusic.paused) {
            bgMusic.play();
            updatePlayState(true);
        } else {
            bgMusic.pause();
            updatePlayState(false);
        }
    });

    volumeSlider.addEventListener("input", (e) => {
        bgMusic.volume = e.target.value;
        sessionStorage.setItem("musicVolume", e.target.value);
    });

    function updatePlayState(playing) {
        sessionStorage.setItem("musicPlaying", playing);
        if (playing) {
            iconPlay.style.display = "none";
            iconPause.style.display = "block";
        } else {
            iconPlay.style.display = "block";
            iconPause.style.display = "none";
        }
    }

    // Save time constantly so page transitions are seamless
    setInterval(() => {
        if(!bgMusic.paused) sessionStorage.setItem("musicTime", bgMusic.currentTime);
    }, 500);

    // 3. Page Transition In
    setTimeout(() => {
        const overlay = document.getElementById("transition-overlay");
        overlay.classList.remove("active");
    }, 100);
}

// Global function to navigate with cinematic fade
function navigateCinematic(url, flash = false) {
    const overlay = document.getElementById("transition-overlay");
    if (flash) {
        overlay.classList.add("flash");
        setTimeout(() => window.location.href = url, 1500);
    } else {
        overlay.classList.add("active");
        setTimeout(() => window.location.href = url, 1000);
    }
}

/* =======================================================================
   ROUTING
   ======================================================================= */
function initPageRouting() {
    const bodyId = document.body.id;
    if (bodyId === "page1") initPage1();
    if (bodyId === "page2") initPage2();
    if (bodyId === "page3") initPage3();
}

/* =======================================================================
   PARTICLE ENGINE (CANVAS) - High Performance 60FPS
   ======================================================================= */
class ParticleSystem {
    constructor(type) {
        this.canvas = document.getElementById("particle-canvas");
        this.ctx = this.canvas.getContext("2d");
        this.particles = [];
        this.type = type; // 'space', 'fireflies', 'sparkles'
        this.resize();
        window.addEventListener("resize", () => this.resize());
        this.createParticles();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        const count = this.type === 'space' ? 100 : (this.type === 'fireflies' ? 60 : 120);
        for (let i = 0; i < count; i++) {
            this.particles.push(this.createParticle());
        }
    }

    createParticle() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            size: Math.random() * (this.type === 'fireflies' ? 3 : 2) + 0.5,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * (this.type === 'space' ? 0.2 : 0.8),
            alpha: Math.random(),
            pulseRate: Math.random() * 0.02 + 0.01,
            color: this.getParticleColor()
        };
    }

    getParticleColor() {
        if (this.type === 'fireflies') return `255, 215, 0`; 
        if (this.type === 'sparkles') return Math.random() > 0.5 ? '255, 182, 193' : '255, 255, 255'; 
        return Math.random() > 0.5 ? '183, 110, 121' : '255, 255, 255'; 
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha += p.pulseRate;

            if (p.alpha > 1 || p.alpha < 0.1) p.pulseRate *= -1;

            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${p.color}, ${Math.abs(p.alpha)})`;
            if(this.type === 'fireflies') {
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = `rgba(${p.color}, 1)`;
            } else {
                this.ctx.shadowBlur = 0;
            }
            this.ctx.fill();
        });
        requestAnimationFrame(() => this.animate());
    }

    explode(x, y) {
        for(let i=0; i<100; i++) {
            this.particles.push({
                x: x, y: y,
                size: Math.random() * 4 + 1,
                vx: (Math.random() - 0.5) * 15,
                vy: (Math.random() - 0.5) * 15,
                alpha: 1,
                pulseRate: -0.02,
                color: '255, 182, 193'
            });
        }
    }
}

/* =======================================================================
   PAGE 1 LOGIC (The Escaping "No" Button)
   ======================================================================= */
function initPage1() {
    const particleSys = new ParticleSystem('space');
    
    const yesBtn = document.getElementById('btn-yes');
    const noBtn = document.getElementById('btn-no');

    // Make the NO button glide to a new position when the mouse gets close
    noBtn.addEventListener('mouseenter', moveNoButton);
    noBtn.addEventListener('touchstart', moveNoButton); // Make it work on mobile too

    function moveNoButton() {
        // Apply smooth transition for the jump
        noBtn.style.position = 'fixed';
        noBtn.style.transition = 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
        noBtn.style.margin = '0';

        const padding = 50; // Keep it away from edges
        const yesRect = yesBtn.getBoundingClientRect();
        const btnW = noBtn.offsetWidth || 120;
        const btnH = noBtn.offsetHeight || 55;
        
        let validPosition = false;
        let attempts = 0;
        let targetX, targetY;

        // Loop until we find a spot that doesn't overlap the YES button
        while(!validPosition && attempts < 100) {
            let rx = Math.random() * (window.innerWidth - btnW - padding * 2) + padding;
            let ry = Math.random() * (window.innerHeight - btnH - padding * 2) + padding;
            
            // Check intersection with Yes button (Adding padding so it doesn't get too close to Yes)
            if (rx < yesRect.right + padding && rx + btnW > yesRect.left - padding &&
                ry < yesRect.bottom + padding && ry + btnH > yesRect.top - padding) {
                attempts++;
                continue;
            }
            targetX = rx;
            targetY = ry;
            validPosition = true;
        }

        // Apply new coordinates
        noBtn.style.left = `${targetX}px`;
        noBtn.style.top = `${targetY}px`;
    }

    // Yes Button Magic Transition
    yesBtn.addEventListener('click', (e) => {
        const rect = yesBtn.getBoundingClientRect();
        particleSys.explode(rect.left + rect.width/2, rect.top + rect.height/2);
        
        // Disable interactions
        document.body.style.pointerEvents = 'none';
        
        // Play romantic zoom & flash transition
        navigateCinematic('page2.html', true);
    });
}

/* =======================================================================
   PAGE 2 LOGIC (Envelopes, Polaroids, Custom Typewriter)
   ======================================================================= */
function initPage2() {
    new ParticleSystem('fireflies');

    const envUs = document.getElementById("env-us");
    const envLetter = document.getElementById("env-letter");
    const btnContinue = document.getElementById("btn-continue");

    let opened = { us: false, letter: false };

    // --- Envelope 1: Us (Polaroids) ---
    const polaroidModal = document.getElementById("polaroid-modal");
    const closePolaroid = polaroidModal.querySelector(".close-modal");
    const polaroidImg = document.getElementById("polaroid-img");
    const polaroidCaption = document.getElementById("polaroid-caption");
    const btnPrev = polaroidModal.querySelector(".prev-btn");
    const btnNext = polaroidModal.querySelector(".next-btn");
    const progressTxt = document.getElementById("gallery-progress");
    const endTxt = document.getElementById("gallery-end-text");

    const photos = [
        { src: "images/photo1.jpg", caption: "" },
        { src: "images/photo2.jpg", caption: "" },
        { src: "images/photo3.jpg", caption: "" },
        { src: "images/photo4.jpg", caption: "" }
    ];
    let currentPhotoIdx = 0;

    envUs.addEventListener("click", () => {
        if(!envUs.querySelector('.envelope').classList.contains('open')) {
            envUs.querySelector('.envelope').classList.add('open');
            setTimeout(() => {
                polaroidModal.classList.add("active");
                updateGallery();
            }, 800);
            opened.us = true;
            checkAllOpened();
        } else {
            polaroidModal.classList.add("active");
        }
    });

    closePolaroid.addEventListener("click", () => polaroidModal.classList.remove("active"));

    function updateGallery() {
        const p = photos[currentPhotoIdx];
        
        polaroidImg.style.opacity = 0;
        setTimeout(() => {
            polaroidImg.src = p.src;
            polaroidImg.onerror = () => { polaroidImg.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="350"><rect width="100%" height="100%" fill="%23ddd"/><text x="50%" y="50%" font-family="sans-serif" font-size="20" fill="%23555" text-anchor="middle">Photo ${currentPhotoIdx+1}</text></svg>`; }
            polaroidCaption.innerText = p.caption;
            polaroidImg.style.opacity = 1;
        }, 300);

        progressTxt.innerText = `${currentPhotoIdx + 1} / ${photos.length}`;
        
        if(currentPhotoIdx === photos.length - 1) {
            endTxt.style.opacity = 1;
        }
    }

    btnNext.addEventListener("click", () => {
        if(currentPhotoIdx < photos.length - 1) {
            currentPhotoIdx++;
            updateGallery();
        }
    });

    btnPrev.addEventListener("click", () => {
        if(currentPhotoIdx > 0) {
            currentPhotoIdx--;
            updateGallery();
        }
    });


    // --- Envelope 2: Mwaaahhhhh (Love Letter Typewriter) ---
    const letterModal = document.getElementById("letter-modal");
    const closeLetter = letterModal.querySelector(".close-modal");
    const typeContent = document.getElementById("typewriter-content");
    const sig = letterModal.querySelector(".letter-signature");

    // NEW CUSTOM LOVE LETTER TEXT
    const loveLetterText = `My Babyyyy ❤️,\n\nThank you for being the reason behind so many of my smiles, for making ordinary days feel extraordinary, and for becoming someone my heart never wants to stop choosing.\n\nI made this little website because no gift from a store could ever express what I feel for you. Every page, every animation, every tiny detail was created with one person in mind and its you. I wanted to make something that would always remind you how incredibly special you are to me.\n\nYou know, out of all the people I could have met in this world, somehow life brought me to you. And honestly, that's one of my favorite things that has ever happened to me.\n\nI love the way you laugh, the way you make my heart race without even trying, and the comfort I feel just knowing you're there. Even the simplest moments with you become memories I never want to forget.\n\nI know no relationship is perfect. We'll have misunderstandings, busy days and moments when life gets overwhelming. But through all of that, I hope we never forget that we're on the same team. I want us to keep growing, laughing, teasing each other, making memories, and choosing each other every single day.\n\nYou don't have to be perfect for me. You already mean more than you know.\n\nIf there's one promise I want to make, it's this I'll always try to be someone who makes you feel loved, respected and appreciated.\n\nI love your smile.\n\nI love your laugh.\n\nI love your little habits.\n\nI love the person you are.\n\nBut most of all...\n\nI just love you.\n\nMore than these words can ever explain.`;
    
    let isTyping = false;
    let typed = false;

    envLetter.addEventListener("click", () => {
        if(!envLetter.querySelector('.envelope').classList.contains('open')) {
            envLetter.querySelector('.envelope').classList.add('open');
            setTimeout(() => {
                letterModal.classList.add("active");
                if(!typed) startTypewriter();
            }, 800);
            opened.letter = true;
            checkAllOpened();
        } else {
            letterModal.classList.add("active");
        }
    });

    closeLetter.addEventListener("click", () => letterModal.classList.remove("active"));

    function startTypewriter() {
        isTyping = true;
        typed = true;
        typeContent.innerHTML = "";
        let i = 0;

        function typeChar() {
            if (i < loveLetterText.length) {
                let char = loveLetterText.charAt(i);
                if (char === '\n') {
                    typeContent.innerHTML += '<br>';
                } else {
                    typeContent.innerHTML += char;
                }
                i++;
                // Natural typing cadence
                let delay = char === '.' ? 400 : char === ',' ? 200 : Math.random() * 50 + 30;
                
                // Keep scroll at bottom automatically as it types
                typeContent.parentElement.scrollTop = typeContent.parentElement.scrollHeight;
                
                setTimeout(typeChar, delay);
            } else {
                isTyping = false;
                // Add the custom signature logic dynamically
                sig.innerHTML = "❤️ Yours<br>Aditya Lakhani";
                sig.classList.remove("hidden");
                sig.classList.add("fade-in-up");
                
                // Final scroll to make sure signature is visible
                setTimeout(() => {
                    typeContent.parentElement.scrollTop = typeContent.parentElement.scrollHeight;
                }, 100);
            }
        }
        typeChar();
    }

    function checkAllOpened() {
        if(opened.us && opened.letter) {
            btnContinue.classList.remove("hidden");
            setTimeout(() => btnContinue.classList.add("visible"), 500);
        }
    }

    btnContinue.addEventListener("click", () => {
        navigateCinematic('page3.html');
    });
}

/* =======================================================================
   PAGE 3 LOGIC (Finale)
   ======================================================================= */
function initPage3() {
    new ParticleSystem('sparkles');

    const btnRestart = document.getElementById('btn-restart');
    
    btnRestart.addEventListener('click', () => {
        navigateCinematic('index.html');
    });
}