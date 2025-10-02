let currentPile = "A";
let imagesA = ["pileA/image1.png", "pileA/image2.png", "pileB/image3.png", "pileB/image4.png"]; // Add your image paths
let imagesB = ["pileB/image1.jpeg", "pileB/image2.jpeg", "pileB/image3.jpeg", "pileB/image4.jpeg"]; // Add your image paths
let textsC = ["Text 1", "Text 2", "Text 3", "Text 4"]; // Add your text items
let displayCount = 0;

function flipCoin() {
    return Math.random() < 0.5 ? "heads" : "tails";
}

function getTimeBasedCategory() {
    const currentTime = new Date();
    return currentTime.getSeconds() % 2 === 0 ? "A" : "B";
}

function displayItem() {
    if (currentPile === "A") {
        const randomIndex = Math.floor(Math.random() * imagesA.length);
        document.getElementById("imageDisplay").src = imagesA[randomIndex];
        document.getElementById("imageDisplay").style.display = "block";
        document.getElementById("textDisplay").style.display = "none";
    } else if (currentPile === "B") {
        const randomIndex = Math.floor(Math.random() * imagesB.length);
        document.getElementById("imageDisplay").src = imagesB[randomIndex];
        document.getElementById("imageDisplay").style.display = "block";
        document.getElementById("textDisplay").style.display = "none";
    } else if (currentPile === "C") {
        const randomIndex = Math.floor(Math.random() * textsC.length);
        document.getElementById("textDisplay").innerText = textsC[randomIndex];
        document.getElementById("textDisplay").style.display = "block";
        document.getElementById("imageDisplay").style.display = "none";
    }
}

document.getElementById("nextButton").addEventListener("click", () => {
    const flipResult = flipCoin();
    if (flipResult === "heads") {
        currentPile = currentPile === "A" ? "A" : "B"; // Stay in current pile
    } else {
        currentPile = currentPile === "A" ? "B" : "C"; // Switch to other
    }

    displayItem();

    // Set a reset timer based on even/odd seconds.
    setTimeout(() => {
        if (currentPile === "C") {
            currentPile = flipCoin() === "heads" ? "A" : "B"; // Reset back to A or B
        }
        displayItem();
    }, Math.random() * 5000 + 2000); // Random
