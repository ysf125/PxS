export {
    PXS, movePoint, randomNum, arraysEqual, isMatrix, ObjectCombiner, isNegativeNum, D,
    slope, midPoint
}

function randomNum(min, max) { return Math.round(Math.random() * (max - min) + min) }
function arraysEqual(a, b) { return JSON.stringify(a) === JSON.stringify(b) ? true : false }
function isMatrix(a) { return Array.isArray(a[0]) && typeof a[0] !== 'string' ? true : false }
function isNegativeNum(Num) { return Math.abs(Num) !== Num ? true : false }
function D(pointXY0, pointXY1) { return Math.sqrt((pointXY1[0] - pointXY0[0]) ** 2 + (pointXY1[1] - pointXY0[1]) ** 2) }
function slope(pointXY0, pointXY1) { return (pointXY1[1] - pointXY0[1]) / (pointXY1[0] - pointXY0[0]) }
function midPoint(pointXY0, pointXY1) { return [(pointXY0[0] + pointXY1[0]) / 2, ((pointXY0[1] + pointXY1[1])) / 2] }

function ObjectCombiner(keys, values) {
    let returnVal = {}
    for (let i = 0; i < keys.length; i++) {
        returnVal[keys[i]] = values[i]
    } return returnVal
}

function allPossibilities(items, spaces, repeat = false) {

}

function movePoint(pointXY, dir, D = 1) {
    let rad = (360 + 45 * dir) % 360 * (Math.PI / 180)
        , x = pointXY[0] + (D * Math.round(Math.cos(rad)))
        , y = pointXY[1] + (D * Math.round(Math.sin(rad)))
    return [x, y]
}

class PXS {

    #pxXY; #pxSize; canvas; #ctx; #width; #height
    // default options = { bg: "white" , color: "black" , grid: 0 , gridColor: "gray"}
    constructor(pxXY, pxSize, id, options) {
        this.#pxXY = pxXY.map(e => Math.round(e))
        this.#pxSize = pxSize
        this.canvas = document.getElementById(id)
        this.#ctx = document.getElementById(id).getContext("2d", { willReadFrequently: true })
        this.options = this.#defaultOptions(options)
        this.#width = (pxSize * pxXY[0]) + ((pxXY[0] - 1) * options.grid)
        this.#height = (pxSize * pxXY[1]) + ((pxXY[1] - 1) * options.grid)
        this.canvas.setAttribute("width", this.#width)
        this.canvas.setAttribute("height", this.#height)
        this.restart()
    }

    #getPos(pointXY) {
        let pxSize = this.#pxSize,
            x = pointXY[0] == 0 ? 0 : (pointXY[0] * pxSize) + (pointXY[0] * this.options.grid),
            y = pointXY[1] == 0 ? 0 : (pointXY[1] * pxSize) + (pointXY[1] * this.options.grid)
        return [x, y]
    }

    #defaultOptions(options) {
        let defaultOptions = { bg: "white", color: "black", grid: 0, gridColor: "Gray" },
            keys = Object.keys(defaultOptions)
        for (let i = 0; i < keys.length; i++) {
            if (options[keys[i]] == undefined) {
                options[keys[i]] = defaultOptions[keys[i]]
            }
        }
        return options
    }

    ChangePointOctet(pointXY0, pointXY1, octetNum) {
        let dx = Math.abs(pointXY1[0] - pointXY0[0]),
            dy = Math.abs(pointXY1[1] - pointXY0[1]), pointXY = []
        switch (octetNum % 8) {
            case 0: pointXY = [pointXY0[0] + dx, pointXY0[1] + dy]; break
            case 1: pointXY = [pointXY0[0] + dy, pointXY0[1] + dx]; break
            case 2: pointXY = [pointXY0[0] - dy, pointXY0[1] + dx]; break
            case 3: pointXY = [pointXY0[0] - dx, pointXY0[1] + dy]; break
            case 4: pointXY = [pointXY0[0] - dx, pointXY0[1] - dy]; break
            case 5: pointXY = [pointXY0[0] - dy, pointXY0[1] - dx]; break
            case 6: pointXY = [pointXY0[0] + dy, pointXY0[1] - dx]; break
            case 7: pointXY = [pointXY0[0] + dx, pointXY0[1] - dy]; break
        }
        return pointXY
    }

