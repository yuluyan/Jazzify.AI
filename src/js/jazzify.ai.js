import ExampleSongs from "./example-songs"
import ScoreBoardManager from "./score-board-manager"
import Jazzify from "./jazzify-core"


(document.addEventListener('DOMContentLoaded', function (event) {
    let finishedCallback = function () {
        document.querySelector("#play .start").classList.remove("hide")
        document.querySelector("#play .pause").classList.add("hide")
        document.querySelector("#play .playing").classList.add("hide")
    }
    let downloadCallback = function () {
        //document.querySelector("#download").disabled = false
    }
    let blurCallback = function () {
        document.querySelector("#play .start").classList.remove("hide")
        document.querySelector("#play .pause").classList.add("hide")
        document.querySelector("#play .playing").classList.add("hide")
        document.querySelector("#download").disabled = true
    }
    let warningChangeCallback = function (e) {
        if (e.target.innerHTML == "") {
            // no error on the abc parser
            document.querySelector("#play").disabled = false
        } else {
            // error parsing disable play
            document.querySelector("#play").disabled = true
            document.querySelector("#download").disabled = true
        }
    }
    let callbacks = {
        finished: finishedCallback,
        download: downloadCallback,
        blur: blurCallback,
        warningChange: warningChangeCallback
    }
    const SBM = new ScoreBoardManager(
        "score-display", "score-input", "score-overlay",
        callbacks
    )
    document.querySelector("#play").addEventListener("click", function () {
        SBM.play()
        document.querySelector("#download").disabled = false
        if (!document.querySelector("#play .start").classList.contains("hide")) {
            document.querySelector("#play .start").classList.add("hide")
            document.querySelector("#play .playing").classList.remove("hide")
        } else if (!document.querySelector("#play .playing").classList.contains("hide")) {
            document.querySelector("#play .playing").classList.add("hide")
            document.querySelector("#play .pause").classList.remove("hide")
        }
        else if (!document.querySelector("#play .pause").classList.contains("hide")) {
            document.querySelector("#play .pause").classList.add("hide")
            document.querySelector("#play .playing").classList.remove("hide")
        }
    })

    document.querySelector("#jazzify").addEventListener("click", function () {
        let jazzifiedScore = Jazzify(SBM.scoreString)
        SBM.setScoreString(jazzifiedScore)
        SBM.renderCurrent()
        SBM.setTune(true)
        SBM.isJazzified = true
        document.querySelector("#play .start").classList.remove("hide")
        document.querySelector("#play .pause").classList.add("hide")
        document.querySelector("#play .playing").classList.add("hide")
    })

    document.querySelector("#download").addEventListener('click', function () {
        SBM.download()
    })

    window.addEventListener('resize', function () {
        //SBM.renderCurrent()
        SBM.onResize()
    })

    let initialExampleId = Math.floor(Math.random() * ExampleSongs.length)
    SBM.setScore(ExampleSongs[initialExampleId])
    SBM.renderCurrent()
    SBM.setTune(false)

    // Initialize the example dropdowns
    ExampleSongs.forEach(song => {
        let dropdownItem = document.createElement("a")
        dropdownItem.setAttribute("class", "dropdown-item")
        dropdownItem.setAttribute("href", "#")
        dropdownItem.innerText = song.scoreName
        dropdownItem.onclick = function () {
            if (song.scoreString != SBM.scoreString) {
                SBM.setScore(song)
                console.log(SBM.scoreName)
                SBM.renderCurrent()
                SBM.setTune(true)
                SBM.isJazzified = false
                document.querySelector("#play .start").classList.remove("hide")
                document.querySelector("#play .pause").classList.add("hide")
                document.querySelector("#play .playing").classList.add("hide")
            }
        }
        document.querySelector("#example-dropdown .dropdown-menu").appendChild(dropdownItem)
    })


}))