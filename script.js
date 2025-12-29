document.addEventListener('DOMContentLoaded', () => {
    const stampSlots = document.querySelectorAll('.stamp-slot');
    const currentCountDisplay = document.getElementById('current-count');
    const completionMessage = document.getElementById('completion-message');
    // Global undo button removed from logic

    // Config
    const TOTAL_STAMPS = 5;
    let currentStamps = 0;

    // Initialize
    loadState();
    updateUI();

    stampSlots.forEach(slot => {
        slot.addEventListener('click', () => {
            const index = parseInt(slot.getAttribute('data-index'));

            if (!slot.classList.contains('active')) {
                fillStamp(index);
            }
        });
    });

    function fillStamp(index) {
        if (index > TOTAL_STAMPS) return;

        const slot = document.querySelector(`.stamp-slot[data-index="${index}"]`);

        // Add active class
        slot.classList.add('active');

        // Update state
        const activeCount = document.querySelectorAll('.stamp-slot.active').length;
        currentStamps = activeCount;
        currentCountDisplay.textContent = currentStamps;

        // Generate history item data (include index)
        const historyItemData = createHistoryData(index);

        // Add to DOM
        addHistoryItemToDOM(historyItemData);

        // Save state
        saveState(historyItemData);

        // Check completion
        if (currentStamps === TOTAL_STAMPS) {
            handleCompletion();
        }
    }

    function removeItem(stampIndex, historyTimestamp) {
        // 1. Deactivate Stamp
        const slot = document.querySelector(`.stamp-slot[data-index="${stampIndex}"]`);
        if (slot) {
            slot.classList.remove('active');
        }

        // 2. Update Count
        const activeCount = document.querySelectorAll('.stamp-slot.active').length;
        currentStamps = activeCount;
        currentCountDisplay.textContent = currentStamps;

        // Hide completion if needed
        if (currentStamps < TOTAL_STAMPS) {
            const completionMessage = document.getElementById('completion-message');
            if (completionMessage) completionMessage.classList.add('hidden');
        }

        // 3. Update Storage
        let history = JSON.parse(localStorage.getItem('zerovity_history') || '[]');
        // Filter out the item with this specific timestamp
        history = history.filter(item => item.timestamp !== historyTimestamp);

        localStorage.setItem('zerovity_history', JSON.stringify(history));
        localStorage.setItem('zerovity_stamp_count', currentStamps);
    }

    function createHistoryData(index) {
        const now = new Date();
        const datePart = now.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
        });

        let hours = now.getHours();
        const ampm = hours >= 12 ? '오후' : '오전';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const minutes = now.getMinutes().toString().padStart(2, '0');

        const timePart = `${ampm} ${hours}:${minutes}`;
        const fullDateString = `${datePart} at ${timePart}`;
        const ts = now.getTime();

        return {
            dateStr: fullDateString,
            timestamp: ts,
            stampIndex: index // Track which stamp this is
        };
    }

    function addHistoryItemToDOM(data) {
        const historyList = document.getElementById('history-list');

        const item = document.createElement('div');
        item.className = 'history-item';
        // Check if data is legacy (no timestamp) or new
        const id = data.timestamp || Date.now();
        item.dataset.id = id;

        item.innerHTML = `
            <div class="history-icon-circle">
                 <img src="assets/coffee_cup.png" alt="Icon" class="history-icon-img">
            </div>
            <div class="history-details">
                <div class="history-name">Stamp Earned</div>
                <div class="history-date">${data.dateStr}</div>
            </div>
            <button class="history-undo-btn">Undo</button>
        `;

        // Attach click listener to the button
        const btn = item.querySelector('.history-undo-btn');
        btn.addEventListener('click', () => {
            // Remove from DOM
            item.remove();

            // Logic to update state
            if (data.stampIndex) {
                removeItem(data.stampIndex, data.timestamp);
            } else {
                // Fallback for legacy items: just remove from storage
                let history = JSON.parse(localStorage.getItem('zerovity_history') || '[]');
                history = history.filter(h => h.timestamp !== data.timestamp);
                localStorage.setItem('zerovity_history', JSON.stringify(history));
            }
        });

        historyList.prepend(item);
    }

    function handleCompletion() {
        setTimeout(() => {
            if (currentStamps === TOTAL_STAMPS) {
                if (completionMessage) completionMessage.classList.remove('hidden');
            }
        }, 600);
    }

    function updateUI() {
        currentCountDisplay.textContent = currentStamps;
    }

    function saveState(newHistoryItem) {
        // Save Stamp Count
        localStorage.setItem('zerovity_stamp_count', currentStamps);

        // Save History Stack
        let history = JSON.parse(localStorage.getItem('zerovity_history') || '[]');
        if (newHistoryItem) {
            history.unshift(newHistoryItem); // Add new item to start
        }
        localStorage.setItem('zerovity_history', JSON.stringify(history));
    }

    function loadState() {
        // Load History First
        const savedHistory = localStorage.getItem('zerovity_history');
        if (savedHistory) {
            const history = JSON.parse(savedHistory);

            // Reconstruct active slots from history
            currentStamps = 0;
            const activeIndices = new Set();

            // Iterate history (Newest to Oldest)
            // Render DOM from Newest to Oldest (using prepend logic in a reverse loop)
            for (let i = history.length - 1; i >= 0; i--) {
                const h = history[i];
                addHistoryItemToDOM(h);
                if (h.stampIndex) {
                    activeIndices.add(h.stampIndex);
                }
            }

            // Update Active Slots
            activeIndices.forEach(index => {
                const slot = document.querySelector(`.stamp-slot[data-index="${index}"]`);
                if (slot) slot.classList.add('active');
            });

            currentStamps = activeIndices.size;

            // Check legacy mismatch (if no indices were saved previously but count > 0)
            if (currentStamps === 0 && history.length > 0) {
                // Fallback: If we have history but no indices, try to trust saved count?
                // Or just assume stamp 1..N
                const savedCount = localStorage.getItem('zerovity_stamp_count');
                if (savedCount) {
                    currentStamps = parseInt(savedCount);
                    for (let i = 1; i <= currentStamps; i++) {
                        const slot = document.querySelector(`.stamp-slot[data-index="${i}"]`);
                        if (slot) slot.classList.add('active');
                    }
                }
            }

        } else {
            // Fallback to legacy count
            const savedCount = localStorage.getItem('zerovity_stamp_count');
            if (savedCount) {
                currentStamps = parseInt(savedCount);
                for (let i = 1; i <= currentStamps; i++) {
                    const slot = document.querySelector(`.stamp-slot[data-index="${i}"]`);
                    if (slot) slot.classList.add('active');
                }
            }
        }
    }
});
