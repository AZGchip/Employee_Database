const inquirer = require("inquirer")
//start menu
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
                    return;
            }
        });
}
//view items menu
function viewMenu() {
    inquirer
        .prompt({
            name: "action",
            type: "rawlist",
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
            switch (answer.action) {
                case "Employee":
                    addEmployee();
                    break;

                case "Manager":
                    addManager();
                    break;

                case "Role":
                    addRole();
                    break;

                case "Department":
                    addDepartment();
                    break;

                case "Back":
                   startMenu();
            }
        });
}
//Remove Menu
function removeMenu() {
    inquirer
        .prompt({
            name: "action",
            type: "rawlist",
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
            switch (answer.action) {
                case "Employee":
                    removeEmployee();
                    break;

                case "Manager":
                    removeManager();
                    break;

                case "Role":
                   removeRole();
                    break;

                case "Department":
                    removeDepartment();
                    break;

                case "Back":
                   startMenu();
            }
        });
}