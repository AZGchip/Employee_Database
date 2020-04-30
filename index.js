const inquirer = require("inquirer");
const mysql = require("mysql");
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "employees"
});
connection.connect(function (err) {
    if (err) {
        console.error("error connecting: " + err.stack);
        return;
    }
    console.log("connected as id " + connection.threadId);
});
//start menu
startMenu()
function startMenu() {
    inquirer
        .prompt({
            name: "action",
            type: "rawlist",
            message: "What would you like to do?",
            choices: [
                "View Data",
                "Add Data",
                "Remove Data",
                new inquirer.Separator(),
                "Exit"
            ]
        })
        .then(function (answer) {
            switch (answer.action) {
                case "View Data":
                    viewMenu();
                    break;

                case "Add Data":
                    addMenu();
                    break;

                case "Remove Data":
                    removeMenu();
                    break;

                case "Exit":
                    return console.log("goodbye");
            }
        });
}



//add items menu
function addMenu() {
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "Add:",
            choices: [
                "Employee",
                "Manager",
                "Role",
                "Department",
                new inquirer.Separator(),
                "Back"
            ]
        })
        .then(function (answer) {
            if (answer.action === "Back") {
                startMenu();
            }
            else {
                addForm(toLowerCase(answer.action))
            }
        });
}
//Remove Menu
function removeMenu() {
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "Remove:",
            choices: [
                "Employee",
                "Manager",
                "Role",
                "Department",
                new inquirer.Separator(),
                "Back"
            ]
        })
        .then(function (answer) {
            //back to menu
            if (answer.action === "Back") {
                startMenu();
            }
            //to Remove menu
            else {
                let deleteType = answer.action.toLowerCase()
                getData(deleteType, true)
            }
        });
}

function getData(selection, deleteCall) {
    let search = `SELECT * FROM ${selection}`
    connection.query(search, function (err, result) {
        if (err) throw err;
        if (deleteCall) {
            // console.log(result)
            removeList(result, selection)
        }
        else {
            return result;
        }
    });

}
function formatData(list){
    let choice = [];
    list.forEach(element => {
        if (element === undefined) {
            console.log("Error:selected list item is undefined in function formatData()")
        }
        else {
            let keys = Object.keys(element);
            let formatedElement = keys.reduce((acc, key) => {
                if (key) {
                    acc += `${key}: ${element[key]}| `;
                }
                return acc;
            }, "")
            choice.push(formatedElement);
        }
    });
    return choice
}
function removeList(list, selection) {
    let choice = formatData(list)
    choice.push(new inquirer.Separator())
    choice.push("back")
    // console.log(choice)
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "Remove:",
            choices: choice,
        })
        .then(function (answer) {
            console.log(answer.action)
            if (answer.action === "back") {
                removeMenu();
            }
            else {
                console.log("remove choice = " + answer.action)
                let id = answer.action.split("| ")[0]
                id = parseInt(id.match(/\d+/)[0])
                removeFromTable(id, selection)
            }
        });
}
function removeFromTable(id, table) {
    let deleteParams = `DELETE FROM ${table} WHERE id =${id}`
    connection.query(deleteParams, function (err, result) {
        if (err) throw err;
        else {
            inquirer
                .prompt({
                    name: "action",
                    type: "list",
                    message: `Successfully Removed ${table} From Database!`,
                    choices: [
                        "Back To Main Menu",
                        `Remove Another ${table}`,
                        "Exit",
                    ]
                })
                .then(function (answer) {
                    let action = answer.action;
                    if (action.includes("Remove Another")) {
                        getData(table, true);
                    }
                    else if (action === "Back To Main Menu") {
                        startMenu();
                    }
                    else if (action === "Exit") {
                        return console.log("Goodbye")
                    }
                });
        }
    });
}
function addForm(table) {
   
    
    let manager_id = '';
    let role_id = '';
    let department_id = '';
    const employeeQuestions = [
        {
            type: "input",
            message: "Enter First Name of Employee",
            name: "first_name"
        },
        {
            type: "number",
            message: "Enter Last Name of Employee",
            name: "last_name"
        },
        {
            type: "list",
            message: "Select Role",
            name: "role_id",
            choices: role_id
        },
        {
            type: "list",
            message: "select Manager",
            name: "manager_id",
            choices:manager_id
        },
        {
            type: "input",
            message: "Enter Manager Email",
            name: "email"
        },
        {
            type: "input",
            message: "Enter Manager Office Number",
            name: "office"
        },
    ]
    switch (table) {
        case "employee":
            manager_id = formatData(getData(table));
            role_id = formatData(getData("role"));

            break;

        case "manager":
            addMenu();
            break;

        case "role":
            removeMenu();
            break;

        case "department":
            return console.log("goodbye");
    }
}
async function promptinfo(array, job) {
    //loops through given array of questions using inquirer. builds an object
    for (let i = 0; i < array.length; i++) {
        await inquirer.prompt(array[i])
            .then(function (answer) {
                let key = Object.keys(answer)[0];

                //if answer is a blank string, asks for valid data then re-asks question 
                if (answer[key] === "") {
                    console.log("Please Input valid Data");
                    i--;
                }
                //if the key contains email, but the given answer doesnt match the regex, asks for valid email. re-asks question
                else if (key.includes("email") && !answer[key].match(/^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+)@(?:[a-z0-9]+)\.(?:[a-z0-9]+)$/g)) {
                    console.log("Please Input valid Email Address   Example:'johnsmith@example.com'");
                    i--;
                }
                //if no validation problems are found, adds key/attribute pair to startInfo
                else {
                    info[key] = answer[key];
                }
            })
    }
}