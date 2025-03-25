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
    container.innerHTML = characters.map(char => {
        // ファイル名からキャラ名を推測（拡張子とパスを除去）
        let extractedName = char.image.replace(/^images\//, "").replace(/\.\w+$/, "");

        return `<div class="character-card">
            <img src="${char.image.replace(/・/g, "%E3%83%BB")}" alt="${extractedName}">
            <p>名前: ${extractedName}</p>
            <p>攻撃力: ${char.attack}</p>
        </div>`;
    }).join("");
}


loadCharacters();
