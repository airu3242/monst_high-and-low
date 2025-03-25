async function loadCharacters() {
    try {
        const response = await fetch("cards.json");
        const characters = await response.json();
        displayCharacters(characters);
    } catch (error) {
        console.error("キャラクターの読み込みに失敗しました", error);
    }
}

function displayCharacters(characters) {
    const container = document.getElementById("character-list");
    container.innerHTML = characters.map(char =>
        `<div class="character-card">
            <img src="${char.image.replace(/・/g, "%E3%83%BB")}" alt="${char.name}">
            <p>${char.name}</p>
        </div>`
    ).join("");
}

loadCharacters();
