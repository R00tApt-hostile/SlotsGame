// Game state
let gameState = {
    currentScene: null,
    inventory: [],
    visitedScenes: {},
    gameStarted: false
};

// Game scenes
const scenes = {
    start: {
        title: "The Adventure Begins",
        text: "You find yourself standing at the edge of a dark forest. The wind whispers through the trees, and a narrow path leads into the shadows. To the east, you see a small cottage with smoke rising from its chimney.",
        choices: [
            { text: "Enter the forest", nextScene: "forest", action: null },
            { text: "Approach the cottage", nextScene: "cottage", action: null },
            { text: "Check your backpack", nextScene: "inventory", action: null }
        ]
    },
    forest: {
        title: "Dark Forest",
        text: "The trees loom overhead, blocking most of the sunlight. The air is damp and cool. You hear strange noises in the distance.\n\nA squirrel suddenly runs across your path and disappears into the bushes.",
        choices: [
            { text: "Follow the squirrel", nextScene: "squirrel", action: null },
            { text: "Continue deeper into the forest", nextScene: "deepForest", action: null },
            { text: "Return to the forest edge", nextScene: "start", action: null },
            { text: "Check your backpack", nextScene: "inventory", action: null }
        ]
    },
    deepForest: {
        title: "Deep in the Forest",
        text: "The forest grows even darker here. You can barely see the path anymore. There's an eerie feeling in the air.\n\nYou notice a small, glowing mushroom growing at the base of a tree.",
        choices: [
            { text: "Pick up the glowing mushroom", nextScene: "deepForest", action: () => {
                if (!gameState.inventory.includes("glowing mushroom")) {
                    gameState.inventory.push("glowing mushroom");
                    return "You carefully pick up the glowing mushroom. It feels warm to the touch.";
                }
                return "You already have the glowing mushroom.";
            }},
            { text: "Look around more carefully", nextScene: "deepForest", action: () => {
                return "You spot a faint trail leading north. It wasn't visible at first glance.";
            }},
            { text: "Return to the forest edge", nextScene: "start", action: null },
            { text: "Check your backpack", nextScene: "inventory", action: null }
        ]
    },
    cottage: {
        title: "The Old Cottage",
        text: "As you approach the cottage, the smell of freshly baked bread fills the air. The door creaks open slightly, as if inviting you in.\n\nAn old woman's voice calls out: 'Come in, traveler, but mind the cat!'",
        choices: [
            { text: "Enter the cottage", nextScene: "insideCottage", action: null },
            { text: "Call out a greeting", nextScene: "cottage", action: () => {
                return "The old woman replies: 'Don't be shy, dearie! The tea's getting cold!'";
            }},
            { text: "Return to the forest edge", nextScene: "start", action: null },
            { text: "Check your backpack", nextScene: "inventory", action: null }
        ]
    },
    insideCottage: {
        title: "Inside the Cottage",
        text: "The cottage is cozy and warm. A fire crackles in the hearth, and a black cat watches you from a rocking chair.\n\nThe old woman gestures to a seat at the table, where a steaming cup of tea awaits.",
        choices: [
            { text: "Drink the tea", nextScene: "tea", action: null },
            { text: "Ask about the forest", nextScene: "insideCottage", action: () => {
                return "'Oh, the forest is full of secrets,' the old woman says with a twinkle in her eye. 'But you'll need light to find them.' She glances at your empty hands meaningfully.";
            }},
            { text: "Pet the cat", nextScene: "insideCottage", action: () => {
                if (!gameState.inventory.includes("cat hair")) {
                    gameState.inventory.push("cat hair");
                    return "The cat purrs loudly and leaves some hair on your sleeve. You collect it, just in case.";
                }
                return "The cat purrs but doesn't leave any more hair.";
            }},
            { text: "Leave the cottage", nextScene: "cottage", action: null },
            { text: "Check your backpack", nextScene: "inventory", action: null }
        ]
    },
    tea: {
        title: "A Strange Brew",
        text: "As you drink the tea, you feel a strange tingling sensation. The room seems to shift and change around you.\n\nWhen the sensation passes, you find yourself... somewhere else entirely.",
        choices: [
            { text: "Look around", nextScene: "magicRealm", action: null },
            { text: "Panic", nextScene: "magicRealm", action: () => {
                return "Your panic subsides as you realize you're not in immediate danger. The air here smells like lavender and something... magical.";
            }}
        ]
    },
    magicRealm: {
        title: "The Magic Realm",
        text: "You're in a glowing meadow under a purple sky. Strange flowers emit soft light, and in the distance, you see a crystal tower.\n\nA small fairy flies up to you and giggles.",
        choices: [
            { text: "Talk to the fairy", nextScene: "fairy", action: null },
            { text: "Head toward the crystal tower", nextScene: "crystalTower", action: null },
            { text: "Try to return home", nextScene: "magicRealm", action: () => {
                return "The fairy laughs: 'Oh no, you can't leave that easily! You need a portal stone!'";
            }},
            { text: "Check your backpack", nextScene: "inventory", action: null }
        ]
    },
    fairy: {
        title: "The Talkative Fairy",
        text: "The fairy flits around your head. 'You're not from around here, are you?' she asks. 'The old witch's tea, I bet! She's always sending people here.'\n\n'If you want to go back, you'll need a portal stone. I might have one... for a price.'",
        choices: [
            { text: "Ask what she wants", nextScene: "fairyDeal", action: null },
            { text: "Search your inventory for something to trade", nextScene: "inventoryTrade", action: null },
            { text: "Refuse and head to the tower", nextScene: "crystalTower", action: null }
        ]
    },
    fairyDeal: {
        title: "The Fairy's Price",
        text: "'I collect interesting things from other realms,' the fairy says. 'Something shiny, or something furry. Do you have anything like that?'",
        choices: [
            { text: "Offer glowing mushroom", nextScene: "fairyTrade", action: () => {
                if (gameState.inventory.includes("glowing mushroom")) {
                    return "You offer the glowing mushroom.";
                }
                return "You don't have a glowing mushroom to offer.";
            }},
            { text: "Offer cat hair", nextScene: "fairyTrade", action: () => {
                if (gameState.inventory.includes("cat hair")) {
                    return "You offer the cat hair.";
                }
                return "You don't have any cat hair to offer.";
            }},
            { text: "Say you have nothing", nextScene: "fairy", action: null }
        ]
    },
    fairyTrade: {
        title: "The Trade",
        text: "'Oh! This will do nicely!' the fairy exclaims. She hands you a small, glowing blue stone. 'Just crush this in your hand when you want to go back.'",
        choices: [
            { text: "Crush the stone now", nextScene: "end", action: () => {
                gameState.inventory.push("portal stone (used)");
                return "As you crush the stone, everything dissolves into blue light...";
            }},
            { text: "Keep the stone and explore more", nextScene: "magicRealm", action: () => {
                gameState.inventory.push("portal stone");
                return "You pocket the stone and look around the magical realm.";
            }}
        ]
    },
    crystalTower: {
        title: "Crystal Tower",
        text: "The tower shimmers in the distance. As you approach, you see that it's made entirely of glowing crystals. The door stands slightly ajar.",
        choices: [
            { text: "Enter the tower", nextScene: "towerInside", action: null },
            { text: "Return to the fairy", nextScene: "fairy", action: null },
            { text: "Check your backpack", nextScene: "inventory", action: null }
        ]
    },
    towerInside: {
        title: "Inside the Tower",
        text: "The interior of the tower is even more breathtaking. Crystals of all colors grow from the walls and ceiling, casting rainbow patterns everywhere.\n\nIn the center of the room floats a large, pulsating crystal.",
        choices: [
            { text: "Touch the floating crystal", nextScene: "end", action: () => {
                return "As your fingers make contact, a blinding light envelops you. You feel yourself being pulled through space and time...";
            }},
            { text: "Take a small crystal shard", nextScene: "towerInside", action: () => {
                if (!gameState.inventory.includes("crystal shard")) {
                    gameState.inventory.push("crystal shard");
                    return "You carefully break off a small crystal shard. It glows faintly in your hand.";
                }
                return "You already have a crystal shard.";
            }},
            { text: "Leave the tower", nextScene: "crystalTower", action: null }
        ]
    },
    end: {
        title: "The End",
        text: "You wake up back at the edge of the forest. Was it all a dream? But then you notice something in your pocket...",
        choices: [
            { text: "Start a new adventure", nextScene: "start", action: () => {
                resetGame();
                return "You take a deep breath and prepare for another adventure!";
            }}
        ]
    },
    inventory: {
        title: "Your Backpack",
        text: "",
        choices: [
            { text: "Return to the adventure", nextScene: null, action: null }
        ],
        special: function() {
            if (gameState.inventory.length === 0) {
                this.text = "Your backpack is empty.";
            } else {
                this.text = "You are carrying:\n" + gameState.inventory.join("\n");
            }
            return this;
        }
    },
    inventoryTrade: {
        title: "Your Backpack",
        text: "",
        choices: [],
        special: function() {
            if (gameState.inventory.length === 0) {
                this.text = "Your backpack is empty. You have nothing to trade.";
                this.choices = [{ text: "Return to the fairy", nextScene: "fairy", action: null }];
            } else {
                this.text = "You could offer:\n" + gameState.inventory.join("\n");
                this.choices = gameState.inventory.map(item => ({
                    text: `Offer ${item}`,
                    nextScene: "fairyTrade",
                    action: null
                }));
                this.choices.push({ text: "Never mind", nextScene: "fairy", action: null });
            }
            return this;
        }
    }
};

