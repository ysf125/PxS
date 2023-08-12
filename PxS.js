export { PxS, movePointGrid }

function randomNum(min, max) { return Math.round(Math.random() * (max - min) + min) }
function arraysEqual(a, b) { return JSON.stringify(a) === JSON.stringify(b) ? true : false }
function isMatrix(a) { return Array.isArray(a[0]) && typeof a[0] !== 'string' ? true : false }
function isNegativeNum(Num) { return Num < 0 ? true : false }
function slope(pointXY0, pointXY1) { return (pointXY1[1] - pointXY0[1]) / (pointXY1[0] - pointXY0[0]) }
function midPoint(pointXY0, pointXY1) { return [(pointXY0[0] + pointXY1[0]) / 2, ((pointXY0[1] + pointXY1[1])) / 2] }
function distance(pointXY0, pointXY1) { return Math.sqrt((pointXY1[0] - pointXY0[0]) ** 2 + (pointXY1[1] - pointXY0[1]) ** 2) }

function ObjectCombiner(keys, values) {
    let returnVal = {}
    for (let i = 0; i < keys.length; i++) {
        returnVal[keys[i]] = values[i]
    } return returnVal
}

function movePointGrid(pointXY, dir, D = 1) {
    let rad = (360 + 45 * dir) % 360 * (Math.PI / 180)
        , x = pointXY[0] + (D * Math.round(Math.cos(rad)))
        , y = pointXY[1] + (D * Math.round(Math.sin(rad)))
    return [x, y]
}

function movePoint(pointXY, angle, D = 1) {
    let z = angle !== 180 || angle !== 0 ? 180 : 0,
        rad = angle * (Math.PI / 180)
        , x = pointXY[0] + (D * Math.cos(rad))
        , y = pointXY[1] + (D * Math.sin((angle + z) * (Math.PI / 180)))
    return [x, y]
}

function getAngle(pointXY0, pointXY1) {
    let angle = Math.atan2(pointXY1[1] - pointXY0[1], pointXY1[0] - pointXY0[0])
    if (angle < 0) { angle += Math.PI * 2 }
    return angle * (180 / Math.PI)
}

console.log(getAngle([5, 5], [4, 4]))

class PxS {

    #pxXY; #pxSize; #ctx; #width; #height; #pixelsData; #canvas; #colorDictionary; #SC
    // default options = { bg: "white" , color: "black" , grid: 0 , gridColor: "gray" , correctInput : true }
    constructor(pxXY, pxSize, id, options = { bg: "white", color: "black", grid: 0, gridColor: "Gray", correctInput: true }) {
        this.options = this.#defaultOptions(options, { bg: "white", color: "black", grid: 0, gridColor: "Gray", correctInput: true })
        this.#canvas = document.getElementById(id)
        this.#pxXY = pxXY.map(e => Math.round(e))
        this.#pxSize = pxSize
        this.#ctx = document.getElementById(id).getContext("2d", { willReadFrequently: true })
        this.#width = (pxSize * pxXY[0]) + ((pxXY[0] - 1) * options.grid)
        this.#height = (pxSize * pxXY[1]) + ((pxXY[1] - 1) * options.grid)
        this.#pixelsData = Array(this.#pxXY[1]).fill().map(() => Array(this.#pxXY[1]).fill(this.options.bg));
        this.#colorDictionary = {}
        this.#SC = document.createElement("canvas"); this.#SC.setAttribute("width", "1"); this.#SC.setAttribute("height", "1")
        this.#SC = this.#SC.getContext("2d", { willReadFrequently: true })
        this.restart()
    }