    get allCanvesData() {
        return {
            pxXY: this.#pxXY, pxSize: this.#pxSize, canvas: this.canvas, ctx: this.#ctx,
            options: this.options, width: this.#width, height: this.#height
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

    drawGrid(pointXY0 = [0, 0], pointXY1 = this.#pxXY) {
        let grid = this.options.grid
        this.#ctx.fillStyle = this.options.gridColor
        for (let i = pointXY0[0]; i < pointXY1[0]; i++) {
            let z = i == 0 ? this.#pxSize : (this.#pxSize * (i + 1)) + (grid * i)
            this.#ctx.fillRect(z, 0, grid, this.#height)
        }
        for (let x = pointXY0[1]; x < pointXY1[1]; x++) {
            let z = x == 0 ? this.#pxSize : (this.#pxSize * (x + 1)) + (grid * x)
            this.#ctx.fillRect(0, z, this.#width, grid)
        }
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
        grid !== 0 ? this.drawGrid(pointXY, [pointXY[0] + WH[0], pointXY[1] + WH[1]]) : 0
    }

    drawRect(pointXY, WH, color = this.options.color) {
        this.drawFillRect(pointXY, [WH[0], 1], color)
        this.drawFillRect(pointXY, [1, WH[1]], color)
        this.drawFillRect([pointXY[0], pointXY[1] + WH[1]], [WH[0] + 1, 1], color)
        this.drawFillRect([pointXY[0] + WH[0], pointXY[1]], [1, WH[1] + 1], color)
    }

    drawLineMidPoint(pointXY0, pointXY1, color = this.options.color) {

        //working here        

        pointXY0 = pointXY0.map(e => Math.round(e))
        pointXY1 = pointXY1.map(e => Math.round(e))
        let dx = pointXY1[0] - pointXY0[0], dy = pointXY1[1] - pointXY0[1],
            D = 2 * dy - dx, dD = 2 * (dy - dx),
            x = pointXY0[0], y = pointXY0[1], points = []
        while (y <= pointXY1[1] && x <= pointXY1[0]) {
            points.push([x, y])
            x++
            if (D < 0) { D = D + 2 * dy } else if (D >= 0) { y++; D = D + dD }
        }
        this.drawPixels(points.map(e => [...e, color]))
    }

    drawCircleMidPoint(pointXY, R, color = this.options.color) {
        pointXY = pointXY.map(e => Math.round(e)); R = Math.round(R)
        let x = 0, y = R, p = 1 - R

        for (let i = 0; i < 8; i++) {
            let point = this.ChangePointOctet(pointXY, [x + pointXY[0], y + pointXY[1]], i)
            this.drawPixels([[point[0], point[1], color]])
        }
        while (x <= y) {
            x += 1
            if (p < 0) {
                p = p + 2 * x + 1
            } else if (p >= 0) {
                y -= 1
                p = p - 2 * y + 2 * x + 1
            }
            for (let i = 0; i < 8; i++) {
                let point = this.ChangePointOctet(pointXY, [x + pointXY[0], y + pointXY[1]], i)
                this.drawPixels([[point[0], point[1], color]])
            }
        }
    }

    restart() {
        this.#ctx.fillStyle = this.options.bg
        this.#ctx.fillRect(0, 0, this.#width, this.#height)
        this.options.grid !== 0 ? this.drawGrid() : 0
    }
}

// working area
let PXS1 = new PXS([20, 20], 15, "PXS", { grid: 2 })

let getOctet = (pointXY0, pointXY1) => {
    let N = Number.MAX_SAFE_INTEGER, closestPoint = [N, 0]
        , points = Array(8).fill(pointXY0).map((e, i) => movePoint(e, i, N / 10))
    points = points.map((e, i) => midPoint(e, points[(i + 1) % 8]))
    points.forEach((e, i) => D(e, pointXY1) < closestPoint[0] ? closestPoint = [D(e, pointXY1), i] : 0)
    return closestPoint
}

//console.log(PXS1.ChangePointOctet([3, 3], [5, 3], 1))
PXS1.drawCircleMidPoint([7, 7], 7, "red")