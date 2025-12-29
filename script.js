document.addEventListener('DOMContentLoaded', () => {
    const stampSlots = document.querySelectorAll('.stamp-slot');
    const currentCountDisplay = document.getElementById('current-count');
    const completionMessage = document.getElementById('completion-message');
    
    // Config
    const TOTAL_STAMPS = 5;
    let currentStamps = 0;
    
    // Sound effect (simulated with standard detailed web audio if needed, but keeping simple for now)
    // Optional: Add simple click sound
    
    // Initialize
    updateUI();

    stampSlots.forEach(slot => {
        slot.addEventListener('click', () => {
            const index = parseInt(slot.getAttribute('data-index'));
            
            // Logic: Can only click the next available stamp
            // e.g., if you have 0, you can only click 1. If 1, click 2.
            // Also supports clicking already stamped ones (maybe to re-trigger? or toggle? Instructions say "click to fill")
            // Let's implement: Click to fill next available slot, or click specific slot if it's the next one.
            // Simplified: Clicking ANY empty slot fills the NEXT available logical slot to keep order,
            // OR strictly: you must click slot 1, then slot 2. 
            // UX Best practice for this: Just make the next one pulsate?
            // Let's make it simple: Clicking the specific next slot fills it.
            
            if (index === currentStamps + 1) {
                fillStamp(index);
            } else if (index <= currentStamps) {
                // Already filled
                // Maybe shake animation?
            } else {
                // Clicking a future stamp
                // Shake animation?
            }
        });
    });

    function fillStamp(index) {
        if (index > TOTAL_STAMPS) return;

        const slot = document.querySelector(`.stamp-slot[data-index="${index}"]`);
        
        // Add active class to trigger CSS animation
        slot.classList.add('active');
        
        // Update state
        currentStamps = index;
        currentCountDisplay.textContent = currentStamps;
        
        // Check completion
        if (currentStamps === TOTAL_STAMPS) {
            handleCompletion();
        }
    }

    function handleCompletion() {
        // Wait a bit for the last stamp animation to finish
        setTimeout(() => {
            completionMessage.classList.remove('hidden');
            
            // Trigger confetti or some celebration?
            // keeping it simple with CSS animations for now
        }, 600);
    }

    function updateUI() {
        // Restore state if we had persistence (future proofing)
        currentCountDisplay.textContent = currentStamps;
    }
});
