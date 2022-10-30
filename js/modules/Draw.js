import Vector2 from "./Vector2.js";
import { getMousePos } from "./Helpers.js";

const canvas = SVG()
    .addTo("#canvas-container")
    .size("100%", "100%")
    .id("playbook-editor");
let currStroke = null;
let currPoints = [];
let startPoint = new Vector2();
let mousePos = new Vector2();
let guideStroke = null;
let currGuidePoints = [];
let isEditing = false;
let arrowX = 10;
let arrowY = 15;
let strokeThickness = 3;
let strokeColor = "#383838";
let guideThickness = 2.5;
let arrowOffset = -3;
let playerSize = 25;
let playerStrokeWidth = 3;
let selectedPlayer = null;
let draggablePlayer = null;
let currSelectedPlayerPos = null;
let endcapType = "route";
let playerType = "circle";
let playerColor = "#ffffff";
let endcapSize = 20;

const handleCanvasMouseDown = function (e) {
    let target = e.target;
    mousePos = getMousePos(e, canvas);
    currSelectedPlayerPos = mousePos;

    //when not clicking player node
    if (!target.classList.contains("player") && !isEditing && e.which === 1) {
        drawPlayer(e, mousePos);
    } else if (
        !target.classList.contains("player") &&
        isEditing &&
        e.which === 1
    ) {
        editCurrStroke(mousePos);
    }
};

const mouseDrag = function (e) {
    mousePos = getMousePos(e, canvas);
    let lastPoint = currPoints[currPoints.length - 1];

    // currStroke.clear();
    // currStroke.plot([
    //     ...currPoints.map((vec2) => vec2.toArray()),
    //     mousePos.toArray(),
    // ]);

    guideStroke.clear();
    guideStroke
        .plot([
            ...currGuidePoints.map((vec2) => vec2.toArray()),
            mousePos.toArray(),
        ])
        .marker("end", 3, 3, function (add) {
            add.circle(3).fill("#a0a0a0");
        });
};

const handleMouseUp = function (e) {
    endPlayerDrag();
    // canvas.off("mousemove", mouseDrag);
};

const handleKeyboardInput = function (e) {
    if (
        (e.key === "Enter" || e.key === "Escape" || e.key === " ") &&
        isEditing
    ) {
        if (currPoints.length > 1) {
            endStroke();
        } else {
            endEmptyStroke();
        }
    }
};

const startStroke = function (playerEl) {
    // only left click
    startPoint = new Vector2(playerEl.cx(), playerEl.cy());

    if (!isEditing) {
        currPoints.push(startPoint);
        currGuidePoints = [startPoint];

        // guide line
        guideStroke = canvas
            .polyline(currGuidePoints.map((vec2) => vec2.toArray()))
            .fill("none")
            .stroke({
                color: "#a0a0a0",
                width: guideThickness,
                linecap: "round",
                linejoin: "round",
            })
            .addClass("guide");

        // main stroke
        currStroke = canvas
            .polyline(currPoints.map((vec2) => vec2.toArray()))
            .fill("none")
            .stroke({
                color: strokeColor,
                width: strokeThickness,
                linecap: "round",
                linejoin: "round",
            })
            .addClass("route");

        isEditing = true;
        canvas.on("mousemove", mouseDrag);
    }
};

const drawArrowEndcap = function () {
    selectedPlayer.node.classList.remove("highlighted-player");
    let lastPoint = currPoints[currPoints.length - 1];
    let strokeGroup = canvas.group();
    let arrowGroup = canvas.group();
    let arrowLineLeft = canvas.line(-arrowX, arrowY, 0, 0).addClass("route");
    arrowLineLeft
        .stroke({
            color: strokeColor,
            width: strokeThickness,
            linecap: "round",
        })
        .addClass("route");
    let arrowLineRight = canvas.line(0, 0, arrowX, arrowY).addClass("route");
    arrowLineRight
        .stroke({
            color: strokeColor,
            width: strokeThickness,
            linecap: "round",
        })
        .addClass("route");
    let lastStrokeAdjustedAngle =
        currPoints[currPoints.length - 2].adjustedAngleTo(lastPoint);
    let lastStrokeAngle = currPoints[currPoints.length - 2].angleTo(lastPoint);
    let lastStrokeVecOffset = lastPoint.offset(lastStrokeAngle, arrowOffset);

    arrowGroup.add(arrowLineLeft);
    arrowGroup.add(arrowLineRight);

    // arrowGroup.center(lastPoint.x, lastPoint.y);
    arrowGroup.center(lastStrokeVecOffset.x, lastStrokeVecOffset.y);
    arrowGroup.rotate(lastStrokeAdjustedAngle);

    strokeGroup
        .add(currStroke)
        .add(arrowGroup)
        .on("contextmenu", handlePlayerRightClicked);
};

