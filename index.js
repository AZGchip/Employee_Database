// Dependencies
const inquirer = require("inquirer");
const mysql = require("mysql");

//mysql connection 
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "employees"
});

//If Connection Successful, Runs Program
connection.connect(function (err) {
    if (err) {
        console.error("error connecting: " + err.stack);
        return;
    }
    console.log("connected as id " + connection.threadId)
    startMenu();
});

//-------------------- MENUS

//Main Menu -- prompts user to select sub menus
function startMenu() {
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "What would you like to do?",
            choices: [
                "View Data",
                "Edit Data",
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
                case "Edit Data":
                    editMenu();
                    break;
                case "Exit":
                    return console.log("Goodbye");
            }
        });
}

//View Menu - User Selects What Table to View or Goes Back to Menu
function viewMenu() {
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "View:",
            choices: [
                "Employee",
                "Role",
                "Department",
                new inquirer.Separator(),
                "Back"
            ]
        })
        //if back. return to menu. If Else, send lowercase answer selection to view()
        .then(function (answer) {
            if (answer.action === "Back") {
                startMenu();
            }
            else {
                let sentTable = answer.action.toLowerCase();
                view(sentTable)
            }
        });
}

// edit menu
function editMenu() {
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "Select What to edit",
            choices: [
                "Employee",
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
            else if (answer.action !== "Role") {
                console.log("sorry,this functionallity has yet to be added")
                editMenu()
            }
            else {
                let sentTable = answer.action.toLowerCase();
                editRole(sentTable)
            }
        });
}
//add items menu -- Sends user lowercased selection to addSplitter()
function addMenu() {
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "Add:",
            choices: [
                "Employee",
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
                addSplitter(sentTable)
            }
        });
}
//Remove Menu -- selected input is sent to getData
function removeMenu() {
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "Remove:",
            choices: [
                "Employee",
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
            //to Remove list with selected table
            else {
                let table = answer.action.toLowerCase()
                removeList(table)
            }
        });
}


//-------------------- data processing, prompts, and database queries

//this promise is used to return a database query
let getData = function (table) {
    return new Promise(function (resolve, reject) {
        let search = `SELECT * FROM ${table}`
        connection.query(search, function (err, result) {
            if (err) throw err;
            else {
                resolve(result);
            }
        })
        return resolve
    })
}

//takes raw database data and formats it for use in inquierer. adds pipes for better readablity
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

