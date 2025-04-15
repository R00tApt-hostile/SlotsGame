// Game state manager
class GameManager {
    constructor() {
        this.state = {
            balance: 10000,
            bet: 100,
            currentGame: 'classic3',
            games: {
                classic3: { name: "Classic 3-Reel", minBet: 10, maxBet: 1000 },
                video5: { name: "5-Reel Video", minBet: 20, maxBet: 2000 },
                megaways: { name: "Megaways™", minBet: 50, maxBet: 5000 },
                progressive: { name: "Jackpot Quest", minBet: 100, maxBet: 10000 }
            },
            progressiveJackpot: 1234567,
            jackpotContributionRate: 0.01,
            autoSpinsRemaining: 0,
            soundEnabled: true
        };
        
        this.initElements();
        this.initEventListeners();
        this.loadGame('classic3');
        this.updateDisplay();
    }
    
    initElements() {
        this.elements = {
            balance: document.getElementById('balance'),
            bet: document.getElementById('current-bet'),
            jackpot: document.getElementById('jackpot-amount'),
            spinBtn: document.getElementById('spin-btn'),
            betUp: document.getElementById('bet-up'),
            betDown: document.getElementById('bet-down'),
            maxBet: document.getElementById('max-bet'),
            autoSpin: document.getElementById('auto-spin'),
            gameDisplay: document.getElementById('game-display'),
            paytableModal: document.getElementById('paytable-modal'),
            paytableContent: document.getElementById('paytable-content'),
            winAnimation: document.getElementById('win-animation'),
            gameButtons: document.querySelectorAll('.game-btn'),
            spinSound: document.getElementById('spin-sound'),
            winSound: document.getElementById('win-sound'),
            jackpotSound: document.getElementById('jackpot-sound')
        };
    }
    
    initEventListeners() {
        this.elements.spinBtn.addEventListener('click', () => this.spin());
        this.elements.betUp.addEventListener('click', () => this.adjustBet(1));
        this.elements.betDown.addEventListener('click', () => this.adjustBet(-1));
        this.elements.maxBet.addEventListener('click', () => this.setMaxBet());
        this.elements.autoSpin.addEventListener('click', () => this.toggleAutoSpin(5));
        
        this.elements.gameButtons.forEach(btn => {
            btn.addEventListener('click', () => this.loadGame(btn.dataset.game));
        });
        
        // Add paytable button event if you add one
    }
    
    updateDisplay() {
        this.elements.balance.textContent = this.state.balance.toLocaleString();
        this.elements.bet.textContent = this.state.bet.toLocaleString();
        this.elements.jackpot.textContent = Math.floor(this.state.progressiveJackpot).toLocaleString();
        
        // Update active game button
        this.elements.gameButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.game === this.state.currentGame);
        });
        
        // Disable spin if insufficient balance
        this.elements.spinBtn.disabled = this.state.balance < this.state.bet;
    }
    
    adjustBet(direction) {
        const step = this.state.games[this.state.currentGame].minBet;
        let newBet = this.state.bet + (direction * step);
        
        // Clamp to min/max
        newBet = Math.max(newBet, this.state.games[this.state.currentGame].minBet);
        newBet = Math.min(newBet, Math.min(
            this.state.games[this.state.currentGame].maxBet,
            this.state.balance
        ));
        
        this.state.bet = newBet;
        this.updateDisplay();
    }
    
    setMaxBet() {
        this.state.bet = Math.min(
            this.state.games[this.state.currentGame].maxBet,
            this.state.balance
        );
        this.updateDisplay();
    }
    
    loadGame(gameId) {
        this.state.currentGame = gameId;
        
        // Clear previous game
        this.elements.gameDisplay.innerHTML = '';
        this.elements.gameDisplay.className = 'game-display';
        this.elements.gameDisplay.classList.add(gameId);
        
        // Load appropriate game module
        import(`./games/${gameId}.js`)
            .then(module => {
                this.currentGame = new module.default(this);
                this.currentGame.init();
                this.updateDisplay();
            })
            .catch(err => {
                console.error(`Failed to load game ${gameId}:`, err);
                this.elements.gameDisplay.innerHTML = `<p>Failed to load game. Please try again.</p>`;
            });
    }
    
    spin() {
        if (this.state.balance < this.state.bet) return;
        
        // Deduct bet and contribute to jackpot
        this.state.balance -= this.state.bet;
        this.state.progressiveJackpot += this.state.bet * this.state.jackpotContributionRate;
        
        // Play sound
        if (this.state.soundEnabled) {
            this.elements.spinSound.currentTime = 0;
            this.elements.spinSound.play();
        }
        
        this.updateDisplay();
        this.currentGame.spin();
    }
    
    showWin(amount, isJackpot = false) {
        this.state.balance += amount;
        
        // Play appropriate sound
        if (this.state.soundEnabled) {
            if (isJackpot) {
                this.elements.jackpotSound.currentTime = 0;
                this.elements.jackpotSound.play();
            } else {
                this.elements.winSound.currentTime = 0;
                this.elements.winSound.play();
            }
        }
        
        // Show win animation
        this.elements.winAnimation.innerHTML = isJackpot 
            ? `<h2>JACKPOT! $${amount.toLocaleString()}</h2>`
            : `<h2>WIN! $${amount.toLocaleString()}</h2>`;
        
        this.elements.winAnimation.classList.add('active');
        
        setTimeout(() => {
            this.elements.winAnimation.classList.remove('active');
        }, 3000);
        
        this.updateDisplay();
    }
    
    toggleAutoSpin(count) {
        if (this.state.autoSpinsRemaining > 0) {
            this.state.autoSpinsRemaining = 0;
            this.elements.autoSpin.textContent = `AUTO (5)`;
            return;
        }
        
        this.state.autoSpinsRemaining = count;
        this.elements.autoSpin.textContent = `STOP (${count})`;
        this.processAutoSpin();
    }
    
    processAutoSpin() {
        if (this.state.autoSpinsRemaining <= 0) return;
        
        if (this.state.balance >= this.state.bet) {
            this.spin();
            this.state.autoSpinsRemaining--;
            this.elements.autoSpin.textContent = `STOP (${this.state.autoSpinsRemaining})`;
            
            // Queue next spin
            setTimeout(() => this.processAutoSpin(), 2000);
        } else {
            this.state.autoSpinsRemaining = 0;
            this.elements.autoSpin.textContent = `AUTO (5)`;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const gameManager = new GameManager();
    
    // Expose for debugging
    window.gameManager = gameManager;
});
