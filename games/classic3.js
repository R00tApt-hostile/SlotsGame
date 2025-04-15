export default class Classic3Game {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.symbols = ['🍒', '🍋', '🍊', '🍇', '🍉', '🍎', '7️⃣', '💰'];
        this.paytable = {
            '💰💰💰': { payout: 1000, description: "Jackpot - 1000x bet" },
            '7️⃣7️⃣7️⃣': { payout: 500, description: "Triple 7s - 500x bet" },
            '🍎🍎🍎': { payout: 100, description: "Triple Apples - 100x bet" },
            '🍉🍉🍉': { payout: 50, description: "Triple Watermelons - 50x bet" },
            '🍇🍇🍇': { payout: 25, description: "Triple Grapes - 25x bet" },
            '🍊🍊🍊': { payout: 20, description: "Triple Oranges - 20x bet" },
            '🍋🍋🍋': { payout: 15, description: "Triple Lemons - 15x bet" },
            '🍒🍒🍒': { payout: 10, description: "Triple Cherries - 10x bet" },
            '🍒🍒': { payout: 5, description: "Double Cherries - 5x bet" },
            '🍒': { payout: 2, description: "Single Cherry - 2x bet" }
        };
    }
    
    init() {
        const gameDisplay = this.gameManager.elements.gameDisplay;
        
        // Create reels
        const reelContainer = document.createElement('div');
        reelContainer.className = 'reel-container';
        
        this.reels = [];
        for (let i = 0; i < 3; i++) {
            const reel = document.createElement('div');
            reel.className = 'reel';
            reel.id = `reel-${i}`;
            
            // Create 3 visible symbols per reel (plus 2 hidden for animation)
            for (let j = 0; j < 5; j++) {
                const symbol = document.createElement('div');
                symbol.className = 'reel-symbol';
                symbol.dataset.pos = j;
                if (j >= 1 && j <= 3) {
                    symbol.style.visibility = 'visible';
                } else {
                    symbol.style.visibility = 'hidden';
                }
                reel.appendChild(symbol);
            }
            
            reelContainer.appendChild(reel);
            this.reels.push(reel);
        }
        
        gameDisplay.appendChild(reelContainer);
        
        // Initialize symbols
        this.updateSymbols();
        
        // Create paytable button
        const paytableBtn = document.createElement('button');
        paytableBtn.className = 'action-btn';
        paytableBtn.textContent = 'PAYTABLE';
        paytableBtn.addEventListener('click', () => this.showPaytable());
        gameDisplay.appendChild(paytableBtn);
    }
    
    updateSymbols() {
        this.reels.forEach(reel => {
            const symbols = reel.querySelectorAll('.reel-symbol');
            symbols.forEach(sym => {
                if (sym.style.visibility !== 'hidden') {
                    sym.textContent = this.symbols[Math.floor(Math.random() * this.symbols.length)];
                }
            });
        });
    }
    
    spin() {
        const spinDuration = 2000 + Math.random() * 1000;
        const startTime = Date.now();
        
        // Disable spin button during spin
        this.gameManager.elements.spinBtn.disabled = true;
        
        // Animation function
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / spinDuration, 1);
            
            // Update symbols during spin
            this.reels.forEach(reel => {
                const symbols = reel.querySelectorAll('.reel-symbol');
                symbols.forEach(sym => {
                    if (progress < 1 || sym.style.visibility === 'visible') {
                        sym.textContent = this.symbols[Math.floor(Math.random() * this.symbols.length)];
                    }
                });
            });
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.finishSpin();
            }
        };
        
        // Start animation
        requestAnimationFrame(animate);
    }
    
    finishSpin() {
        // Set final symbols
        this.reels.forEach(reel => {
            const symbols = reel.querySelectorAll('.reel-symbol[style="visibility: visible;"]');
            symbols.forEach(sym => {
                sym.textContent = this.symbols[Math.floor(Math.random() * this.symbols.length)];
            });
        });
        
        // Check for wins
        this.checkWins();
        
        // Re-enable spin button
        this.gameManager.elements.spinBtn.disabled = false;
        
        // Continue auto-spin if active
        if (this.gameManager.state.autoSpinsRemaining > 0) {
            setTimeout(() => {
                this.gameManager.spin();
            }, 1000);
        }
    }
    
    checkWins() {
        // Get visible symbols
        const visibleSymbols = [];
        this.reels.forEach(reel => {
            const symbols = Array.from(reel.querySelectorAll('.reel-symbol[style="visibility: visible;"]'))
                .map(sym => sym.textContent);
            visibleSymbols.push(symbols[1]); // Middle symbol
        });
        
        // Check paytable combinations
        const combo = visibleSymbols.join('');
        
        // Check for three of a kind first
        if (visibleSymbols[0] === visibleSymbols[1] && visibleSymbols[1] === visibleSymbols[2]) {
            const winKey = `${visibleSymbols[0]}${visibleSymbols[1]}${visibleSymbols[2]}`;
            if (this.paytable[winKey]) {
                const winAmount = this.gameManager.state.bet * this.paytable[winKey].payout;
                this.gameManager.showWin(winAmount, winKey === '💰💰💰');
                return;
            }
        }
        
        // Check for two cherries
        if (visibleSymbols.filter(sym => sym === '🍒').length >= 2) {
            const winAmount = this.gameManager.state.bet * this.paytable['🍒🍒'].payout;
            this.gameManager.showWin(winAmount);
            return;
        }
        
        // Check for single cherry
        if (visibleSymbols.includes('🍒')) {
            const winAmount = this.gameManager.state.bet * this.paytable['🍒'].payout;
            this.gameManager.showWin(winAmount);
            return;
        }
    }
    
    showPaytable() {
        const modal = this.gameManager.elements.paytableModal;
        const content = this.gameManager.elements.paytableContent;
        
        content.innerHTML = `
            <h3>${this.gameManager.state.games[this.gameManager.state.currentGame].name} Paytable</h3>
            <table>
                <thead>
                    <tr>
                        <th>Combination</th>
                        <th>Payout</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(this.paytable).map(([combo, data]) => `
                        <tr>
                            <td>${combo}</td>
                            <td>${data.payout}x</td>
                            <td>${data.description}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        modal.classList.add('active');
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
        
        // Close button
        document.querySelector('.close-modal').addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }
}
