document.addEventListener('DOMContentLoaded', () => {
    const stampSlots = document.querySelectorAll('.stamp-slot');
    const currentCountDisplay = document.getElementById('current-count');
    const completionMessage = document.getElementById('completion-message');

    // Config
    const TOTAL_STAMPS = 5;
    let currentStamps = 0;

    // Initialize
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

        // Note: Image logic removed. CSS handles visuals (solid fill + white number)

        // Update state
        const activeCount = document.querySelectorAll('.stamp-slot.active').length;
        currentStamps = activeCount;
        currentCountDisplay.textContent = currentStamps;

        // Add History
        addHistoryItem();

        // Check completion
        if (currentStamps === TOTAL_STAMPS) {
            handleCompletion();
        }
    }

    function addHistoryItem() {
        const historyList = document.getElementById('history-list');

        const item = document.createElement('div');
        item.className = 'history-item';

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

        item.innerHTML = `
            <div class="history-icon-circle">
                 <img src="assets/coffee_cup.png" alt="Icon" class="history-icon-img">
            </div>
            <div class="history-details">
                <div class="history-name">Stamp Earned</div>
                <div class="history-date">${fullDateString}</div>
            </div>
            <div class="history-points">+1</div>
        `;

        historyList.prepend(item);
    }

    function handleCompletion() {
        setTimeout(() => {
            completionMessage.classList.remove('hidden');
        }, 600);
    }

    function updateUI() {
        currentCountDisplay.textContent = currentStamps;
    }
});