//prompts user for what is to be edited and what role should it be replaced with
function editRole(table) {
    let employee_id;
    let role_id
    getData("employee")
        .then(function (result) {
            getData("role").then((roles) => {
                inquirer
                    .prompt({
                        name: "action",
                        type: "list",
                        message: `Select the employee to change role`,
                        choices: formatData(result)
                    })
                    .then(function (answer) {
                        employee_id = answer.action.split("| ")[0]
                        employee_id = parseInt(employee_id.match(/\d+/)[0])
                        inquirer
                            .prompt({
                                name: "action",
                                type: "list",
                                message: `Select the employee to change role`,
                                choices: formatData(roles)
                            })
                            .then(function (answer) {
                                role_id = answer.action.split("| ")[0]
                                role_id = parseInt(role_id.match(/\d+/)[0])
                                edit(employee_id, role_id, table)

                            });
                    });
            })
        })
}
//changes role_id on matching employee_id
function edit(eId, rId, table) {
    let editParams = `UPDATE employee SET role_id = ${rId} WHERE employee_id = ${eId}`
    connection.query(editParams, function (err, result) {
        if (err) throw err;
        else {
            inquirer
                .prompt({
                    name: "action",
                    type: "list",
                    message: `Successfully edited ${table} From Database!`,
                    choices: [
                        "Back To Main Menu",
                        `Edit Another ${table}`,
                        "Exit",
                    ]
                })
                .then(function (answer) {
                    let action = answer.action;
                    if (action.includes("Edit Another")) {
                        editMenu(table);
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
// builds choices for inquirer using the selected database table for data removal, prompts user for data removal selection
function removeList(table) {
    getData(table)
        .then(function (result) {
            let choice = formatData(result)
            choice.push(new inquirer.Separator())
            choice.push("back")
            inquirer
                .prompt({
                    name: "action",
                    type: "list",
                    message: "Remove:",
                    choices: choice,
                })
                .then(function (answer) {
                    if (answer.action === "back") {
                        removeMenu();
                    }
                    else {
                        let id = answer.action.split("| ")[0]
                        id = parseInt(id.match(/\d+/)[0])
                        removeFromTable(id, table)
                    }
                });
        })
}

//deletes selected row from selected table
function removeFromTable(id, table) {
    let deleteParams = `DELETE FROM ${table} WHERE ${table + "_id"} =${id}`
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
                        removeList(table);
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

//routes to functions based on input for data addition
function addSplitter(table) {
    switch (table) {
        case "employee":
            employeeAdd(table)
            break;
        case "role":
            roleQ1(table);
            break;
        case "department":
            let question =[{
                type: "input",
                message: "Enter Department Name",
                name: "title"
            }]
            promptinfo(question,table)
            break;
        case "back":
            addMenu();
    }
}

//selects what query to add for data view selection and querys database
function view(table) {
    let search;
    switch (table) {
        case "employee":
            search = `SELECT * FROM employee
        JOIN role ON employee.role_id = role.role_id
        JOIN department ON role.department_id = department.department_id
        
        `
            break;
        case "role":
            search = `SELECT * FROM role
                INNER JOIN department ON role.department_id = department.department_id;`
            break;

        case "department":
            search = `SELECT * FROM department `
    }
    connection.query(search, function (err, result) {
        if (err) throw err;
        else {
            viewTable(result, table)
        }
    });
}
// displays selected table data 
function viewTable(info, table) {
    console.table(info)
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "",
            choices: [
                "Main Menu",
                "back"
            ]

        })
        .then(function (answer) {
            if (answer.action === "back") {
                viewMenu()
            }
            else {
                startMenu()
            }
        });
}
//function for adding a role 
function roleQ1(selection) {
    let search = `SELECT * FROM department`
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

//function to add employees
function employeeAdd(selection) {
    getData("employee")
        .then(function (manager_id) {
            getData("role")
                .then(function (role_id) {
                    if (manager_id === undefined){
                        manager_id = null;
                    }
                    else{manager_id = formatData(manager_id)}
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
                            choices: formatData(role_id)
                        },
                        {
                            type: "list",
                            message: "select Manager",
                            name: "manager_id_list",
                            choices: manager_id
                        },

                    ]
                    promptinfo(employeeQuestions, selection)
                })
        })
}

// prompts user with given array and job for data adding
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
                    info.push(answer[key]);
                }
            })
    }
    //select add type based on "job"
    let addType;
    if (job === "employee") {
        addType = `INSERT INTO employee (first_name,last_name,role_id,manager_id) VALUES ("${info[0]}","${info[1]}",${info[2]},${info[3]})`;
    }
    else if (job === "role") {
        addType = `INSERT INTO role (title,salary,department_id) VALUES ("${info[0]}",${info[1]},${info[2]})`;
    }
    else if (job === "department") {
        addType = `INSERT INTO department (name) VALUES ("${info[0]}")`;
    }
    //adds row based on addtype
    connection.query(addType, function (err, result) {
        if (err) {
            console.log(err)
        }
        else {
            inquirer
                .prompt({
                    name: "action",
                    type: "list",
                    message: `${job} + Added Successfully `,
                    choices: [
                        "Back To Main Menu",
                        `Add Another ${job}`,
                        "Exit",
                    ]
                })
                .then(function (answer) {
                    let action = answer.action;
                    if (action.includes("Add Another")) {
                        addSplitter(job);
                    }
                    else if (action === "Back To Main Menu") {
                        startMenu();
                    }
                    else if (action === "Exit") {
                        return console.log("Goodbye")
                    }
                });
        }
    })
}