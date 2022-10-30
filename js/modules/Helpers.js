import Vector2 from "./Vector2.js";

export const getMousePos = function (e, canvas) {
    let vw = Math.max(
        document.documentElement.clientWidth || 0,
        window.innerWidth || 0
    );
    let vh = Math.max(
        document.documentElement.clientHeight || 0,
        window.innerHeight || 0
    );
    let offsetY = -8;
    let canvasSize = canvas.node.getBoundingClientRect();
    let canvasHeight = canvasSize.height;
    let canvasWidth = canvasSize.width;

    return new Vector2(
        e.clientX - (vw - canvasWidth) / 2,
        e.clientY - (vh - canvasHeight) / 2 + offsetY
    );
};
