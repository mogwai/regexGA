const util = require('util')
const _ = require('lodash')

// TODO
// Character classes
// [abc]	any of a, b, or c
// [^abc]	not a, b, or c
// [a-g]	character between a & g

// Anchors
// ^abc$	start / end of the string

// Escaped characters

// Groups & Lookaround
// \1	backreference to group #1
// (?:abc)	non-capturing group
// (?=abc)	positive lookahead
// (?!abc)	negative lookahead

// Quantifiers & Alternation
// ab|cd	match ab or cd

let OperatorFunctions = ['+', '*', '?', '{%s,%s}', '']

const CHARACTERS = require('./regexcharacters')

class RegexEntity {
    constructor(maxlength) {
        this.maxlength = maxlength
        this.content = []
        for (let i = maxlength; i > -1; i--) {
            let r = Math.random()
            if (r < 0.2 && this.maxlength > 2) {
                let len = _.random(2, i)
                this.content.push(new RegexEntity(len))
                i -= len
            } else if (r < 0.6 && this.maxlength > 2) {
                let len = _.random(2, i)
                let cg = new CaptureGroup(len)
                cg.generate()

                i -= cg.isRange ? 3 : len
                this.content.push(cg)
            } else {
                this.content.push(RegexEntity.randomChar())
            }
        }
        this.operator = this.generateOperator()
    }

    generateOperator() {
        if (Math.random() > 0.3) return ""
        let last = _.last(this.content)
        if (last) {
            if (typeof last !== "string") {
                let operator = last.operator
                last = last.toString().replace(operator, '')
            }
            last = last[last.length-2] + last[last.length-1]
        }
        if (last === "\\B" || last === "\\b")
            return ""
        let op = _.sample(OperatorFunctions)
        if (op === OperatorFunctions[3]) {
            let n1 = _.random(1, this.maxlength)
            let n2 = _.random(n1 + 1, this.maxlength)
            if (n2 < 0) {
                return `{${n1}}`
            } else if (n2 < 2) {
                return util.format(op, n1, "")
            } else {
                return util.format(op, n1, n2)
            }
        }
        return op
    }

    static randomChar() {
        return _.sample(CHARACTERS)
    }

    reducetoString(r) {
        return r.reduce((a, c) => c ? a + c.toString() : c, "")
    }

    toString() {
        let s = this.reducetoString(this.content)
        if (this.operator) {
            if (this.content.length < 2 && !(this.content[0] instanceof RegexEntity)) {
                return `${s}${this.operator}`
            }
            return `(${s})${this.operator}`
        }
        return s
    }

    addContent(con) {
        this.content = this.content.concat(con)
    }

    length() {
        return this.toString().length
    }

    mutate() {
        let mutatingcell = _.sample(this.content)
        if (mutatingcell instanceof RegexEntity) {
            mutatingcell.mutate()
        } else {
            let i = _.findIndex(this.content, mutatingcell)
            this.content.splice(i, 1, RegexEntity.randomChar())
        }
        this.operator = this.generateOperator()
    }

    preventBoundaryOperator(){
        if (this.operator){
            let last = _.last(this.content)
            if (last) {
                if (typeof last !== "string") 
                    last.preventBoundaryOperator()
                else if (last === "\\b" || last === "\\B")
                    this.operator = ""
            }
        }
    }
}

class CaptureGroup extends RegexEntity {

    constructor(maxlength) {
        super()
        this.maxlength = maxlength
        this.isRange = Math.random() < 0.5
        this.content = []
    }

    generate() {
        if (this.isRange) {
            this.createRange()
        } else {
            this.createCaputureGroup()
        }
        this.operator = this.generateOperator()
    }

    createRange() {
        let r = Math.random()
        if (r < 1 / 4) {
            this.addContent(["A", "z"])
        } else if (r < 1 / 2) {
            this.addContent(["A", "Z"])
        } else if (r < 3 / 4) {
            this.addContent(["0", "9"])
        } else {
            this.addContent(["a", "z"])
        }
    }

    createCaputureGroup(length) {
        this.content = _.times(this.maxlength, () => {
            let c = RegexEntity.randomChar().replace("\\", "")
            while (c === "]" || c === "\\") {
                c = RegexEntity.randomChar().replace("\\", "")
            }
            return c
        })
        this.content = _.uniqWith(this.content, _.isEqual);
    }

    toString() {
        let s = ""
        if (this.isRange) {
            s = `[${this.content[0]}-${this.content[1]}]`
        } else {
            s = `[${this.reducetoString(this.content)}]`
        }
        return s + this.operator
    }

    mutate() {
        if (this.isRange) {
            this.content = []
            this.createRange()
        } else {
            this.maxlength += _.sample([-1, 1])
            this.createCaputureGroup()
        }

        this.operator = this.generateOperator()
    }
}

let re = new CaptureGroup()

re.content = ["\\B"]
re.operator = re.generateOperator()
re.mutate()

module.exports = RegexEntity
