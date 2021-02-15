let currentUser;//под кем логин
let personalKey = ["id", "name", "lastName", "age", "password", "email", "roles"];

startUser();

async function startUser() {
    await getCurrent();
    await fillCurrentHeader();
    await fillCurrentTable();

    //document.getElementById("admlink").style.display = "block";

    document.getElementById("admlink").style.display = "none";

    for (let k = 0; k < currentUser.roles.length; k++) {
        if (currentUser.roles[k].role == "ROLE_ADMIN"){
            document.getElementById("admlink").style.display = "block";
        }
    }

}

async function getCurrent() {
    try {
        let response = await fetch('http://localhost:8081/rest/current',
            {
                method: 'GET',
                headers: {'Content-Type': 'application/json;charset=utf-8'},
                credentials: 'include'});
        let user = await response.json();
        currentUser = user;
    } catch (error) {
        alert(error);
    }
}


async function fillCurrentHeader() {
    let m = document.getElementById("headerMail");
    m.innerText = currentUser["email"];
    m = document.getElementById("headerRole");
    let roles = "";
    for (let k = 0; k < currentUser.roles.length; k++) {
        roles += currentUser.roles[k].role + " ";
    }
    m.innerText = roles;
}


async function fillCurrentTable() {
    let tabl = document.getElementById('current');
    let loneRow = tabl.insertRow();
    loneRow.id = "row";
    for (let j = 0; j < personalKey.length; j++) {
        let loneCell = loneRow.insertCell();
        loneCell.id = "col" + j;
        if (j < 6) {
            loneCell.innerText = currentUser[personalKey[j]];
        } else if (j == 6) {
            let roles = "";
            for (let k = 0; k < currentUser.roles.length; k++) {
                roles += currentUser.roles[k].role + " ";
            }
            loneCell.innerText = roles;
        }
    }
}