// DOM elements
const storyTextEl = document.getElementById('story-text');
const choicesEl = document.getElementById('choices');
const inventoryEl = document.getElementById('inventory');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

// Initialize the game
function initGame() {
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', resetGame);
}

// Start the game
function startGame() {
    gameState.gameStarted = true;
    startBtn.classList.add('hidden');
    restartBtn.classList.remove('hidden');
    loadScene('start');
}

// Reset the game
function resetGame() {
    gameState = {
        currentScene: null,
        inventory: [],
        visitedScenes: {},
        gameStarted: true
    };
    loadScene('start');
}

// Load a scene
function loadScene(sceneId) {
    let scene = scenes[sceneId];
    
    // Handle special scenes (like inventory)
    if (scene.special) {
        scene = scene.special();
    }
    
    gameState.currentScene = sceneId;
    
    // Mark scene as visited
    if (!gameState.visitedScenes[sceneId]) {
        gameState.visitedScenes[sceneId] = true;
    }
    
    // Display scene title and text
    storyTextEl.innerHTML = `<strong>${scene.title}</strong>\n\n${scene.text}`;
    
    // Update inventory display
    updateInventory();
    
    // Clear previous choices
    choicesEl.innerHTML = '';
    
    // Add new choices
    scene.choices.forEach(choice => {
        const button = document.createElement('button');
        button.textContent = choice.text;
        button.className = 'choice-btn';
        button.addEventListener('click', () => {
            if (choice.action) {
                const result = choice.action();
                if (result) {
                    storyTextEl.innerHTML = `<strong>${scene.title}</strong>\n\n${scene.text}\n\n${result}`;
                }
            }
            if (choice.nextScene) {
                loadScene(choice.nextScene);
            }
        });
        choicesEl.appendChild(button);
    });
}

// Update inventory display
function updateInventory() {
    if (gameState.inventory.length === 0) {
        inventoryEl.textContent = "Inventory: Empty";
    } else {
        inventoryEl.textContent = "Inventory: " + gameState.inventory.join(", ");
    }
}

// Initialize the game when the page loads
window.onload = initGame;
