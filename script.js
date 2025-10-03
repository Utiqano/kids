const categories = [
    {
        name: 'Shapes',
        items: [
            { id: 'star', emoji: '⭐', name: 'نجمة' },
            { id: 'square', emoji: '⬛', name: 'مربع' },
            { id: 'circle', emoji: '⚪', name: 'دائرة' },
            { id: 'triangle', emoji: '🔺', name: 'مثلث' }
        ]
    },
    {
        name: 'Animals',
        items: [
            { id: 'dog', emoji: '🐶', name: 'كلب' },
            { id: 'cat', emoji: '🐱', name: 'قطة' },
            { id: 'bird', emoji: '🐦', name: 'طائر' },
            { id: 'fish', emoji: '🐟', name: 'سمكة' }
        ]
    },
    {
        name: 'Colors',
        items: [
            { id: 'red', emoji: '🔴', name: 'أحمر' },
            { id: 'blue', emoji: '🔵', name: 'أزرق' },
            { id: 'green', emoji: '🟢', name: 'أخضر' },
            { id: 'yellow', emoji: '🟡', name: 'أصفر' }
        ]
    },
    {
        name: 'Vehicles',
        items: [
            { id: 'car', emoji: '🚗', name: 'سيارة' },
            { id: 'truck', emoji: '🚚', name: 'شاحنة' },
            { id: 'bike', emoji: '🚲', name: 'دراجة' },
            { id: 'plane', emoji: '✈️', name: 'طائرة' }
        ]
    },
    {
        name: 'Fruits',
        items: [
            { id: 'apple', emoji: '🍎', name: 'تفاحة' },
            { id: 'banana', emoji: '🍌', name: 'موزة' },
            { id: 'orange', emoji: '🍊', name: 'برتقالة' },
            { id: 'grape', emoji: '🍇', name: 'عنب' }
        ]
    },
    {
        name: 'Weather',
        items: [
            { id: 'sun', emoji: '☀️', name: 'شمس' },
            { id: 'cloud', emoji: '☁️', name: 'غيمة' },
            { id: 'rain', emoji: '🌧️', name: 'مطر' },
            { id: 'snow', emoji: '❄️', name: 'ثلج' }
        ]
    },
    {
        name: 'Objects',
        items: [
            { id: 'ball', emoji: '⚽', name: 'كرة' },
            { id: 'book', emoji: '📚', name: 'كتاب' },
            { id: 'clock', emoji: '⏰', name: 'ساعة' },
            { id: 'pen', emoji: '🖊️', name: 'قلم' }
        ]
    }
];

let currentLevel = 1;
const maxLevels = 50;
let currentCategory;
let correctItem;
const synth = window.speechSynthesis;

const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('toggle-btn');
const target = document.getElementById('target');
const levelDisplay = document.getElementById('level-display');
const progressFill = document.getElementById('progress-fill');
const loading = document.getElementById('loading');

toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    toggleBtn.textContent = sidebar.classList.contains('collapsed') ? '☰' : '✖';
});

function initLevel() {
    if (currentLevel > maxLevels) {
        levelDisplay.textContent = 'Game Completed! 🎉';
        sidebar.innerHTML = '';
        target.innerHTML = '';
        target.classList.remove('correct');
        progressFill.style.width = '100%';
        loading.style.display = 'none';
        return;
    }

    currentCategory = categories[Math.floor(Math.random() * categories.length)];
    sidebar.innerHTML = `<div class="category-header">${currentCategory.name}</div>`;
    target.innerHTML = '';
    target.classList.remove('correct');

    currentCategory.items.forEach((item, index) => {
        const shape = document.createElement('div');
        shape.className = 'shape';
        shape.id = item.id;
        shape.textContent = item.emoji;
        shape.draggable = true;
        shape.dataset.category = currentCategory.name;
        shape.addEventListener('dragstart', dragStart);
        shape.addEventListener('touchstart', touchStart, { passive: false });
        sidebar.appendChild(shape);
    });

    correctItem = currentCategory.items[Math.floor(Math.random() * currentCategory.items.length)];

    target.innerHTML = correctItem.emoji;

    levelDisplay.textContent = `Level: ${currentLevel}`;
    progressFill.style.width = `${(currentLevel / maxLevels) * 100}%`;

    loading.style.display = 'none';
}

function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.id);
}

function touchStart(e) {
    const parent = e.target.closest('#sidebar');
    if (parent && parent.scrollHeight > parent.clientHeight) {
        // Skip preventDefault if near edges (reduce scroll blocks)
        const touchY = e.touches[0].clientY;
        if (touchY < 100 || touchY > window.innerHeight - 100) {
            e.preventDefault();
        } else {
            return; // Allow scroll
        }
    } else {
        e.preventDefault();
    }

    const touch = e.touches[0];
    const elem = e.target;
    elem.style.position = 'absolute';
    elem.style.zIndex = 1000;

    function touchMove(ev) {
        ev.preventDefault();
        const touch = ev.touches[0];
        elem.style.left = `${touch.clientX - elem.offsetWidth / 2}px`;
        elem.style.top = `${touch.clientY - elem.offsetHeight / 2}px`;
    }

    function touchEnd(ev) {
        document.removeEventListener('touchmove', touchMove);
        document.removeEventListener('touchend', touchEnd);
        const dropX = ev.changedTouches[0].clientX;
        const dropY = ev.changedTouches[0].clientY;
        
        elem.style.position = '';
        elem.style.left = '';
        elem.style.top = '';
        elem.style.zIndex = '';
        
        if (isOverTarget(dropX, dropY)) {
            checkDrop(elem.id);
        }
    }

    document.addEventListener('touchmove', touchMove, { passive: false });
    document.addEventListener('touchend', touchEnd, { passive: false });
}

target.addEventListener('dragover', e => e.preventDefault());
target.addEventListener('drop', e => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    checkDrop(id);
});

function isOverTarget(x, y) {
    const rect = target.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function checkDrop(id) {
    const droppedItem = currentCategory.items.find(item => item.id === id);
    speak(droppedItem.name);
    if (id === correctItem.id) {
        target.classList.add('correct');
        createConfetti();
        currentLevel++;
        setTimeout(initLevel, 1200);
    }
}

function createConfetti() {
    for (let i = 0; i < 20; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animationDuration = (Math.random() * 0.5 + 0.5) + 's';
        confetti.style.width = confetti.style.height = (Math.random() * 10 + 5) + 'px';
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 1000);
    }
}

function speak(text) {
    if (synth && !synth.speaking) {
        try {
            synth.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ar-SA';
            utterance.rate = 1.0;
            utterance.pitch = 1.2;
            utterance.volume = 1.0;

            const voices = synth.getVoices();
            const arabicVoice = voices.find(voice => voice.lang.includes('ar'));
            if (arabicVoice) {
                utterance.voice = arabicVoice;
            }

            utterance.onerror = (event) => {
                console.warn('Speech error:', event.error);
                target.title = text; // Fallback tooltip
            };

            synth.speak(utterance);
        } catch (err) {
            console.warn('Speech unavailable:', err);
        }
    }
}

function initVoices() {
    const voices = synth.getVoices();
    if (voices.length > 0) {
        initLevel();
    } else {
        synth.onvoiceschanged = () => {
            initLevel();
        };
    }
}

try {
    initVoices();
} catch (err) {
    console.error('Init failed:', err);
    loading.textContent = 'Ready! (No voices)';
    setTimeout(initLevel, 500);
}
