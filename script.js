let players = [];
let currentTurn = 0;
let deck = [];
let pile = [];
let currentCards = [];
let usedCards = new Set();
let currentPoints = 2;

function addPlayer() {
    const playerNameInput = document.getElementById("player-name-input");
    const playerList = document.getElementById("player-list");
    let playerName = playerNameInput.value.trim();
    if (playerName) {
        players.push({ name: playerName, score: 0 });
        let listItem = document.createElement("li");
        listItem.innerText = playerName;
        playerList.appendChild(listItem);
        playerNameInput.value = "";
    }
}

async function startGame() {
    if (players.length === 0) {
        alert("プレイヤーを追加してください。");
        return;
    }
    players = shuffle(players);
    document.getElementById("title-screen").style.display = "none";
    document.getElementById("game-area").style.display = "block";
    await loadCards();
    drawInitialCards();
}

async function loadCards() {
    try {
        const response = await fetch("cards.json");
        deck = await response.json();
        deck = deck.map(card => ({ ...card, image: encodeURI(card.image) }));
        deck = shuffle(deck);
    } catch (error) {
        console.error("JSONの読み込みに失敗しました", error);
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
    currentCards = getUniqueCards(2);
    updateDisplay();
}

function chooseCard(index) {
    if (currentCards.length < 2) return;
    let selectedCard = currentCards[index];
    let otherCard = currentCards[1 - index];
    let currentPlayer = players[currentTurn];

    if (selectedCard.attack > otherCard.attack) {
        document.getElementById("correct-sound").play();
        showPopup(`${currentPlayer.name} 正解！`);
        currentPlayer.score += currentPoints;
    } else {
        document.getElementById("wrong-sound").play();
        showPopup(`${currentPlayer.name} 不正解！`);
    }
    currentPoints = 2;
    nextTurn();
}

function nextTurn() {
    currentTurn = (currentTurn + 1) % players.length;
    if (deck.length < 2) {
        showResults();
    } else {
        drawInitialCards();
    }
}

function updateDisplay() {
    document.getElementById("current-player").innerText = players[currentTurn].name;
    document.getElementById("current-cards").innerHTML = currentCards.map((card, index) =>
        `<div class="card" onclick="chooseCard(${index})">
            <img src="${card.image}" width="200" height="200">
            <div class="attack-value" style="display: none;">${card.attack}</div>
        </div>`
    ).join("");
    document.getElementById("pile-points").innerText = `次の得点: ${currentPoints}点`;
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
    document.getElementById("result-cards").innerHTML = Array.from(usedCards).map(image =>
        `<div class="result-card">
            <img src="${image}" width="100" height="150">
        </div>`
    ).join("");
}

function restartGame() {
    location.reload();
}
