let players = [];
let currentTurn = 0;
let deck = [];
let pile = [];
let currentCards = [];
let usedCardData = []; // 画像と攻撃力のペアを保存
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
        selectedCards.push(card);
    }
    return selectedCards;
}

function chooseCard(index) {
    if (currentCards.length < 2) return;

    let selectedCard = currentCards[index];
    let otherCard = currentCards[1 - index];
    let currentPlayer = players[currentTurn];

    // 比較結果を決める
    let comparisonResult = "";
    if (selectedCard.attack > otherCard.attack) {
        comparisonResult = `攻撃力: ${selectedCard.attack} > ${otherCard.attack}`;
    } else if (selectedCard.attack < otherCard.attack) {
        comparisonResult = `攻撃力: ${selectedCard.attack} < ${otherCard.attack}`;
    } else {
        comparisonResult = `攻撃力: ${selectedCard.attack} = ${otherCard.attack}`;
    }

    // 正解
    if (selectedCard.attack > otherCard.attack) {
        document.getElementById("correct-sound").play();
        showPopup(`${currentPlayer.name} 正解！ ${comparisonResult}`);
        currentPlayer.score += currentPoints;
        currentPoints = 2; 

        if (currentPlayer.score >= 20) {
            usedCardData.push({ image: selectedCard.image, attack: selectedCard.attack });
            usedCardData.push({ image: otherCard.image, attack: otherCard.attack });
            showResults();
            return;
        }

        usedCardData.push({ image: selectedCard.image, attack: selectedCard.attack });
        usedCardData.push({ image: otherCard.image, attack: otherCard.attack });

        drawInitialCards();
    } else {
        document.getElementById("wrong-sound").play();
        showPopup(`${currentPlayer.name} 不正解！ ${comparisonResult}`);
        pile.push(currentCards[0], currentCards[1]);
        drawOneCard();
        if (pile.length >= 2) {
            currentCards = [...pile.slice(-2)];
        }
        currentPoints++;

        usedCardData.push({ image: selectedCard.image, attack: selectedCard.attack });
        usedCardData.push({ image: otherCard.image, attack: otherCard.attack });
    }

    nextTurn();
}

function nextTurn() {
    currentTurn = (currentTurn + 1) % players.length;
    updateDisplay();
}

function updateDisplay() {
    document.getElementById("current-player").innerText = players[currentTurn].name;

    document.getElementById("current-cards").innerHTML = currentCards.map((card, index) =>
        `<div class="card" onclick="chooseCard(${index})">
            <img src="${card.image}" width="150" height="150">
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

    document.getElementById("result-cards").innerHTML = usedCardData.map((card, index) => {
        // 2体ずつ並べて表示
        if (index % 2 === 0) {
            let nextCard = usedCardData[index + 1];
            return `
                <div class="result-card-pair">
                    <div class="result-card">
                        <img src="${card.image}" width="150" height="150">
                        <p>攻撃力: ${card.attack}</p>
                    </div>
                    <div class="result-card">
                        <img src="${nextCard.image}" width="150" height="150">
                        <p>攻撃力: ${nextCard.attack}</p>
                    </div>
                    <p>比較: ${card.attack > nextCard.attack ? `${card.attack} > ${nextCard.attack}` : `${card.attack} < ${nextCard.attack}`}</p>
                </div>
            `;
        }
    }).join("");
}

function restartGame() {
    location.reload();
}
