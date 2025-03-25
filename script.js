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

    // 比較結果を決定
    let comparisonResult = selectedCard.attack > otherCard.attack ? '>' : '<';
    let resultMessage = `${currentPlayer.name}の回答: ${selectedCard.attack} ${comparisonResult} ${otherCard.attack}`;

    // 正解
    if (selectedCard.attack > otherCard.attack) {
        document.getElementById("correct-sound").play();
        resultMessage += " → 正解！";
        showPopup(resultMessage);
        currentPlayer.score += currentPoints;
        currentPoints = 2; 

        if (currentPlayer.score >= 20) {
            usedCardData.push({ 
                player: currentPlayer.name, 
                image: selectedCard.image, 
                attack: selectedCard.attack, 
                isCorrect: true 
            });
            usedCardData.push({ 
                player: currentPlayer.name, 
                image: otherCard.image, 
                attack: otherCard.attack, 
                isCorrect: true 
            });
            showResults();
            return;
        }

        usedCardData.push({ 
            player: currentPlayer.name, 
            image: selectedCard.image, 
            attack: selectedCard.attack, 
            isCorrect: true 
        });
        usedCardData.push({ 
            player: currentPlayer.name, 
            image: otherCard.image, 
            attack: otherCard.attack, 
            isCorrect: true 
        });

        drawInitialCards();
    } else {
        document.getElementById("wrong-sound").play();
        resultMessage += " → 不正解！";
        showPopup(resultMessage);
        pile.push(currentCards[0], currentCards[1]);
        drawOneCard();
        if (pile.length >= 2) {
            currentCards = [...pile.slice(-2)];
        }
        currentPoints++;

        usedCardData.push({ 
            player: currentPlayer.name, 
            image: selectedCard.image, 
            attack: selectedCard.attack, 
            isCorrect: false 
        });
        usedCardData.push({ 
            player: currentPlayer.name, 
            image: otherCard.image, 
            attack: otherCard.attack, 
            isCorrect: false 
        });
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

    // プレイヤーのスコアを表示
    document.getElementById("result-players").innerHTML = players.map(player =>
        `<p>${player.name}: ${player.score}ポイント</p>`
    ).join("");

    // リザルト表示: 画像、比較、回答者とその正誤を含む
    document.getElementById("result-cards").innerHTML = usedCardData.map((card, index) => {
        // 次のカードとのペアを取得
        let nextCard = usedCardData[index + 1];
        if (!nextCard) return ""; // 最後のカードペアはスキップ

        // 比較結果を計算
        let comparison = card.attack > nextCard.attack ? '>' : '<';
        let answerMessage = card.isCorrect ? `${card.player} 正解！` : `${card.player} 不正解！`;

        // 不正解時は回答を表示しない
        if (!card.isCorrect) {
            answerMessage = `${card.player} 不正解！`;
        }

        // 一問一行の表示形式
        return `
            <p>${card.player}の回答: ${card.attack} ${comparison} ${nextCard.attack} → ${answerMessage}</p>
            <div class="result-card" style="display: inline-block;">
                <img src="${card.image}" width="150" height="150">
                <p>攻撃力: ${card.attack}</p>
            </div>
            <p>${comparison}</p>
            <div class="result-card" style="display: inline-block;">
                <img src="${nextCard.image}" width="150" height="150">
                <p>攻撃力: ${nextCard.attack}</p>
            </div>
            <br>
        `;
    }).join("");
}

function restartGame() {
    location.reload();
}
