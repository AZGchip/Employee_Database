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
                let sentTable = answer.action.toLowerCase();
                console.log("sentTable = " + sentTable)
                addSplitter(sentTable)
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
            console.log("returning " + result)
            return result;
        }
    });

}
function formatData(list) {
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
function addSplitter(table) {
    console.log("addform table =" + table)



    switch (table) {
        case "employee":
            employeeQ1(table)
            break;

        case "role":
            roleQ1(table);
            break;

        case "department":
            promptinfo(
                {
                    type: "input",
                    message: "Enter Department Name",
                    name: "title"
                },(table) 
            );
            break;

        case "back":
            addMenu();
    }
}
function roleQ1(selection) {
    let search = `SELECT * FROM ${selection}`
    connection.query(search, function (err, result) {
        if (err) throw err;
        else {
            let departments = formatData(result);
            const roleQuestions = [
                {
                    type: "input",
                    message: "Enter Role Title",
                    name: "title"
                },
                {
                    type: "number",
                    message: "Enter salary",
                    name: "salary"
                },
                {
                    type: "list",
                    message: "Select Department",
                    name: "role_id_list",
                    choices: departments
                },
            ]
            promptinfo(roleQuestions, selection);
        }

    });
}
function employeeQ1(selection) {
    let search = `SELECT * FROM ${selection}`
    connection.query(search, function (err, result) {
        if (err) throw err;
        else {
            let formated = formatData(result);
            employeeQ2(selection, formated);
        }

    });
}
function employeeQ2(selection, manager_id) {
    let search = `SELECT * FROM ${"role"}`
    connection.query(search, function (err, result) {
        if (err) throw err;
        else {
            let formated = formatData(result);
            employeeQ3(selection, formated, manager_id)
        }
    });
}
function employeeQ3(selection, role_id, manager_id) {
    const employeeQuestions = [
        {
            type: "input",
            message: "Enter First Name of Employee",
            name: "first_name"
        },
        {
            type: "input",
            message: "Enter Last Name of Employee",
            name: "last_name"
        },
        {
            type: "list",
            message: "Select Role",
            name: "role_id_list",
            choices: role_id
        },
        {
            type: "list",
            message: "select Manager",
            name: "manager_id_list",
            choices: manager_id
        },

    ]
    promptinfo(employeeQuestions, selection)
}
async function promptinfo(array, job) {
    const info = [];
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
                else if (key.includes("salary") && isNaN(answer[key])) {
                    console.log("Please Input Valid Salary");
                    i--;
                }
                else if (key.includes("_list")) {
                    let id = answer[key].split("| ")[0]
                    id = parseInt(id.match(/\d+/)[0])
                    answer[key] = id;
                    info.push(answer[key]);
                }
                //if no validation problems are found, adds key/attribute pair to startInfo
                else {
                    console.log(answer[key])
                    info.push(answer[key]);
                }
            })
    }
    let addType;
    if (job === "employee") {
        addType = `INSERT INTO employee (first_name,last_name,role_id,manager_id) VALUES ("${info[0]}","${info[1]}",${info[2]},${info[3]})`;
        console.log(addType)
    }
    else if (job === "role") {
        addType = `INSERT INTO role (title,salary,department_id) VALUES (${info[0]},${info[1]},${info[2]})`;
    }
    else if (job === "department") {
        addType = `INSERT INTO role (name) VALUES (${info[0]})`;
    }

    connection.query(addType, function (err, result) {
        if(err){
            console.log(err)
        }
        else{
            console.log(job +" Added")
        }
    })
}