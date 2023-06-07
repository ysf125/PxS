export { PXS, movePoint, randomNum, arraysEqual, isMatrix, ObjectCombiner, mapMatrix }

function randomNum(min, max) { return Math.round(Math.random() * (max - min) + min) }
function arraysEqual(a, b) { return JSON.stringify(a) === JSON.stringify(b) ? true : false }
function isMatrix(a) { return Array.isArray(a[0]) && typeof a[0] !== 'string' ? true : false }
function isNegativeNum(Num) { return Math.abs(Num) !== Num ? true : false }

function mapMatrix(matrix, callBack) {
    let returnVal = [], array = []
    globalThis.OUT = 0; globalThis.IN = 0
    for (OUT = 0; OUT < matrix.length; OUT++) {
        for (IN = 0; IN < matrix[OUT].length; IN++) {
            array.push(callBack(matrix[OUT][IN]))
        }
        returnVal.push(array); array = []
    }
    return returnVal
}

function ObjectCombiner(keys, values) {
    let returnVal = {}
    for (let i = 0; i < keys.length; i++) {
        returnVal[keys[i]] = values[i]
    } return returnVal
}

function movePoint(pointXY, dir, D = 1) {
    let z = dir !== 2 && dir !== 6 ? 180 : 0
        , deg = (90 - 45 * dir) % 360, radians = deg * (Math.PI / 180)
        , newX = pointXY[0] + (D * Math.cos(radians))
        , newY = pointXY[1] + (D * Math.sin(radians + z * (Math.PI / 180)))
    return [newX, newY].map(e => Math.round(e))
}

class PXS {

    #pxXY; #pxSize; canvas; #ctx; width; height
    // default options = { bg: "white" , color: "black" , grid: 0 , gridColor: "gray" , mode : "screen"}
    // here in PXS class you can choose "screen" or "paint" as mode for your pixel screen
    constructor(pxXY, pxSize, id, options) {
        this.#pxXY = pxXY.map(e => Math.round(e))
        this.#pxSize = pxSize
        this.canvas = document.getElementById(id)
        this.#ctx = document.getElementById(id).getContext("2d", { willReadFrequently: true })
        this.options = this.#defaultOptions(options)
        this.width = (pxSize * pxXY[0]) + ((pxXY[0] - 1) * options.grid)
        this.height = (pxSize * pxXY[1]) + ((pxXY[1] - 1) * options.grid)
        this.canvas.setAttribute("width", this.width)
        this.canvas.setAttribute("height", this.height)
        this.restart()
        this.#paintMode()
    }

