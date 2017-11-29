/**
 * A gain .618033989 or loss of .381966011 GOLDEN RATIO
 */


const Genetic = require('genetic-js')
const RegexEntity = require('./regexentity')
let genetic = Genetic.create()

// Select optimisations and selection methods
genetic.optimize = Genetic.Optimize.Maximize
genetic.select1 = Genetic.Select1.Tournament2
genetic.select2 = Genetic.Select2.Tournament2


const correctEmails = ["himion0@gmail.com",
    "harry@hotmail.co.uk", "admin@yoked.io", "email@emample.com",
    "some@place.in.iraq",
    "123@gmail.com", "big_123@gmail.com"]
const invalidEmails = [
    " ", " himion0@gmail.com", " ", "himio!*@*(*&.com",
    "asda", ".com", "himion0 @ gmai . com",
    "!himion0@gmail.com", "himion0@", "@gmail.com"
]

const correctNames = [
    "Harry Coultas Blum", "Valerie Coultas", "Paul Blum", "Mclloyd Vuong",
    "Stewart Scott", "Mohamed Abdula"
]

const invalidNames = [
    "123 123", "#", " ", "!(&*&(", "*&^* *&^", "Samuel Lee Jackson is a mother fucker"
]
var userData = {
    correct: correctEmails,
    invalid: invalidEmails
}

const _ = genetic.__proto__._ = require('lodash')
genetic.__proto__.RegexEntity = RegexEntity

genetic.__proto__.startingsize = 10

genetic.seed = function () {
    return new this.RegexEntity(this.startingsize, true)
}

genetic.mutate = function (entity) {
    entity.mutate()
    return entity
}

genetic.crossover = function (mother, father) {
    let mothercell = _.sample(mother.content)
    let motherindex = mother.content.indexOf(mothercell)
    let fathercell = _.sample(father.content)
    let fatherindex = father.content.indexOf(fathercell)

    let son = _.cloneDeep(father)
    son.content[fatherindex] = mothercell

    let daughter = _.cloneDeep(mother)
    daughter.content[motherindex] = fathercell

    return [son, daughter]
}

genetic.fitness = function (entity) {
    entity.preventBoundaryOperator()
    entity.operator = ""
    let regexstring = entity.toString()
    let start = new Date()
    let re, fitness = 0
    try {
        re = new RegExp(regexstring)
        this.userData.correct.forEach(v => {
            let matches = v.match(re)
            if (matches && matches.length > 0) {
                let biggestmatch = _.maxBy(matches, x => x ? x.length : 0).length
                fitness += 2 * (biggestmatch ? biggestmatch / matches.input.length : 0)
            }
        })

        this.userData.invalid.forEach(v => {
            let matches = v.match(re)
            if (matches && matches.length > 0) {
                let biggestmatch = _.maxBy(matches, x => x ? x.length : 0).length
                fitness -= 2 * (biggestmatch ? biggestmatch / matches.input.length : 0)
            }
        })

        fitness *= 10
        fitness -= regexstring.length
        return fitness
    } catch (e) {
        console.log(e.stack)
        return -20

    }

}

genetic.generation = function (pop, generation, stats) {
    let best = pop[0].entity
    console.log(`[Generation ${generation}] MAX ${stats.maximum} | MIN ${stats.minimum}`)
    console.log(`${best.toString()}\n`)
    return true
}

var config = {
    iterations: 4000,
    size: 1000,
    crossover: 0.4,
    mutation: 0.1,
    skip: 20
}

genetic.evolve(config, userData)
console.log(genetic)
let x = 1