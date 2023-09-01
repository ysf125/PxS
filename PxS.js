export { PxS }

function randomNum(min, max) { return Math.round(Math.random() * (max - min) + min) }
function isMatrix(a) { return Array.isArray(a[0]) && typeof a[0] !== 'string' ? true : false }
function slope(pointXY0, pointXY1) { return (pointXY1[1] - pointXY0[1]) / (pointXY1[0] - pointXY0[0]) }
function midPoint(pointXY0, pointXY1) { return [(pointXY0[0] + pointXY1[0]) / 2, (pointXY0[1] + pointXY1[1]) / 2] }
function arraysEqual(a, b) { return JSON.stringify(a) === JSON.stringify(b) ? true : false }
function distance(pointXY0, pointXY1) { return Math.sqrt((pointXY1[0] - pointXY0[0]) ** 2 + (pointXY1[1] - pointXY0[1]) ** 2) }
function getOctet(pointXY0, pointXY1) { return Math.floor((360 - getAngle(pointXY0, pointXY1)) / 45) }
function changeSign(num) { if (num < 0) { return num + Math.abs(num) * 2 } else { return num - num * 2 } }

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
    let angle = Math.atan2(changeSign(pointXY1[1] - pointXY0[1]), pointXY1[0] - pointXY0[0])
    if (angle < 0) { angle += Math.PI * 2 }
    return angle * (180 / Math.PI)
}

class PxS {

    #pxXY; #pxSize; #ctx; #width; #height; #pixelsData; #canvas; #colorDictionary; #SC
    constructor(pxXY, pxSize, id, options = { bg: "", color: "", grid: 0, gridColor: "", correctInput: true }) {
        this.options = this.#defaultOptions(options, { bg: "rgb(255,255,255)", color: "rgb(0,0,0)", grid: 0, gridColor: "rgb(128,128,128)", correctInput: true })
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

    #wrongInput(pointXY, WH) {
        if (!Number.isInteger(pointXY[0]) || !Number.isInteger(pointXY[1])) {
            throw new Error(`you can't use floating numbers in pointXY = [${pointXY}]`)
        }
        else if (pointXY[0] < 0 || pointXY[1] < 0 || pointXY[0] >= WH[0] || pointXY[1] >= WH[1]) {
            return true
        } else { return false }
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

    #correctInput(inputs, on = this.options.correctInput) {
        if (on) {
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
        } else { return inputs }
    }

