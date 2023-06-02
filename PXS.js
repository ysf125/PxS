export { PXS, movePoint, randomNumber, arraysEqual, isMatrix, ObjectCombiner, mapMatrix }

function randomNumber(min, max) { return Math.round(Math.random() * (max - min) + min) }
function arraysEqual(a, b) { return JSON.stringify(a) === JSON.stringify(b) ? true : false }
function isMatrix(a) { return Array.isArray(a[0]) && typeof a[0] !== 'string' ? true : false }

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
        this.#ctx = document.getElementById(id).getContext('2d')
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

    getPixelColor(pointXY) {
        let Size = this.#pxSize,
            xyPos = this.#getPos(pointXY.map(e => Math.round(e))),
            pixel = this.#ctx.getImageData(xyPos[0] + Size * .5, xyPos[1] + Size * .5, 1, 1).data
        return `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`
    }

    drawPixels(pixels) {
        let pxSize = this.#pxSize
        for (let i = 0; i < pixels.length; i++) {
            pixels[i] = pixels[i].map(e => !isNaN(e) ? Math.round(e) : e)
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
            , x = grid !== 0 ? [(grid * WH[0] - grid), (grid * WH[1] - grid)] : [0, 0]
            , pxSize = this.#pxSize;
        this.#ctx.fillStyle = color
        this.#ctx.fillRect(xy[0], xy[1], WH[0] * pxSize + x[0], WH[1] * pxSize + x[1])
        grid !== 0 ? this.#drawGrid(pointXY, [pointXY[0] + WH[0], pointXY[1] + WH[1]]) : 0
    }

    drawRect(pointXY, WH, color = this.options.color) {
        this.drawFillRect(pointXY, [WH[0], 1], color)
        this.drawFillRect(pointXY, [1, WH[1]], color)
        this.drawFillRect([pointXY[0], pointXY[1] + WH[1]], [WH[0] + 1, 1], color)
        this.drawFillRect([pointXY[0] + WH[0], pointXY[1]], [1, WH[1] + 1], color)
    }

    drawLineDDA(point0, point1) {
        point0 = point0.map(e => Math.round(e))
        point1 = point1.map(e => Math.round(e))
        let points = [],
            dx = point1[0] - point0[0],
            dy = point1[1] - point0[1],
            steps = dx > dy ? Math.abs(dx) : Math.abs(dy),
            Xinc = dx / steps, Yinc = dy / steps,
            X = point0[0], Y = point0[1]
        for (let i = 0; i <= steps; i++) {
            points.push([X, Y].map(xy => Math.round(xy)))
            X += Xinc
            Y += Yinc
        }
        this.drawPixels(points)
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

    restart() {
        this.#ctx.fillStyle = this.options.bg
        this.#ctx.fillRect(0, 0, this.width, this.height)
        this.options.grid !== 0 ? this.#drawGrid() : 0
    }
}

// test area
let PXS1 = new PXS([30, 30], 15, "PXS", { grid: 2, mode: "paint" })
PXS1.canvas.addEventListener("mouseenter", e => { PXS1.options.color = document.getElementById("color").value })
