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
            if (answer.action === "Back") {
                startMenu();
            }
            else {
                add(answer.action)
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
            removeList(result,selection)
        }
        else { showlist(result) }
    });

}

function removeList(list) {
    let choice = []
    list.forEach(element => {
        if (element === undefined) {
            console.log("Error:selected list item is undefined in function removeList()")
        }
        else {
            let keys = Object.keys(element);
            let formatedElement = keys.reduce((acc, key) => {
                if (key) {
                    acc += `${key}: ${element[key]}| `;
                }
                return acc;
            }, "")
            console.log(formatedElement);
            choice.push(formatedElement);
        }
    });
    // for(let i = 0;i < list.length;i++){

    //     else{
    //         console.log(list[i].id)
    //     // list[i].forEach(x => {
    //     //   if(x&& x !== null) {} 
    //     // });
    //     }    
    // }
    choice.push(new inquirer.Separator())
    choice.push("back")
    // console.log(choice)
    inquirer
        .prompt({
            name: "action",
            type: "rawlist",
            message: "Remove:",
            choices: choice,
        })
        .then(function (answer) {
            if (answer.action === "back") {
                removeMenu()
            }
            else { console.log("remove choice = " + answer.action) }
//id = parsint(answer.action.split("| ","")[0].split('id: ')[0])
        });
}