    #setPixelColor(pointXY, color = this.options.color, WH) {
        if (WH == undefined) {
            if (this.#wrongInput(pointXY, this.#pxXY)) { return }
            this.#pixelsData[pointXY[1]][pointXY[0]] = color
        } else {
            for (let y = 0; y < WH[1]; y++) {
                for (let x = 0; x < WH[0]; x++) {
                    if (this.#wrongInput([pointXY[0] + x, pointXY[1] + y], this.#pxXY)) { continue }
                    this.#pixelsData[pointXY[1] + y][pointXY[0] + x] = color
                }
            }
        }
    }

    getPixelColor(pointXY, WH = [1,1]) {
        let In = this.#correctInput({ pointXY: pointXY, WH: WH })
        if (!Number.isInteger(WH[0]) || !Number.isInteger(WH[1])) {
            throw new Error(`you can't use floating numbers in WH = [${WH}]`)
        } else if (WH[0] < 0 || WH[1] < 0) { throw new Error(`you can't use negative numbers in WH = [${WH}]`) }
        if (arraysEqual(In.WH , [1,1])) {
            if (this.#wrongInput(pointXY, this.#pxXY)) { return }
            return this.#pixelsData[In.pointXY[1]][In.pointXY[0]]
        } else {
            let pixels = Array(In.WH[1]).fill().map(() => Array(In.WH[0]).fill())
            for (let y = 0; y < In.WH[1]; y++) {
                for (let x = 0; x < In.WH[0]; x++) {
                    if (this.#wrongInput([In.pointXY[0] + x, In.pointXY[1] + y], this.#pxXY)) { continue }
                    pixels[y][x] = this.#pixelsData[In.pointXY[1] + y][In.pointXY[0] + x]
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
            options: this.options, width: this.#width, height: this.#height,
            pixelsData: this.#pixelsData, colorDictionary: this.#colorDictionary,
            correctInput: this.#correctInput
        }
    }

    floodFill(pointXY, color = this.options.color) {
        let In = this.#correctInput({ pointXY: pointXY, color: color }),
            oldG = [In.pointXY], newG = [], oldColor = this.getPixelColor(In.pointXY)
        while (!arraysEqual(oldG, [])) {
            for (let i = 0; i < oldG.length; i++) {
                for (let x = 0; x < 8; x += 2) {
                    let newPointXY = movePointGrid(oldG[i], x),
                        pxColor = this.getPixelColor(newPointXY)
                    if (pxColor == oldColor) {
                        this.drawPixels([[...newPointXY, In.color]], false)
                        newG.push(newPointXY)
                    }
                }
            }
            oldG = [...newG]; newG = []
        }
    }

    drawPixels(pixels, correctInput = this.options.correctInput) {
        for (let i = 0; i < pixels.length; i++) {
            let color = pixels[i][2] !== undefined ? pixels[i][2] : this.options.color,
                In = this.#correctInput({ pointXY: [pixels[i][0], pixels[i][1]], color: color }, correctInput)
            this.#setPixelColor(In.pointXY, In.color)
            let XYPos = this.#getPos(In.pointXY)
            this.#ctx.fillStyle = In.color
            this.#ctx.fillRect(XYPos[0], XYPos[1], this.#pxSize, this.#pxSize)
        }
    }

    drawRect(pointXY, WH, color = this.options.color, fill = false) {
        let In = this.#correctInput({ pointXY: pointXY, WH: WH, color: color })
        if (In.WH[0] < 0 || In.WH[1] < 0) {
            if (In.WH[0] < 0) { In.pointXY[0] = In.pointXY[0] + (In.WH[0] + 1) }
            if (In.WH[1] < 0) { In.pointXY[1] = In.pointXY[1] + (In.WH[1] + 1) }
            In.WH = In.WH.map(e => Math.abs(e))
        }
        if (fill == true) {
            this.#setPixelColor(In.pointXY, In.color, In.WH)
            let grid = this.options.grid
                , xy = this.#getPos(In.pointXY)
                , z = grid !== 0 ? [(grid * In.WH[0] - grid), (grid * In.WH[1] - grid)] : [0, 0]
                , pxSize = this.#pxSize;
            this.#ctx.fillStyle = In.color
            this.#ctx.fillRect(xy[0], xy[1], In.WH[0] * pxSize + z[0], In.WH[1] * pxSize + z[1])
            grid !== 0 ? this.#drawGrid(In.pointXY, [In.pointXY[0] + In.WH[0], In.pointXY[1] + In.WH[1]]) : 0
        } else {
            this.drawRect(In.pointXY, [In.WH[0], 1], In.color, true)
            this.drawRect(In.pointXY, [1, In.WH[1]], In.color, true)
            this.drawRect([In.pointXY[0], In.pointXY[1] + In.WH[1] - 1], [In.WH[0], 1], In.color, true)
            this.drawRect([In.pointXY[0] + In.WH[0] - 1, In.pointXY[1]], [1, In.WH[1]], In.color, true)
        }
    }

    drawLine(pointXY0, pointXY1, color = this.options.color) {
        let In = this.#correctInput({ pointXY0: pointXY0, pointXY1: pointXY1, color: color }),
            octetNum = getOctet(In.pointXY0, In.pointXY1),
            angle = getAngle(In.pointXY0, In.pointXY1), point = [...In.pointXY0]
        this.drawPixels([[...In.pointXY0, In.color], [...In.pointXY1, In.color]], false)
        while (distance(point, In.pointXY1) > 1.42) {
            let NPoint0 = movePointGrid(point, octetNum), NPoint1 = movePointGrid(point, octetNum + 1),
                NP0 = getAngle(NPoint0, In.pointXY1), NP1 = getAngle(NPoint1, In.pointXY1)
            NP0 = Math.abs(angle - NP0); NP1 = Math.abs(angle - NP1)
            if (NP0 <= NP1) { point = NPoint0 } else { point = NPoint1 }
            this.drawPixels([[...point, In.color]], false)
        }
    }

    drawCircle(pointXY, R, color = this.options.color, fill = false) {
        let In = this.#correctInput({ pointXY: pointXY, R: R, color: color }),
            x = 0, y = In.R, p = 1 - In.R
        for (let i = 0; i < 8; i++) {
            let point = this.#ChangePointOctet(In.pointXY, [x + In.pointXY[0], y + In.pointXY[1]], i)
            this.drawPixels([[point[0], point[1], In.color]], false)
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
                let point = this.#ChangePointOctet(In.pointXY, [x + In.pointXY[0], y + In.pointXY[1]], i)
                this.drawPixels([[point[0], point[1], In.color]], false)
            }
        }
        fill == true ? this.floodFill(In.pointXY, In.color) : 0
    }

}

// working area
