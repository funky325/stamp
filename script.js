document.addEventListener('DOMContentLoaded', () => {
    const stampSlots = document.querySelectorAll('.stamp-slot');
    const currentCountDisplay = document.getElementById('current-count');
    const completionMessage = document.getElementById('completion-message');

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

        // Generate history item data
        const historyItemData = createHistoryData();

        // Add to DOM
        addHistoryItemToDOM(historyItemData);

        // Save state
        saveState(historyItemData);

        // Check completion
        if (currentStamps === TOTAL_STAMPS) {
            handleCompletion();
        }
    }

    function createHistoryData() {
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

        return {
            dateStr: fullDateString,
            timestamp: now.getTime()
        };
    }

    function addHistoryItemToDOM(data) {
        const historyList = document.getElementById('history-list');

        const item = document.createElement('div');
        item.className = 'history-item';

        item.innerHTML = `
            <div class="history-icon-circle">
                 <img src="assets/coffee_cup.png" alt="Icon" class="history-icon-img">
            </div>
            <div class="history-details">
                <div class="history-name">Stamp Earned</div>
                <div class="history-date">${data.dateStr}</div>
            </div>
            <div class="history-points">+1</div>
        `;

        historyList.prepend(item);
    }

    // Wrapper for filling stamp to create data on the fly
    function addHistoryItem() {
        // This function is kept for backward compatibility if called elsewhere, 
        // but logic moved to fillStamp to handle data creation + saving separately
    }

    function handleCompletion() {
        setTimeout(() => {
            completionMessage.classList.remove('hidden');
        }, 600);
    }

    function updateUI() {
        currentCountDisplay.textContent = currentStamps;

        // Mark stamps as active based on loaded state count
        // (Assuming sequential filling for legacy support, but checking specific stamps would be better if we saved indices)
        // For now, we save raw count, but let's assume if count is 3, stamps 1,2,3 are filled.
        // Or if we saved specific indices...
        // Let's rely on re-validating the UI based on `currentStamps`.

        for (let i = 1; i <= currentStamps; i++) {
            const slot = document.querySelector(`.stamp-slot[data-index="${i}"]`);
            if (slot) slot.classList.add('active');
        }

        if (currentStamps === TOTAL_STAMPS) {
            handleCompletion();
        }
    }

    // --- Persistence ---

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
        // Load Stamp Count
        const savedCount = localStorage.getItem('zerovity_stamp_count');
        if (savedCount) {
            currentStamps = parseInt(savedCount);
        }

        // Load History
        const savedHistory = localStorage.getItem('zerovity_history');
        if (savedHistory) {
            const history = JSON.parse(savedHistory);
            // history is [Newest, Older, Oldest...]
            // We want to append them to DOM in that order (TOP to BOTTOM)
            // historyList.prepend puts item at TOP.
            // If we iterate 0->End:
            // 0 (Newest) -> prepend -> [Newest]
            // 1 (Older) -> prepend -> [Older, Newest] -> WRONG ORDER

            // So we must iterate from End->0
            for (let i = history.length - 1; i >= 0; i--) {
                addHistoryItemToDOM(history[i]);
            }
        }
    }
});
