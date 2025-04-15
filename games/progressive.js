export default class ProgressiveGame {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.symbols = ['🍒', '🍋', '🍊', '🍇', '🍉', '🍎', '7️⃣', '💰', '💎'];
        this.paytable = {
            '💎💎💎💎💎': { payout: 'JACKPOT', description: "Progressive Jackpot" },
            '💰💰💰💰💰': { payout: 5000, description: "Mega Win - 5000x bet" },
            '7️⃣7️⃣7️⃣7️⃣7️⃣': { payout: 1000, description: "Super Win - 1000x bet" },
            '💎💎💎💎': { payout: 500, description: "Diamond Line - 500x bet" },
            '💰💰💰💰': { payout: 250, description: "Big Win - 250x bet" },
            '7️⃣7️⃣7️⃣7️⃣': { payout: 100, description: "Large Win - 100x bet" },
            '💎💎💎': { payout: 50, description: "Diamond Trio - 50x bet" },
            '💰💰💰': { payout: 25, description: "Standard Win - 25x bet" },
            '7️⃣7️⃣7️⃣': { payout: 10, description: "Small Win - 10x bet" }
        };
        
        this.jackpotTrigger = 0.0001; // 0.01% chance to trigger jackpot
    }
    
    init() {
        const gameDisplay = this.gameManager.elements.gameDisplay;
        
        // Create reels
        const reelContainer = document.createElement('div');
        reelContainer.className = 'reel-container';
        
        this.reels = [];
        for (let i = 0; i < 5; i++) {
            const reel = document.createElement('div');
            reel.className = 'reel';
            reel.id = `reel-${i}`;
            
            // Create 3 visible symbols per reel
            for (let j = 0; j < 3; j++) {
                const symbol = document.createElement('div');
                symbol.className = 'reel-symbol';
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
        
        // Add jackpot meter
        const jackpotMeter = document.createElement('div');
        jackpotMeter.className = 'jackpot-meter';
        jackpotMeter.innerHTML = `
            <div class="meter-label">JACKPOT PROGRESS</div>
            <div class="meter-bar">
                <div class="meter-fill" id="jackpot-meter-fill"></div>
            </div>
        `;
        gameDisplay.insertBefore(jackpotMeter, reelContainer);
    }
    
    updateSymbols() {
        this.reels.forEach(reel => {
            const symbols = reel.querySelectorAll('.reel-symbol');
            symbols.forEach(sym => {
                sym.textContent = this.symbols[Math.floor(Math.random() * this.symbols.length)];
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
                    sym.textContent = this.symbols[Math.floor(Math.random() * this.symbols.length)];
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
        const finalSymbols = [];
        this.reels.forEach((reel, i) => {
            const symbols = reel.querySelectorAll('.reel-symbol');
            const middleSymbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
            symbols[1].textContent = middleSymbol;
            finalSymbols[i] = middleSymbol;
            
            // Set adjacent symbols for visual effect
            symbols[0].textContent = this.symbols[Math.floor(Math.random() * this.symbols.length)];
            symbols[2].textContent = this.symbols[Math.floor(Math.random() * this.symbols.length)];
        });
        
        // Check for jackpot trigger
        if (Math.random() < this.jackpotTrigger) {
            this.triggerJackpot();
            return;
        }
        
        // Check for regular wins
        this.checkWins(finalSymbols);
        
        // Re-enable spin button
        this.gameManager.elements.spinBtn.disabled = false;
        
        // Continue auto-spin if active
        if (this.gameManager.state.autoSpinsRemaining > 0) {
            setTimeout(() => {
                this.gameManager.spin();
            }, 1000);
        }
    }
    
    checkWins(symbols) {
        // Check for 5 of a kind
        if (symbols.every(sym => sym === symbols[0])) {
            const winKey = symbols.join('');
            if (this.paytable[winKey]) {
                if (winKey === '💎💎💎💎💎') {
                    this.triggerJackpot();
                } else {
                    const winAmount = this.gameManager.state.bet * this.paytable[winKey].payout;
                    this.gameManager.showWin(winAmount);
                }
                return;
            }
        }
        
        // Check for 4 of a kind
        const counts = {};
        symbols.forEach(sym => { counts[sym] = (counts[sym] || 0) + 1; });
        const maxCount = Math.max(...Object.values(counts));
        
        if (maxCount >= 4) {
            const symbol = Object.keys(counts).find(key => counts[key] === maxCount);
            const winKey = symbol.repeat(4);
            
            if (this.paytable[winKey]) {
                const winAmount = this.gameManager.state.bet * this.paytable[winKey].payout;
                this.gameManager.showWin(winAmount);
                return;
            }
        }
        
        // Check for 3 of a kind
        if (maxCount >= 3) {
            const symbol = Object.keys(counts).find(key => counts[key] === maxCount);
            const winKey = symbol.repeat(3);
            
            if (this.paytable[winKey]) {
                const winAmount = this.gameManager.state.bet * this.paytable[winKey].payout;
                this.gameManager.showWin(winAmount);
                return;
            }
        }
    }
    
    triggerJackpot() {
        // Award jackpot
        const jackpotAmount = Math.floor(this.gameManager.state.progressiveJackpot);
        this.gameManager.showWin(jackpotAmount, true);
        
        // Reset jackpot
        this.gameManager.state.progressiveJackpot = 100000; // Base jackpot amount
        
        // Special jackpot animation
        const reels = document.querySelectorAll('.reel');
        reels.forEach(reel => {
            const symbols = reel.querySelectorAll('.reel-symbol');
            symbols.forEach(sym => {
                sym.textContent = '💰';
                sym.style.animation = 'jackpotBlink 0.5s infinite';
            });
        });
        
        setTimeout(() => {
            reels.forEach(reel => {
                const symbols = reel.querySelectorAll('.reel-symbol');
                symbols.forEach(sym => {
                    sym.style.animation = '';
                });
            });
        }, 3000);
    }
    
    showPaytable() {
        const modal = this.gameManager.elements.paytableModal;
        const content = this.gameManager.elements.paytableContent;
        
        content.innerHTML = `
            <h3>${this.gameManager.state.games[this.gameManager.state.currentGame].name} Paytable</h3>
            <p class="jackpot-info">Current Jackpot: $${Math.floor(this.gameManager.state.progressiveJackpot).toLocaleString()}</p>
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
                            <td>${data.payout === 'JACKPOT' ? 'PROGRESSIVE JACKPOT' : data.payout + 'x'}</td>
                            <td>${data.description}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <p class="jackpot-note">A small percentage of each bet contributes to the progressive jackpot. 
            Jackpot can be won randomly on any spin or by getting 5 diamonds.</p>
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
