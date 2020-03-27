import abcjs from "abcjs"

class CursorControl {
    constructor(scoreBoard, finishedCallback, downloadCallback) {

        this.scoreBoard = scoreBoard
        this.beatSubdivisions = 4
        /*
        onBeat: function (beatNumber, totalBeats, totalTime) {
            if (!self.beatDiv)
                self.beatDiv = document.querySelector(".beat")
            self.beatDiv.innerText = "Beat: " + beatNumber + " Total: " + totalBeats + " Total time: " + totalTime
        },
        */
        this.onReady = function () {
            downloadCallback()
        }
        this.onStart = function () {
            let svg = this.scoreBoard.querySelector("svg")
            let cursor = document.createElementNS("http://www.w3.org/2000/svg", "line")
            cursor.setAttribute("class", "abcjs-cursor")
            cursor.setAttributeNS(null, 'x1', 0)
            cursor.setAttributeNS(null, 'y1', 0)
            cursor.setAttributeNS(null, 'x2', 0)
            cursor.setAttributeNS(null, 'y2', 0)
            svg.appendChild(cursor)
        }
        this.onEvent = function (e) {
            if (e.measureStart && e.left === null)
                return;

            this.scoreBoard.querySelectorAll("svg .highlight")
                .forEach(el => el.classList.remove("highlight"))

            //document.querySelector(".feedback").innerHTML = "<div class='label'>Current Note:</div>" + JSON.stringify(e, null, 4)
            for (var i = 0; i < e.elements.length; i++) {
                e.elements[i].forEach(el => el.classList.add("highlight"))
            }

            var cursor = this.scoreBoard.querySelector("svg .abcjs-cursor")
            if (cursor) {
                cursor.setAttribute("x1", e.left - 2)
                cursor.setAttribute("x2", e.left - 2)
                cursor.setAttribute("y1", e.top)
                cursor.setAttribute("y2", e.top + e.height)
            }
        }
        this.onFinished = function () {
            this.scoreBoard.querySelectorAll("svg .highlight")
                .forEach(el => el.classList.remove("highlight"))
            var cursor = scoreBoard.querySelector("svg .abcjs-cursor")
            if (cursor) {
                cursor.parentNode.removeChild(cursor)
            }
            finishedCallback()
        }
    }
}

class ScoreBoardManager {
    constructor(scoreBoardId, scoreInputId, scoreOverlayId, callbacks) {
        let ua = window.navigator.userAgent;
        //console.log(ua)
        let webkit = /WebKit/i.test(ua)
        let appleHandHoldDevice = /iPhone|iPad|iPod|Mobile|mobile|CriOS/i.test(ua)
        let chrome = /Chrome/i.test(ua)
        let safari = /Safari/i.test(ua)
        this.specialMargin = false
        if (appleHandHoldDevice) {
            this.specialMargin = true
        } else if (safari && !chrome) {
            this.specialMargin = true
        }

        this.errCode = 0
        this.errMessage = ""

        this.isJazzified = false

        this.scoreBoardId = scoreBoardId
        this.scoreBoard = document.querySelector("#" + this.scoreBoardId)
        if (this.scoreBoard) {
            this.cursorControl = new CursorControl(this.scoreBoard, callbacks.finished, callbacks.download)
        } else {
            this.errCode = 1
            this.errMessage = "Score board not found."
            this.printErrorInfo()
        }
        this.scoreInputId = scoreInputId
        this.scoreInput = document.querySelector("#" + this.scoreInputId)
        if (!this.scoreInput) {
            this.errCode = 3
            this.errMessage = "Score board input not found."
            this.printErrorInfo()
        }
        let thisSBM = this
        this.scoreInput.addEventListener("blur", function () {
            //console.log("blur")
            if (thisSBM.scoreString != thisSBM.scoreInput.value) {
                thisSBM.setScoreName("Custom Song")
                thisSBM.setScoreString(thisSBM.scoreInput.value)
                thisSBM.renderCurrent()
                thisSBM.setTune(true)
                callbacks.blur()
            }
        })
        this.scoreInput.nextElementSibling.addEventListener("DOMSubtreeModified", callbacks.warningChange)
        //this.scoreInput.addEventListener("focus", function () {
        //    console.log("focus")
        //})

        this.scoreOverlayId = scoreOverlayId
        this.scoreOverlay = document.querySelector("#" + this.scoreOverlayId)
        if (!this.scoreOverlay) {
            this.errCode = 4
            this.errMessage = "Score board overlay not found."
            this.printErrorInfo()
        }

        if (abcjs.synth.supportsAudio()) {
            this.synthControl = new abcjs.synth.SynthController();
            this.synthControl.load("#midi-audio",
                this.cursorControl,
                {
                    displayLoop: true,
                    displayRestart: true,
                    displayPlay: true,
                    displayProgress: false,
                    displayWarp: true
                }
            )
        } else {
            this.errCode = 2
            this.errMessage = "Audio is not supported in this browser."
            this.printErrorInfo()

        }
    }

