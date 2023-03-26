import { DecisionTree } from "./libraries/decisiontree.js"
import { VegaTree } from "./libraries/vegatree.js"

//
// DATA
//
const csvFile = "./data/mushrooms.csv"
const trainingLabel = "class"  
const ignored = []  
let amountCorrect = 0
let totalAmount = 0
let decisionTree

//
// laad csv data als json
//
function loadData() {
    Papa.parse(csvFile, {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: (results) => {
            // console.log(results.data)
            trainModel(results.data)
                    }
    // gebruik deze data om te trainen
    })
}

//
// MACHINE LEARNING - Decision Tree
//
function trainModel(data) {
    // todo : splits data in traindata en testdata

    let trainData = data.slice(0, Math.floor(data.length * 0.8))
    let testData = data.slice(Math.floor(data.length * 0.8) + 1)

    // maak het algoritme aan
    decisionTree = new DecisionTree({
        ignoredAttributes: ignored,
        trainingSet: trainData,
        categoryAttr: trainingLabel
    })

    // let json = decisionTree.stringify()
    // console.log(json)

    // Teken de boomstructuur - DOM element, breedte, hoogte, decision tree
    let visual = new VegaTree('#view', 800, 400, decisionTree.toJSON())


    // todo : maak een prediction met een sample uit de testdata
    predictAll(testData)



    // todo : bereken de accuracy met behulp van alle test data
    calculateAccuracy()


}

function predictAll(testData){
    amountCorrect = 0
    totalAmount = testData.length

    let isPoisonous = 0
    let isNotPoisonous = 0
    let predictedWrongPoisonous = 0
    let predictedWrongNotPoisonous = 0


    for (const testMushroom of testData) {
        let mushroomWithoutLabel = Object.assign({}, testMushroom)
        delete mushroomWithoutLabel.class
        // console.log(mushroomWithoutLabel)

        let prediction = decisionTree.predict(mushroomWithoutLabel)
        // console.log(prediction)

        if (prediction == testMushroom.class) {
            amountCorrect++

            if (prediction == "e"){
                isNotPoisonous++
            } else if (prediction == "p"){
                isPoisonous++
            }

        }

        if (prediction == "p" && testMushroom.class == "e") {
            predictedWrongNotPoisonous++
        } else if (prediction == "e" && testMushroom.class == "p") {
            predictedWrongPoisonous++
        }

    }
    showMatrix(isPoisonous,isNotPoisonous,predictedWrongPoisonous,predictedWrongNotPoisonous)
}

function calculateAccuracy(){
    //bereken de accuracy met behulp van alle test data
    let accuracy = amountCorrect / totalAmount

    let accuracyHTML = document.getElementById("accuracy")
    accuracyHTML.innerHTML = `Accuracy is ${accuracy}`
}

function showMatrix(isPoisonous,isNotPoisonous,predictedWrongPoisonous,predictedWrongNotPoisonous){
    document.getElementById("total").innerHTML = totalAmount+" tested in total."
    document.getElementById("total-correct").innerHTML = amountCorrect+" predicted correctly!"
    document.getElementById("actual-poison").innerHTML = isPoisonous
    document.getElementById("actual-no-poison").innerHTML = isNotPoisonous
    document.getElementById("predicted-wrong-no-poison").innerHTML = predictedWrongPoisonous
    document.getElementById("predicted-wrong-poison").innerHTML = predictedWrongNotPoisonous

}


loadData()


let form = document.forms['model']; 
 
const element = document.getElementById("button");
element.addEventListener("click", loadSavedModel);

function loadSavedModel() {
    fetch("./model.json")
        .then((response) => response.json())
        .then((model) => modelLoaded(model))
}

function modelLoaded(model) {
    let decisionTree = new DecisionTree(model)

    let odor = document.getElementById('odor').value;
    let bruises = document.getElementById('bruises').value;
    let sporeprintcolor = document.getElementById('spore-print-color').value;
    let stalksurfacebelowring = document.getElementById('stalk-surface-below-ring').value;
    let habitat = document.getElementById('habitat').value;
    let stalkroot = document.getElementById('stalk-root').value;
    let gillspacing = document.getElementById('gill-spacing').value;



    console.log(odor)

    // test om te zien of het werkt
    let mushroom = { odor: odor, bruises: bruises, sporeprintcolor: sporeprintcolor, stalksurfacebelowring: stalksurfacebelowring, habitat: habitat, stalkroot: stalkroot, gillspacing: gillspacing }
    let prediction = decisionTree.predict(mushroom)



    if (prediction == "e") {
        var predictionText = "edible!"
    } else {
        var predictionText = "poisonous..."
    };
    document.getElementById("prediction").innerHTML = "This one is " + predictionText;
    console.log("predicted " + predictionText);


}