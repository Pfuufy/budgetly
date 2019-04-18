
// Pattern for modular code using iffe's 

var x = (function() {

    var y = 5;

    var add = function(num) {
        return num + 5;
    }

    return {
        public: function(num) {
            console.log (add(num));
        }
    }
})();

/*
This iife will return an object which will be available to the outside code. 
Everything else within the iife will not be available or even known of.
Just invoke the method by writing x.public(); as if you're calling any
regular object method. Doing something like x.add(); will not work because
it is not available to the outside scope.
*/









// BUDGET CONTROLLER
var budgetController = (function() {
    // Controls all data manipulation

    var Expense = function(id, description, value) {

        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentages = function(totalIncome) {

        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function(id, description, value) {

        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: -1
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(current) {
            sum += current.value;
        });
        data.totals[type] = sum;
    };

    return {
        addItem: function(type, des, val) {
            
            var newItem, id;

            // Create new ID
            if (data.allItems[type].length === 0) {
                id = 0;
            } else {
                id = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }

            // Create new item based on inc or exp type
            if (type === 'exp') {
                newItem = new Expense(id, des, val);
            } else if (type === 'inc') {
                newItem = new Income(id, des, val);
            }

            // Push into data structure
            data.allItems[type].push(newItem);

            // Return new element
            return newItem;
        },

        deleteItem: function(type, id) {
            var ids, index;

            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(parseInt(id));

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function() {
            // Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate budget: income - expenses
            data.budget = data.totals['inc'] - data.totals['exp'];

            // Calculate percentage of income that we spend
            if (data.totals['inc'] > 0) {
                data.percentage = Math.round(data.totals['exp'] / data.totals['inc'] * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function() {

            data.allItems.exp.forEach(function(current) {
                current.calcPercentages(data.totals.inc);
            });
        },

        getPercentages: function() {

            var allPerc = data.allItems.exp.map(function(current) {
                return current.getPercentage();
            });
            return allPerc;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalIncome: data.totals['inc'],
                totalExpenses: data.totals['exp'],
                percentage: data.percentage
            };
        },

        test: function() {
            return data;
        }
    }

})();









// UI CONTROLLER
var UIController = (function() {
    // Controls UI manipulation

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type) {
        let int, dec;

        num = num.toFixed(2) ;
        num = num.split('.');
    
        int = num[0];
        dec = num[1];
    
        int = int.split('');
        for (let i = int.length; i > 0; i-=3 ) {
    
            if (i !== int.length) {
                int.splice(i, 0, ',');
            }
        }
    
        int = int.join('');
    
        type = type === 'inc' ? '+' : '-';
    
        return `${type} ${int}.${dec}`

    };

    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        }, 

        addListItem: function(obj, type) {
            // Create HTML string with placeholder text
            var html, newHtml, element;

            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix">' +
                '<div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn">' +
                '<i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div>' + 
                '<div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div>' + 
                '<div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorID) {

            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function() {
            var fields, fieldsArr;

            // Retrieve input field data. Returned as list, not array
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            // Convert list into array
            fieldsArr = Array.prototype.slice.call(fields);

            // Set each item of array to empty string
            fieldsArr.forEach(function(current) {
                current.value = '';
            });

            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {

            type = obj.budget >= 0 ? 'inc' : 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExpenses, 'exp');
            
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function(percentages) {

            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, function(current, index) {

                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });

        },

        displayMonth: function() {
            const months = [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'November',
                'December'
            ];

            var now, year, month, day;

            now = new Date();

            year = now.getFullYear();
            month = now.getMonth();
            day = now.getDay();
            document.querySelector(DOMstrings.dateLabel).textContent = `${months[month]} ${day}, ${year}`;
        },

        changedType: function() {

            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' + 
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );

            console.log(fields);

            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMstrings: function() {
            return DOMstrings;
        }
    }

})();









// GLOBAL CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {
    // Controls interactions between budgetController and UIController

    var setupEventListeners = function() {
        var DOM = UIController.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    
        document.addEventListener('keypress', function(event) {
            
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    
        document.querySelector(DOM.inputType).addEventListener('change', UIController.changedType);
    };

    var updateBudget = function() {
        // 1. Calculate the budget
        budgetController.calculateBudget();

        // 2. Return the budget
        var budget = budgetController.getBudget();
    
        // 3. Display the budget to the UI
        UIController.displayBudget(budget);
    };

    var updatePercentages = function() {

        // 1. Calculate percentages
        budgetController.calculatePercentages();

        // 2. Read percentages from budget controller
        var percentages = budgetController.getPercentages();

        // 3. Update UI with new percentages
        UIController.displayPercentages(percentages);
    };


    var ctrlAddItem = function() {
        var input, newItem;

        // 1. Get input data
        input = UIController.getInput();

        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
            // 2. Add item to the budget controller
            newItem = budgetController.addItem(input.type, input.description, input.value);
    
            // 3. Add item to the user interface
            UIController.addListItem(newItem, input.type);
    
            // 4. Clear the fields
            UIController.clearFields();
    
            // 5. Calculate and update budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentages();

        }

    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = splitID[1];

            // 1. Delete item from data structure
            budgetController.deleteItem(type, ID);

            // 2. Delete item from UI
            UIController.deleteListItem(itemID);

            // 3. Update and show new budget
            updateBudget();

            // 4. Calculate and update percentages
            updatePercentages();
        }
    };

    return {
        init: function() {
            console.log('Application has started');
            UIController.displayMonth();
            UIController.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }


})(budgetController, UIController);

controller.init();