import {
    drawField,
    setEndcapType,
    setPlayerType,
    setLineColor,
    setPlayerColor,
} from "./modules/Draw.js";

let encapBtns = document.querySelectorAll(".endcap");
let playerShapeBtns = document.querySelectorAll(".player-shape");

const init = function () {
    drawField();
    addListeners();
};

const addListeners = function () {
    const blockEndcapBtn = document.querySelector(".block-endcap");
    const routeEndcapBtn = document.querySelector(".route-endcap");
    const playerCircle = document.querySelector(".canvas-player-circle");
    const playerTriangle = document.querySelector(".canvas-player-triangle");
    const playerSquare = document.querySelector(".canvas-player-square");
    const lineColorPicker = document.querySelector("#line-color-picker");
    const playerColorPicker = document.querySelector("#player-color-picker");
    const printBtn = document.querySelector(".print-btn");

    blockEndcapBtn.addEventListener("click", handleEncapBtnClicked);
    routeEndcapBtn.addEventListener("click", handleEncapBtnClicked);
    playerCircle.addEventListener("click", handlePlayerBtnClicked);
    playerTriangle.addEventListener("click", handlePlayerBtnClicked);
    playerSquare.addEventListener("click", handlePlayerBtnClicked);
    lineColorPicker.addEventListener("input", handleLineColorChange);
    playerColorPicker.addEventListener("input", handlePlayerColorChange);
    printBtn.addEventListener("click", handlePrintBtnClicked);
};

const handleEncapBtnClicked = function (cls) {
    encapBtns.forEach((el) => {
        el.classList.remove("btn-selected");
    });
    this.children[0].classList.add("btn-selected");
    setEndcapType(this.dataset.type);
};

const handlePlayerBtnClicked = function (cls) {
    playerShapeBtns.forEach((el) => {
        el.classList.remove("btn-selected");
    });
    this.children[0].classList.add("btn-selected");
    setPlayerType(this.dataset.type);
};

const handleLineColorChange = function (e) {
    setLineColor(this.value);
};

const handlePlayerColorChange = function (e) {
    setPlayerColor(this.value);
};

const handlePrintBtnClicked = function (e) {
    let btns = document.querySelectorAll("button");

    //disable buttons while downloading
    btns.forEach(function (btn) {
        btn.disabled = true;
    });
    html2canvas(document.querySelector("#canvas-container")).then((canvas) => {
        var image = canvas.toDataURL();
        var downloadLink = document.createElement("a");
        downloadLink.download = document
            .getElementById("play-name")
            .value.split(" ")
            .join("_");
        downloadLink.href = image;
        downloadLink.click();

        btns.forEach(function (btn) {
            btn.disabled = false;
        });
    });
};

init();
