/**
 * A gain .618033989 or loss of .381966011 GOLDEN RATIO
 */


const Genetic = require('genetic-js')
const RegexEntity = require('./models/regexentity')
let genetic = Genetic.create()

// Select optimisations and selection methods
genetic.optimize = Genetic.Optimize.Maximize
genetic.select1 = Genetic.Select1.Tournament2
genetic.select2 = Genetic.Select2.Tournament2


const correctEmails = ["himion0@gmail.com", "asd9a98s7da9s8d7987da98sd7averylong@gmail.com",
    "harry@hotmail.co.uk", "admin@yoked.io", "email@emample.com",
    "some@place.in.iraq",
    "123@gmail.com", "big_123@gmail.com", "123@averglongdomaininaweirdplace.co.uk"]
const invalidEmails = [
    " ", " himion0@gmail.com", "himio!*@*(*&.com",
    "asda", ".com", "(*&(*&@&.com",
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
    let correct = this.userData.correct
    let invalid = this.userData.invalid
    let re, fitness = 0
    try {
        let start = new Date()
        re = new RegExp(regexstring)
        let percentagecorrect = 0
        
        correct.forEach(v => {
            let matches = v.match(re)
            if (matches && matches.length > 0) {
                let biggestmatch = _.maxBy(matches, x => x ? x.length : 0).length
                percentagecorrect += 2 * (biggestmatch ? biggestmatch / matches.input.length : 0)
            }
        })

        // Get mean of correct percentages
        if (correct.length && percentagecorrect)
            fitness = percentagecorrect / correct.length

        let percentageinvalid = 0
        invalid.forEach(v => {
            let matches = v.match(re)
            if (matches && matches.length > 0) {
                let biggestmatch = _.maxBy(matches, x => x ? x.length : 0).length
                percentageinvalid += 2 * (biggestmatch ? biggestmatch / matches.input.length : 0)
            }
        })

        // Get average invalid
        if (invalid.length && percentageinvalid)
            fitness -= percentageinvalid / invalid.length

        // Scale values 

        fitness *= 100

        // Let performance of the regex affect the fitness
        let finish = (new Date() - start)

        if (finish > 10000)
            console.log(`TOOK TO LONG! ${regexstring} took ${finish}ms `)

        fitness -= finish / 1000

        // Promote smaller regex strings
        fitness -= regexstring.length
        return fitness
    } catch (e) {
        console.log(e.stack)
    }
    return fitness
}

genetic.generation = function (pop, generation, stats) {
    let best = pop[0].entity
    console.log(`[Generation ${generation}] MAX ${stats.maximum} | MIN ${stats.minimum}`)
    console.log(`${best.toString()}\n`)
    return true
}

var config = {
    iterations: 4000,
    size: 500,
    crossover: 0.4,
    mutation: 0.2,
    skip: 20
}

genetic.evolve(config, userData)
console.log(genetic)

let x = 1