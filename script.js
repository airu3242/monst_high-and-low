let players = [];
let currentTurn = 0;
let deck = [];
let pile = [];
let currentCards = [];

async function startGame() {
    const playerInput = document.getElementById("player-names").value;
    players = playerInput.split(",").map(name => ({ name: name.trim(), score: 0 }));

    document.getElementById("title-screen").style.display = "none";
    document.getElementById("game-area").style.display = "block";

    await loadCards();
    drawInitialCards();
}

async function loadCards() {
    try {
        const response = await fetch("cards.json");
        deck = await response.json();
        deck = shuffle(deck);
    } catch (error) {
        console.error("JSONの読み込みに失敗しました。", error);
    }
}

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

function drawInitialCards() {
    if (deck.length < 2) {
        showResults();
        return;
    }
    currentCards = [deck.pop(), deck.pop()];
    updateDisplay();
}

function drawOneCard() {
    if (deck.length > 0) {
        pile.push(deck.pop());
    }
}

function chooseCard(index) {
    let selectedCard = currentCards[index];
    let otherCard = currentCards[1 - index];
    let currentPlayer = players[currentTurn];

    if (selectedCard.attack > otherCard.attack) {
        document.getElementById("correct-sound").play();
        alert(`${currentPlayer.name} 正解！`);
        currentPlayer.score += 1;
        pile = [];
        drawInitialCards();
    } else {
        document.getElementById("wrong-sound").play();
        alert(`${currentPlayer.name} 不正解！`);
        pile.push(currentCards[0], currentCards[1]);
        drawOneCard();
        currentCards = [...pile.slice(-2)];
    }

    if (deck.length === 0) {
        showResults();
    } else {
        nextTurn();
    }
}

function nextTurn() {
    currentTurn = (currentTurn + 1) % players.length;
    updateDisplay();
}

function updateDisplay() {
    document.getElementById("current-player").innerText = players[currentTurn].name;

    document.getElementById("current-cards").innerHTML = currentCards.map((card, index) =>
        `<div class="card" onclick="chooseCard(${index})">
            <img src="${card.image}" width="150" height="200">
            <div class="attack-value" style="display: none;">${card.attack}</div>
        </div>`
    ).join("");

    document.getElementById("pile").innerHTML = pile.map(card =>
        `<img src="${card.image}" width="100" height="150">`
    ).join("");

    document.getElementById("player-scores").innerHTML = players.map(player =>
        `<p>${player.name}: ${player.score}ポイント</p>`
    ).join("");
}

function showResults() {
    document.getElementById("game-area").style.display = "none";
    document.getElementById("result-screen").style.display = "block";

    document.getElementById("result-players").innerHTML = players.map(player =>
        `<p>${player.name}: ${player.score}ポイント</p>`
    ).join("");

    document.getElementById("result-cards").innerHTML = pile.map(card =>
        `<div class="result-card">
            <img src="${card.image}" width="100" height="150">
            <p>${card.attack}</p>
        </div>`
    ).join("");
}

function restartGame() {
    location.reload();
}