    #getPos(pointXY) {
        let pxSize = this.#pxSize,
            x = pointXY[0] == 0 ? 0 : (pointXY[0] * pxSize) + (pointXY[0] * this.options.grid),
            y = pointXY[1] == 0 ? 0 : (pointXY[1] * pxSize) + (pointXY[1] * this.options.grid)
        return [x, y]
    }

    #defaultOptions(options, defaultOptions) {
        let keys = Object.keys(defaultOptions)
        for (let i = 0; i < keys.length; i++) {
            if (options[keys[i]] == undefined) {
                options[keys[i]] = defaultOptions[keys[i]]
            }
        }
        return options
    }

    #drawGrid(pointXY0 = [0, 0], pointXY1 = this.#pxXY) {
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

    #ChangePointOctet(pointXY0, pointXY1, octetNum) {
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

    #correctInput(inputs) {
        let keys = Object.keys(inputs)
        for (let i = 0; i < keys.length; i++) {
            let input = inputs[keys[i]]
            if (Array.isArray(input)) { inputs[keys[i]] = input.map(e => Math.round(e)) }
            else if (!isNaN(input)) { inputs[keys[i]] = Math.round(input) }
            else if (typeof input === 'string') {
                if (input.toLowerCase().includes("rgb(")) { inputs[keys[i]] = input.toLowerCase() }
                else {
                    if (this.#colorDictionary[input] !== undefined) { inputs[keys[i]] = this.#colorDictionary[input] }
                    else {
                        this.#SC.fillStyle = input;
                        this.#SC.fillRect(0, 0, 1, 1)
                        let color = this.#SC.getImageData(0, 0, 1, 1).data
                        color = `rgb(${color[0]},${color[1]},${color[2]})`
                        this.#colorDictionary[input.toLowerCase()] = color
                        inputs[keys[i]] = color
                    }
                }
            }
        }
        return inputs
    }

    #setPixelColor(pointXY, color = this.options.color, WH) {
        let outSide = function (pointXY, WH) {
            if (pointXY[0] < 0 || pointXY[1] < 0 ||
                pointXY[0] >= WH[0] || pointXY[1] >= WH[1]) { return true } else { return false }
        }
        if (WH == undefined) {
            if (outSide(pointXY, this.#pxXY)) { return }
            this.#pixelsData[pointXY[1]][pointXY[0]] = color
        } else {
            for (let y = 0; y < WH[1]; y++) {
                for (let x = 0; x < WH[0]; x++) {
                    if (outSide([pointXY[0] + x, pointXY[1] + y], this.#pxXY)) { continue }
                    this.#pixelsData[pointXY[1] + y][pointXY[0] + x] = color
                }
            }
        }
    }

    getPixelColor(pointXY, WH) {
        if (WH == undefined) {
            return this.#pixelsData[pointXY[1]][pointXY[0]]
        } else {
            let pixels = Array(WH[1]).fill().map(() => Array(WH[0]).fill())
            for (let y = 0; y < WH[1]; y++) {
                for (let x = 0; x < WH[0]; x++) {
                    pixels[y][x] = this.#pixelsData[pointXY[1] + y][pointXY[0] + x]
                }
            }
            return pixels
        }
    }

    restart() {
        this.#canvas.setAttribute("width", this.#width)
        this.#canvas.setAttribute("height", this.#height)
        this.#ctx.fillStyle = this.options.bg
        this.#ctx.fillRect(0, 0, this.#width, this.#height)
        this.options.grid !== 0 ? this.#drawGrid() : 0
    }

    get allCanvesData() {
        return {
            pxXY: this.#pxXY, pxSize: this.#pxSize, canvas: this.#canvas, ctx: this.#ctx,
            options: this.options, width: this.#width, height: this.#height, pixelsData: this.#pixelsData
        }
    }

    floodFill(pointXY, color = this.options.color) {
        pointXY = pointXY.map(e => Math.round(e))
        let oldG = [pointXY], newG = [], oldColor = this.getPixelColor(pointXY)
        while (!arraysEqual(oldG, [])) {
            for (let i = 0; i < oldG.length; i++) {
                for (let x = 0; x < 8; x += 2) {
                    let newPointXY = movePointGrid(oldG[i], x),
                        pxColor = this.getPixelColor(newPointXY)
                    if (pxColor == oldColor) {
                        this.drawPixels([[...newPointXY, color]]); newG.push(newPointXY)
                    }
                }
            }
            oldG = [...newG]; newG = []
        }
    }

    drawPixels(pixels) {
        let pxSize = this.#pxSize
        pixels = pixels.map(e => !isNaN(e) ? Math.round(e) : e)
        for (let i = 0; i < pixels.length; i++) {
            let xy = this.#getPos(pixels[i]),
                color = pixels[i][2] !== undefined ? pixels[i][2] : this.options.color
            this.#ctx.fillStyle = color
            this.#ctx.fillRect(xy[0], xy[1], pxSize, pxSize)
            this.#setPixelColor([pixels[i][0], pixels[i][1]], color)
        }
    }

    drawRect(pointXY, WH, color = this.options.color, fill = false) {
        pointXY = pointXY.map(e => Math.round(e))
        WH = WH.map(e => Math.round(e))
        if (WH[0] < 0 || WH[1] < 0) {
            if (WH[0] < 0) { pointXY[0] = pointXY[0] + (WH[0] + 1) }
            if (WH[1] < 0) { pointXY[1] = pointXY[1] + (WH[1] + 1) }
            WH = WH.map(e => Math.abs(e))
        }
        if (fill == true) {
            let grid = this.options.grid
                , xy = this.#getPos(pointXY)
                , z = grid !== 0 ? [(grid * WH[0] - grid), (grid * WH[1] - grid)] : [0, 0]
                , pxSize = this.#pxSize;
            this.#ctx.fillStyle = color
            this.#ctx.fillRect(xy[0], xy[1], WH[0] * pxSize + z[0], WH[1] * pxSize + z[1])
            grid !== 0 ? this.#drawGrid(pointXY, [pointXY[0] + WH[0], pointXY[1] + WH[1]]) : 0
            this.#setPixelColor(pointXY, color, WH)
        } else {
            this.drawRect(pointXY, [WH[0], 1], color, true)
            this.drawRect(pointXY, [1, WH[1]], color, true)
            this.drawRect([pointXY[0], pointXY[1] + WH[1] - 1], [WH[0], 1], color, true)
            this.drawRect([pointXY[0] + WH[0] - 1, pointXY[1]], [1, WH[1]], color, true)
        }
    }

    drawLine(pointXY0, pointXY1, color = this.options.color) {
        pointXY0 = pointXY0.map(e => Math.round(e))
        pointXY1 = pointXY1.map(e => Math.round(e))
        function getOctet(pointXY0, pointXY1) {
            let N = 10 ** 9, closestPoint = [N, 0]
                , points = Array(8).fill(pointXY0).map((e, i) => movePointGrid(e, i, N / 2))
            points = points.map((e, i) => midPoint(e, points[(i + 1) % 8]))
            points.forEach((e, i) => distance(e, pointXY1) < closestPoint[0] ? closestPoint = [distance(e, pointXY1), i] : 0)
            return closestPoint[1]
        }
        let octetNum = getOctet(pointXY0, pointXY1)
        pointXY1 = this.#ChangePointOctet(pointXY0, pointXY1, 0)

        let dx = pointXY1[0] - pointXY0[0], dy = pointXY1[1] - pointXY0[1],
            D = 2 * dy - dx, dD = 2 * (dy - dx),
            x = pointXY0[0], y = pointXY0[1]
        while (x <= pointXY1[0]) {
            this.drawPixels([[...this.#ChangePointOctet(pointXY0, [x, y], octetNum), color]])
            x++
            if (D < 0) { D = D + 2 * dy } else if (D >= 0) { y++; D = D + dD }
        }
    }

    drawCircle(pointXY, R, color = this.options.color, fill = false) {
        pointXY = pointXY.map(e => Math.round(e)); R = Math.round(R)
        let x = 0, y = R, p = 1 - R
        for (let i = 0; i < 8; i++) {
            let point = this.#ChangePointOctet(pointXY, [x + pointXY[0], y + pointXY[1]], i)
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
                let point = this.#ChangePointOctet(pointXY, [x + pointXY[0], y + pointXY[1]], i)
                this.drawPixels([[point[0], point[1], color]])
            }
        }
        fill == true ? this.floodFill(pointXY, color) : 0
    }

}

// working area
let PxS1 = new PxS([16, 16], 25, "PxS", { grid: 1.5 })