    #paintMode() {
        if (this.options.mode.toLowerCase() == "paint") {
            let isDrawing = false,
                pxSize = this.#pxSize
            this.canvas.addEventListener('mousedown', e => {
                isDrawing = true
                let xy = [e.offsetX, e.offsetY].map(XY => Math.floor(XY / (pxSize + this.options.grid)))
                this.drawPixels([xy])

                this.canvas.addEventListener('mousemove', e => {
                    if (isDrawing === true) {
                        let xy = [e.offsetX, e.offsetY].map(XY => Math.floor(XY / (pxSize + this.options.grid)))
                        this.drawPixels([xy])
                    }
                })
                document.addEventListener('mouseup', e => isDrawing === true ? isDrawing = false : 0)
            })
        }
    }

    #getPos(pointXY) {
        let pxSize = this.#pxSize,
            x = pointXY[0] == 0 ? 0 : (pointXY[0] * pxSize) + (pointXY[0] * this.options.grid),
            y = pointXY[1] == 0 ? 0 : (pointXY[1] * pxSize) + (pointXY[1] * this.options.grid)
        return [x, y]
    }

    #defaultOptions(options) {
        let defaultOptions = { mode: "screen", bg: "white", color: "black", grid: 0, gridColor: "Gray" },
            keys = Object.keys(defaultOptions)
        for (let i = 0; i < keys.length; i++) {
            if (options[keys[i]] == undefined) {
                options[keys[i]] = defaultOptions[keys[i]]
            }
        }
        return options
    }

    #drawGrid(start = [0, 0], end = this.#pxXY) {
        let grid = this.options.grid
        this.#ctx.fillStyle = this.options.gridColor
        for (let i = start[0]; i < end[0]; i++) {
            let z = i == 0 ? this.#pxSize : (this.#pxSize * (i + 1)) + (grid * i)
            this.#ctx.fillRect(z, 0, grid, this.height)
        }
        for (let x = start[1]; x < end[1]; x++) {
            let z = x == 0 ? this.#pxSize : (this.#pxSize * (x + 1)) + (grid * x)
            this.#ctx.fillRect(0, z, this.width, grid)
        }
    }

    floodFill(pointXY, newColor = this.options.color) {
        pointXY = pointXY.map(e => Math.round(e))
        let oldG = [pointXY], newG = [], oldColor = this.getPixelColor(pointXY)
        while (!arraysEqual(oldG, [])) {
            for (let i = 0; i < oldG.length; i++) {
                for (let x = 0; x < 8; x += 2) {
                    let px = movePoint(oldG[i], x), pxColor = this.getPixelColor(px)
                    if (pxColor == oldColor) { this.drawPixels([[...px, newColor]]); newG.push(px) }
                }
            }
            oldG = [...newG]; newG = []
        }
    }

    getPixelColor(pointXY) {
        let Size = this.#pxSize,
            xyPos = this.#getPos(pointXY.map(e => Math.round(e))),
            pixelData = this.#ctx.getImageData(xyPos[0] + Size * .5, xyPos[1] + Size * .5, 1, 1).data
        return `rgb(${pixelData[0]},${pixelData[1]},${pixelData[2]})`
    }

    drawPixels(pixels) {
        let pxSize = this.#pxSize
        pixels = pixels.map(e => !isNaN(e) ? Math.round(e) : e)
        for (let i = 0; i < pixels.length; i++) {
            let xy = this.#getPos(pixels[i])
            this.#ctx.fillStyle = pixels[i][2] !== undefined ? pixels[i][2] : this.options.color
            this.#ctx.fillRect(xy[0], xy[1], pxSize, pxSize)
        }
    }

    drawFillRect(pointXY, WH, color = this.options.color) {
        pointXY = pointXY.map(e => Math.round(e))
        WH = WH.map(e => Math.round(e))
        let grid = this.options.grid
            , xy = this.#getPos(pointXY)
            , z = grid !== 0 ? [(grid * WH[0] - grid), (grid * WH[1] - grid)] : [0, 0]
            , pxSize = this.#pxSize;
        this.#ctx.fillStyle = color
        this.#ctx.fillRect(xy[0], xy[1], WH[0] * pxSize + z[0], WH[1] * pxSize + z[1])
        grid !== 0 ? this.#drawGrid(pointXY, [pointXY[0] + WH[0], pointXY[1] + WH[1]]) : 0
    }

    drawRect(pointXY, WH, color = this.options.color) {
        this.drawFillRect(pointXY, [WH[0], 1], color)
        this.drawFillRect(pointXY, [1, WH[1]], color)
        this.drawFillRect([pointXY[0], pointXY[1] + WH[1]], [WH[0] + 1, 1], color)
        this.drawFillRect([pointXY[0] + WH[0], pointXY[1]], [1, WH[1] + 1], color)
    }

    drawLineMidPoint(start, end, color = this.options.color) {
        start = start.map(e => Math.round(e))
        end = end.map(e => Math.round(e))
        let dx = end[0] - start[0], dy = end[1] - start[1],
            D = 2 * dy - dx, dD = 2 * (dy - dx),
            x = start[0], y = start[1], points = []
        while (y <= end[1] && x <= end[0]) {
            points.push([x, y])
            x++
            if (D < 0) { D = D + 2 * dy } else if (D >= 0) { y++; D = D + dD }
        }
        this.drawPixels(points.map(e => [...e, color]))
    }

    drawCircleMidPoint(pointXY, R, color = this.options.color) {
        pointXY = pointXY.map(e => Math.round(e)); R = Math.round(R)
        function drawAll8Points(xy) {
            let points = [], x = xy[0], y = xy[1]
            points.push([x, y]); points.push([-x, y])
            points.push([x, -y]); points.push([-x, -y])
            points.push([y, x]); points.push([-y, x])
            points.push([y, -x]); points.push([-y, -x])
            points = points.map(e => [e[0] + pointXY[0], e[1] + pointXY[1], color])
            PXS1.drawPixels(points)
        }

        let x = 0, y = R, p = 1 - R
        drawAll8Points([x, y])
        while (x <= y) {
            x += 1
            if (p < 0) {
                p = p + 2 * x + 1
            } else if (p >= 0) {
                y -= 1
                p = p - 2 * y + 2 * x + 1
            }
            drawAll8Points([x, y])
        }
    }

    writeText(pointXY, text, color = this.options.color) {
        //I didn't finish that yet
    }

    restart() {
        this.#ctx.fillStyle = this.options.bg
        this.#ctx.fillRect(0, 0, this.width, this.height)
        this.options.grid !== 0 ? this.#drawGrid() : 0
    }
}

// test area
let PXS1 = new PXS([20, 20], 15, "PXS", { grid: 2, mode: "paint" })
PXS1.canvas.addEventListener("mouseenter", e => { PXS1.options.color = document.getElementById("color").value })

PXS1.drawLineMidPoint([2, 8], [9, 11], "aqua")