const editCurrStroke = function (mousePosition) {
    currPoints.push(mousePosition);

    currStroke.clear();
    currStroke.plot([
        ...currPoints.map((vec2) => vec2.toArray()),
        mousePosition.toArray(),
    ]);

    currGuidePoints = [mousePosition];
};

const endStroke = function () {
    selectedPlayer.node.classList.remove("highlighted-player");
    if (endcapType === "route") {
        drawArrowEndcap();
    } else {
        drawBlockEndcap();
    }

    canvas.off("mousemove", mouseDrag);
    currPoints = [];
    isEditing = false;

    guideStroke.clear();
    guideStroke.plot([]);

    //adjust selected player z-index hack
    SVG.find(".player").each(function (el) {
        canvas.node.appendChild(el.node);
    });
    selectedPlayer = null;
};

const drawBlockEndcap = function () {
    let strokeGroup = canvas.group();

    selectedPlayer.node.classList.remove("highlighted-player");
    let lastPoint = currPoints[currPoints.length - 1];
    let blockLine = canvas.line(0, 0, endcapSize, 0).addClass("blockline");
    blockLine
        .stroke({
            color: strokeColor,
            width: strokeThickness,
            linecap: "round",
        })
        .addClass("route");
    let lastStrokeAdjustedAngle =
        currPoints[currPoints.length - 2].adjustedAngleTo(lastPoint);

    blockLine.center(lastPoint.x, lastPoint.y);
    blockLine.rotate(lastStrokeAdjustedAngle);

    strokeGroup
        .add(currStroke)
        .add(blockLine)
        .on("contextmenu", handlePlayerRightClicked);
};

const endEmptyStroke = function () {
    selectedPlayer.node.classList.remove("highlighted-player");
    canvas.off("mousemove", mouseDrag);
    currPoints = [];
    isEditing = false;
    guideStroke.clear();
    guideStroke.plot([]);
    selectedPlayer = null;
};

export const drawField = function () {
    let canvasSize = canvas.node.getBoundingClientRect();
    let canvasHeight = canvasSize.height;
    let canvasWidth = canvasSize.width;
    let yardLines = 6;
    let yardLineYSpacing = canvasHeight / yardLines;
    let lastYardLineY = 0;
    let hashLines = yardLines * 5;
    let lastHashLineY = 0;
    let numHashMarkers = 4;
    let hashLen = 30;
    let hashLineSpacing = canvasHeight / hashLines;
    let hashMarkerSpacing = [
        0,
        canvasWidth * 0.4 - hashLen,
        canvasWidth * 0.6,
        canvasWidth - hashLen,
    ];
    let lastHashMarkerX = 0;

    for (let a = 0; a < numHashMarkers; a++) {
        lastHashMarkerX = hashMarkerSpacing[a];
        for (let i = 0; i < hashLines; i++) {
            canvas
                .line(
                    lastHashMarkerX,
                    lastHashLineY + hashLineSpacing,
                    lastHashMarkerX + hashLen,
                    lastHashLineY + hashLineSpacing
                )
                .stroke({
                    color: "#fff",
                    width: 3,
                    linecap: "straight",
                })
                .addClass("field-line");

            lastHashLineY += hashLineSpacing;
        }
        lastHashLineY = 0;
    }

    for (let i = 0; i < yardLines; i++) {
        canvas
            .line(
                0,
                lastYardLineY + yardLineYSpacing,
                canvasWidth,
                lastYardLineY + yardLineYSpacing
            )
            .stroke({
                color: i === yardLines - 3 ? "#527ed1" : "#fff",
                width: i === yardLines - 3 ? 5 : 3,
                linecap: "straight",
            })
            .addClass("field-line");

        lastYardLineY += yardLineYSpacing;
    }

    //raise player and line z-index after resize
    let routes = document.querySelectorAll(".route");
    let players = document.querySelectorAll(".player");
    let groups = document.querySelectorAll("g");

    // routes.forEach((route) => {
    //     console.log(route.transform.baseVal);
    //     canvas.node.appendChild(route);
    // });

    players.forEach((player) => {
        canvas.node.appendChild(player);
    });

    groups.forEach((group) => {
        let transform = group.transform.baseVal[0];
        canvas.node.appendChild(group);
        if (transform) {
            group.transform.baseVal[0].setMatrix(transform.matrix);
        }
    });
};