    setScore(song) {
        this.scoreName = song.scoreName
        this.scoreString = song.scoreString
        this.scoreInput.value = song.scoreString
    }

    setScoreName(scoreName) {
        this.scoreName = scoreName
    }

    setScoreString(scoreString) {
        this.scoreString = scoreString
        this.scoreInput.value = scoreString
    }

    renderCurrent() {
        //this.scoreOverlay.style.width = this.scoreBoard.offsetWidth + "px"
        //this.scoreOverlay.style.height = this.scoreBoard.offsetHeight + "px"
        //this.scoreOverlay.style.opacity = 1
        //console.log(this.getWidth())

        //this.visualObj = abcjs.renderAbc(this.scoreBoardId, this.scoreString, engraverParams)
        let editorOnchange = function (editorInstance) {
            //console.log("onchange")
        }
        let thisSBM = this
        this.editor = new abcjs.Editor(
            this.scoreInputId,
            {
                paper_id: this.scoreBoardId,
                warnings_id: this.scoreInput.nextElementSibling.id,
                selectionChangeCallback: function (start, end) {
                    //console.log("on selection" + start + " " + end)
                    var charsPerRow = thisSBM.scoreInput.cols;
                    var selectionRow = (start - (start % charsPerRow)) / charsPerRow;
                    var lineHeight = thisSBM.scoreInput.clientHeight / thisSBM.scoreInput.rows;
                    thisSBM.scoreInput.scrollTop = lineHeight * selectionRow;
                },
                indicate_changed: true,
                //onchange: editorOnchange,
                abcjsParams: {
                    add_classes: true,
                    paddingtop: 25,
                    paddingbottom: 10,
                    paddingright: (thisSBM.specialMargin ? 0 : 20),
                    paddingleft: 20,
                    responsive: "resize"
                }
            })
        //console.log(this.editor)
        this.visualObj = this.editor.tunes[0]

        //console.log(this.scoreBoard.style)
        // needed to make the height correct, but don't know why
        this.scoreBoard.querySelector("svg").getBBox()
        this.scoreBoard.style.paddingBottom = 0
        //console.log(this.scoreBoard.querySelector("svg").width)
        //console.log(this.scoreBoard.style.width)
        //this.scoreBoard.style.width = this.scoreBoard.querySelector("svg").width.baseVal.value + "px"
        //console.log(this.scoreBoard.style.width)
        this.scoreBoard.style.height = this.scoreBoard.querySelector("svg").height.baseVal.value + "px"

        //console.log(this.scoreBoard.offsetWidth)
        this.scoreInput.style.width = this.scoreBoard.offsetWidth + "px"
        //console.log(this.scoreInput.style.width)
        this.scoreInput.nextElementSibling.style.width = this.scoreBoard.offsetWidth + "px"
    }

    onResize() {
        // needed to make the height correct, but don't know why
        this.scoreBoard.querySelector("svg").getBBox()
        this.scoreBoard.style.paddingBottom = 0
        this.scoreBoard.style.height = this.scoreBoard.querySelector("svg").height.baseVal.value + "px"

        this.scoreInput.style.width = this.scoreBoard.offsetWidth + "px"
        this.scoreInput.nextElementSibling.style.width = this.scoreBoard.offsetWidth + "px"
    }

    setTune(userAction) {
        let createSynth = new abcjs.synth.CreateSynth();
        let synthControl = this.synthControl
        let visualObj = this.visualObj
        createSynth.init({ visualObj: this.visualObj, soundFontUrl: "https://paulrosen.github.io/midi-js-soundfonts/MusyngKite/" }).then(function () {
            synthControl.setTune(visualObj, userAction, { chordsOff: true }).then(function () {
                // console.log("Audio successfully loaded.")
            }).catch(function (error) {
                console.warn("Audio problem:", error);
            });
        }).catch(function (error) {
            console.warn("Audio problem:", error);
        });
    }

    printErrorInfo() {
        if (this.errCode > 0) {
            console.error("Error Code " + this.errCode + ": " + this.errMessage)
        }
    }

    play() {
        if (this.synthControl) this.synthControl.play()
    }
    pause() {
        if (this.synthControl) this.synthControl.pause()
    }
    download() {
        if (this.synthControl) {
            var suffix = "-Original"
            if (this.isJazzified) {
                suffix = "-Jazzified"
            }
            this.synthControl.download(this.scoreName + suffix + ".wav")
        }
    }

    getWidth() {
        return this.scoreBoard.offsetWidth
    }
}

export default ScoreBoardManager