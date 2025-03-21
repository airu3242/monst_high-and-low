let players = [];
let currentTurn = 0;
let deck = [];
let pile = [];
let currentCards = [];
let usedCards = new Set();
let currentPoints = 2; // 最初の得点は2点

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

function drawOneCard() {
    if (deck.length > 0) {
        let newCard = getUniqueCards(1)[0];
        if (newCard) pile.push(newCard);
    }
}

function getUniqueCards(count) {
    let selectedCards = [];
    while (selectedCards.length < count && deck.length > 0) {
        let card = deck.pop();
        if (!usedCards.has(card.image)) {
            usedCards.add(card.image);
            selectedCards.push(card);
        }
    }
    return selectedCards;
}

function chooseCard(index) {
    if (currentCards.length < 2) return;

    let selectedCard = currentCards[index];
    let otherCard = currentCards[1 - index];
    let currentPlayer = players[currentTurn];

    if (selectedCard.attack > otherCard.attack) {
        document.getElementById("correct-sound").play();
        showPopup(`${currentPlayer.name} 正解！ ${selectedCard.attack} vs ${otherCard.attack}`);
        currentPlayer.score += currentPoints;
        currentPoints = 2; // 正解したら次のターンの得点はリセット
        pile = [];
        if (deck.length > 0) {
            drawInitialCards();
        } else {
            showResults();
        }
    } else {
        document.getElementById("wrong-sound").play();
        showPopup(`${currentPlayer.name} 不正解！`);
        pile.push(currentCards[0], currentCards[1]);
        drawOneCard();
        if (pile.length >= 2) {
            currentCards = [...pile.slice(-2)];
        }
        currentPoints++; // 間違えたら次のターンの得点が増加
    }

    if (deck.length === 0 && pile.length < 2) {
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

    document.getElementById("pile-points").innerText = `次の得点: ${currentPoints}点`;

    document.getElementById("player-scores").innerHTML = players.map(player =>
        `<p>${player.name}: ${player.score}ポイント</p>`
    ).join("");
}

function showPopup(message) {
    let popup = document.getElementById("popup-message");
    popup.innerText = message;
    popup.style.display = "block";
    setTimeout(() => {
        popup.style.display = "none";
    }, 2000);
}

function showResults() {
    document.getElementById("game-area").style.display = "none";
    document.getElementById("result-screen").style.display = "block";

    document.getElementById("result-players").innerHTML = players.map(player =>
        `<p>${player.name}: ${player.score}ポイント</p>`
    ).join("");

    document.getElementById("result-cards").innerHTML = Array.from(usedCards).map(image => {
        let card = [...deck, ...pile].find(c => c.image === image);
        return `<div class="result-card">
            <img src="${image}" width="100" height="150">
            <p>攻撃力: ${card ? card.attack : "不明"}</p>
        </div>`;
    }).join("");
}

function restartGame() {
    location.reload();
}