const handlePlayerMouseDown = function (e) {
    currSelectedPlayerPos = draggablePlayer = this;
    window.addEventListener("mousemove", dragPlayer);
};

const dragPlayer = function (e) {
    mousePos = getMousePos(e, canvas);
    draggablePlayer.center(mousePos.x, mousePos.y);
};

const endPlayerDrag = function (e) {
    draggablePlayer = null;
    window.removeEventListener("mousemove", dragPlayer);
};

const handlePlayerClicked = function (e) {
    mousePos = getMousePos(e, canvas);
    if (e.which === 1) {
        if (
            currSelectedPlayerPos.x === mousePos.x &&
            currSelectedPlayerPos.y === mousePos.y
        ) {
            selectedPlayer = this;
            selectedPlayer.node.classList.add("highlighted-player");
            startStroke(this);
        }
    }
};

const handlePlayerRightClicked = function (e) {
    e.preventDefault();
    this.remove();
    return false;
};

const drawPlayer = function (e, mousePosition) {
    switch (playerType) {
        case "circle":
            canvas
                .circle(playerSize)
                .center(mousePosition.x, mousePosition.y)
                .fill(playerColor)
                .stroke({ color: "#696969", width: playerStrokeWidth })
                .addClass("player")
                .on("mousedown", handlePlayerMouseDown)
                .on("click", handlePlayerClicked)
                .on("contextmenu", handlePlayerRightClicked, false);
            break;
        case "triangle":
            let triangle = canvas
                .polygon([
                    [-13, 23],
                    [0, 0],
                    [0, 0],
                    [13, 23],
                    [-13, 23],
                    [13, 23],
                ])
                .fill(playerColor)
                .stroke({
                    color: "#696969",
                    width: strokeThickness,
                    linecap: "round",
                })
                .center(mousePosition.x, mousePosition.y)
                .addClass("player")
                .on("mousedown", handlePlayerMouseDown)
                .on("click", handlePlayerClicked)
                .on("contextmenu", handlePlayerRightClicked, false);
            break;
        case "square":
            let backgroud = canvas
                .rect(23, 23)
                .fill(playerColor)
                .stroke({
                    color: "#696969",
                    width: strokeThickness,
                    linecap: "round",
                })
                .center(mousePosition.x, mousePosition.y)
                .addClass("player")
                .on("mousedown", handlePlayerMouseDown)
                .on("click", handlePlayerClicked)
                .on("contextmenu", handlePlayerRightClicked, false);
            break;
        default:
            canvas
                .circle(playerSize)
                .center(mousePosition.x, mousePosition.y)
                .fill(playerColor)
                .stroke({ color: "#696969", width: playerStrokeWidth })
                .addClass("player")
                .on("mousedown", handlePlayerMouseDown)
                .on("click", handlePlayerClicked)
                .on("contextmenu", handlePlayerRightClicked, false);
            break;
    }
};

const clearFieldLines = function (e) {
    SVG.find(".field-line").each(function (el) {
        el.remove();
    });
};

const redrawField = function () {
    clearFieldLines();
    drawField();
};

export const setEndcapType = function (type) {
    endcapType = type;
};

export const setPlayerType = function (type) {
    playerType = type;
};

export const setLineColor = function (color) {
    strokeColor = color;
};

export const setPlayerColor = function (color) {
    playerColor = color;
};

canvas.on("mousedown", handleCanvasMouseDown);
window.addEventListener("mouseup", handleMouseUp);
window.addEventListener("keydown", handleKeyboardInput);
window.addEventListener("resize", redrawField);
