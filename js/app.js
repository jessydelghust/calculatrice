// CALC CONTROLLER
// Module gérant la partie des calculs derrière l'UI
var calcController = (function() {

    // Objet contenant toutes les données utiles pour le fonctionnement de l'appli
    var data = {
        input: '',
        result: '',
        number1: '',
        number2: '',
        sign: '',
        sign2: '',
        operators: ["+", "-", "x", "/", "%", "x²", "="]
    };
    
    // Effectue le calcul
    var treatmentOfCalculation = function(firstNumber, secondNumber, operator) {
        if ( operator === "+" ) {
            data.result = firstNumber + secondNumber;
        } else if ( operator === "-" ) {
            data.result = firstNumber - secondNumber;
        } else if ( operator === "x" ) {
            data.result = firstNumber * secondNumber;
        } else if ( operator === "/" ) {
            data.result = firstNumber / secondNumber;
        } else if ( operator === "%" ) {
            data.result = firstNumber % secondNumber;
        }

        data.input = data.result;
    };

    // Nombre au carré
    var numberSquared = function(number) {
        data.result = Math.pow(number, 2);
        data.input = data.result;
    };

    return {
        // On remet à zéro
        reinitializeData: function() {
            data.input = data.result = data.number1 = data.number2 = data.sign = data.sign2 = '';
        },

        // Effectue les calculs
        doCalculation: function(valueOfInput) {

            var sizeOfString, indexOfOperators, indexOfSecondOperator, breakCalc;
            sizeOfString = valueOfInput.length;
            breakCalc = false;

            data.operators.forEach(function(cur) {

                if ( valueOfInput.indexOf(cur) !== -1 ) {

                    if ( cur !== "=" && cur !== "x²" ) {

                        indexOfOperators = valueOfInput.indexOf(cur);
                        indexOfSecondOperator = valueOfInput.lastIndexOf(cur);
                        data.number1 = parseFloat(valueOfInput.substring(0, indexOfOperators));

                        if ( data.sign != '' ) {
                            data.number2 = parseFloat(valueOfInput.substring(indexOfOperators + 1, sizeOfString - 1));
                            data.sign2 = valueOfInput.substring(indexOfSecondOperator, indexOfSecondOperator + 1);
                            treatmentOfCalculation(data.number1, data.number2, data.sign2);
                            breakCalc = true;
                        } else {
                            data.sign = valueOfInput.substring(indexOfOperators, indexOfOperators + 1);
                        }

                    } else if ( cur !== "=" && cur === "x²" ) {

                        indexOfOperators = valueOfInput.indexOf(cur);
                        data.number1 = parseFloat(valueOfInput.substring(0, indexOfOperators));
                        numberSquared(data.number1);

                    } else {

                        if (!breakCalc) {
                            data.number2 = parseFloat(valueOfInput.substring(indexOfOperators + 1, sizeOfString - 1));
                            treatmentOfCalculation(data.number1, data.number2, data.sign);
                        }

                    }
                }
            });
            return data.input;
        },

        // Retourne l'objet
        getData: function() {
            return {
                input: data.input,
                result: data.result,
                number1: data.number1,
                number2: data.number2,
                operators: data.operators,
                sign: data.sign1
            }
        }
    };

})();


// UI CONTROLLER
// Module s'occupant de gérer ce qui est affiché sur l'UI
var UIController = (function() {

    // On stocke des noms de classe
    var DOMstrings = {
        button: '.calculatrice-input__button',
        buttonOperators: '.calculatrice-input__button.operator',
        input: '.calculatrice-result__input'
    };

    return {
        // On affiche ce qu'on tape
        updateInput: function(clickButton, equal) {
            var value = clickButton;
            if ( equal ) {
                document.querySelector(DOMstrings.input).value = value;
            } else {
                document.querySelector(DOMstrings.input).value += value;
            }
        },

        // On récupère la valeur du input
        getInput: function(clickButton) {
            return document.querySelector(DOMstrings.input).value;
        },

        // On vide l'input
        reinitializeInput: function() {
            document.querySelector(DOMstrings.input).value = '';
        },

        // Supprimer un caractère
        delete: function() {
            var input, value, newValue;
            input = document.querySelector(DOMstrings.input)
            value = input.value;
            newValue = value.substr(0, value.length - 4);
            input.value = newValue;
        },

        // On active ou désactive les boutons d'opérations
        operatorsActivation: function(enabled) {
            var allOperators = document.querySelectorAll(DOMstrings.buttonOperators);
            for (i = 0; i < allOperators.length; i++) {
                if ( enabled ) {
                    allOperators[i].disabled = false;
                } else {
                    allOperators[i].disabled = true;
                }
            }
        },

        // On récupère l'objet contenant les noms de classe
        getDOMstrings: function() {
            return DOMstrings;
        }
    };

})();


// GLOBAL APP CONTROLLER
// Module principal qui appelle les deux autres modules dans le but de faire fonctionner l'application
var controller = (function(calcCtrl, UICtrl) {

    // On défini ici les événements au clic sur les boutons
    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();
        var inputs = document.querySelectorAll(DOM.button);

        for (i = 0; i < inputs.length; i++) {
            inputs[i].addEventListener('click', ctrlAddInInput);
            if ( inputs[i].textContent == "C" ) {
                inputs[i].addEventListener('click', deleteAll);
            } else if ( inputs[i].textContent == "Sup" ) {
                inputs[i].addEventListener('click', deleteOne);
            }
        }
    };

    var ctrlAddInInput = function(event) {
        var inputValue, datas;

        // 1. Afficher au fur et à mesure ce qu'on tape
        UICtrl.updateInput(event.target.textContent, false);

        // 2. On récupère la valeur entière du input
        inputValue = UICtrl.getInput();

        // 3. Si on clique sur une opération
        datas = calcCtrl.getData();
        if ( datas.operators.includes(event.target.textContent) ) {
            var newResult = calcCtrl.doCalculation(inputValue);
            if ( datas.sign != '') {
                UICtrl.operatorsActivation(false);
            }
            if ( event.target.textContent == "=" || event.target.textContent == "x²") {
                var newResult = calcCtrl.doCalculation(inputValue);
                UICtrl.updateInput(newResult, true);
                UICtrl.operatorsActivation(true);
            }
        }
    };

    var deleteAll = function() {
        // 1. Reinitialiser l'objet data
        calcCtrl.reinitializeData();
        // 2. Mettre à jour l'UI
        UICtrl.reinitializeInput();
    };

    var deleteOne = function() {
        // 1. Enlever un caractère
        UICtrl.delete();
    };

    return {
        init: function() {
            setupEventListeners();
        }
    };

})(calcController, UIController);

controller.init();