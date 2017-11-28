const Genetic = require('genetic-js')
const RegexEntity = require('./regexentity')
let genetic = Genetic.create()

// Select optimisations and selection methods
genetic.optimize = Genetic.Optimize.Maximize
genetic.select1 = Genetic.Select1.Tournament2
genetic.select2 = Genetic.Select2.Tournament2

var userData = {
    correct: ["himion0@gmail.com", "valid@email.com", "invalid@email.com",
        "harry@hotmail.co.uk", "admin@yoked.io", "email@emample.com",
        "hotstuff123@email.com", "well_done@email.com"],
    invalid: []
    // "asda", ".com", "email@a.com", "email.a.o", "himion0 @gmail.com",
    // "!himion0@gmail.com", "something@email.com"]
}

const _ = genetic.__proto__._ = require('lodash')
genetic.__proto__.RegexEntity = RegexEntity

genetic.__proto__.startingsize = 5

genetic.seed = function () {
    return new this.RegexEntity(this.startingsize)
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
    let regexstring = entity.toString()

    let start = new Date()
    let re, fitness = 0
    try {
        re = new RegExp(regexstring)
        this.userData.correct.forEach(v => {
            let matches = v.match(re)
            if (matches && matches.length > 0) {
                matches = matches.map(x => x ? x.length: 0)
                let longestmatch = _.max(matches)
                fitness += longestmatch.length
            }
        })

        this.userData.invalid.forEach(v => {
            let match = _.max(v.match(re))
            if (match) {
                fitness -= match.length
            }
        })

    } catch (e) {
        console.log(e)
        return 0
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
    size: 1000,
    crossover: 0.3,
    mutation: 0.3,
    skip: 10
}

genetic.evolve(config, userData)
console.log(genetic)
let x = 1