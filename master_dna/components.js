/* master_dna/components.js - Lógica interactiva unificada */

const MasterDNA = {
    initGlassEffects: () => {
        console.log("🧬 ADN Global: Activando efectos de luz...");
        document.querySelectorAll('.glass-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            });
        });
    },

    setupTabs: (tabContainerId) => {
        // Lógica universal para pestañas premium
        const container = document.getElementById(tabContainerId);
        if (!container) return;

        const tabs = container.querySelectorAll('.tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                container.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');

                tab.classList.add('active');
                const target = document.getElementById(tab.dataset.target);
                if (target) {
                    target.style.display = 'block';
                    target.classList.add('animate-fade');
                }
            });
        });
    }
};

window.addEventListener('DOMContentLoaded', () => {
    MasterDNA.initGlassEffects();
});
