import abcjs from "abcjs"

let Jazzify = function (scoreString) {
    console.log("Jazzify")
    let parseObj = abcjs.parseOnly(scoreString)[0]
    console.log(parseObj)
    console.log(parseObj.getBarLength())
    console.log(parseObj.getBeatLength())
    console.log(parseObj.getBeatsPerMeasure())
    console.log(parseObj.getBpm())
    console.log(parseObj.getMeter())
    console.log(parseObj.getMeterFraction())
    console.log(parseObj.getPickupLength())
    console.log(parseObj.getKeySignature())

    parseObj.lines

    return scoreString
}

export default Jazzify