let currentUser;//под кем логин
let usersArray;
let transferUser;
let usersKey = ["id", "name", "lastName", "age", "password", "email", "roles", "edit", "delete"];
let rolesArray;
let modal;
let newUser = {id: null, name: null, lastName: null, age: null, email: null, password: null, roles: []};

startAdmin();

async function startAdmin() {
    await getAllUsers();
    await getCurrent();
    await getAllRoles();

    modal = document.getElementById('modal');

    fillCurrentHeader();
    fillAdminTable();
    fillNewRoles();
}


async function getCurrent() {
    try {
        let response = await fetch('http://localhost:8081/rest/current',
            {
                method: 'GET',
                headers: {'Content-Type': 'application/json;charset=utf-8', 'Authorization':localStorage.getItem('jwt')},});

        if (response.ok){
            if ( usersArray=='err') {
                document.location.href = 'http://localhost:8080/user';
            }else {
                let user = await response.json();
                currentUser = user;
            }
        }else {
            document.location.href = 'http://localhost:8080/';
        }

        let user = await response.json();
        currentUser = user;
    } catch (error) {
        alert(error + " in getCurrent()");
    }
}


async function getAllUsers() {
    try {
        let response = await fetch('http://localhost:8081/rest/users',
            {
                method: 'GET',
                headers: {'Content-Type': 'application/json;charset=utf-8', 'Authorization':localStorage.getItem('jwt')},});
        if (response.ok){
            let users = await response.json();
            usersArray = users;
        }else {
            usersArray = 'err';
        }
    } catch (error) {
        alert(error + " in getAllUsers()");
    }
}


async function getAllRoles() {
    try {
        let response = await fetch('http://localhost:8081/rest/roles',
            {
                method: 'GET',
                headers: {'Content-Type': 'application/json;charset=utf-8', 'Authorization':localStorage.getItem('jwt')},});
        let roles = await response.json();
        rolesArray = roles;
    } catch (error) {
        alert(error + " in getAllRoles()");
    }
}


function fillAdminTable() {
    let numberOfRows = usersArray.length;
    let table = document.getElementById('common');
    let oldLen = table.rows.length;

    //del old
    for (let i = oldLen - 1; i > 0; i--) {
        table.deleteRow(i);
    }

    //create new table
    for (let i = 0; i < numberOfRows; i++) {
        let loneRow = table.insertRow();
        loneRow.id = "row" + i;
        for (let j = 0; j < usersKey.length; j++) {
            let loneCell = loneRow.insertCell();
            loneCell.id = "col" + j;
            if (j < 6) {
                loneCell.innerText = usersArray[i][usersKey[j]];
            } else if (j == 6) {
                let roles = "";
                for (let k = 0; k < usersArray[i].roles.length; k++) {
                    roles += usersArray[i].roles[k].role + " ";
                }
                loneCell.innerText = roles;
            } else if (j == 7) {
                loneCell.innerHTML = "<button type=\"button\" class=\"btn btn-info\" onClick=\"openEditModal(" + i + ")\">EDIT</button>";
            } else {
                loneCell.innerHTML = "<button type=\"button\" class=\"btn btn-danger\" onClick=\"openDeleteModal(" + i + ")\">DELETE</button>";
            }
        }
    }
}


function fillNewRoles() {
    let curRoles = document.getElementById("new-roles")
    curRoles.innerHTML = "";
    for (let j = 0; j < rolesArray.length; j++) {
        let option = new Option(rolesArray[j].role, j);
        curRoles.append(option);
    }
}


function fillCurrentHeader() {
    let m = document.getElementById("headerMail");
    m.innerText = currentUser["email"];
    m = document.getElementById("headerRole");
    let roles = "";
    for (let k = 0; k < currentUser.roles.length; k++) {
        roles += currentUser.roles[k].role + " ";
    }
    m.innerText = roles;
}

//-----------MODAL
window.onclick = function (event) {
    if (event.target == modal) {
        closeModal()
    }
}


function openDeleteModal(usrId) {
    openModal();
    fillModal(usrId);
    arrangeDelete(usrId);
}


function openEditModal(usrId) {
    transferUser = null;
    openModal();
    fillModal(usrId);
    arrangeEdit(usrId);
}


function openModal() {
    document.getElementById("backdrop").style.display = "block"
    document.getElementById("modal").style.display = "block"
    document.getElementById("modal").className += "show"
}


function closeModal() {
    document.getElementById("backdrop").style.display = "none"
    document.getElementById("modal").style.display = "none"
    document.getElementById("modal").className += document.getElementById("modal").className.replace("show", "")
    transferUser = null;
}


function fillModal(usrId) {
    let usr = usersArray[usrId];
    for (let j = 0; j < usersKey.length; j++) {
        if (j < 6) {
            document.getElementById("user-" + usersKey[j]).value = usr[usersKey[j]];
        }
    }
}


function arrangeDelete(usrId) {
    document.getElementById("exampleModalLabel").innerText = "Delete User";
    let delButton = document.getElementById("doButton");
    delButton.value = "Delete";
    delButton.className = "btn btn-danger";
    let trueUserID = usersArray[usrId].id;
    delButton.setAttribute('onclick', 'doDelete(' + trueUserID + ')');

    for (let j = 0; j < usersKey.length; j++) {
        if (j < 7) {
            document.getElementById("user-" + usersKey[j]).setAttribute('disabled', 'disabled');
        }
    }

    let curRoles = document.getElementById("user-roles")
    curRoles.innerHTML = "";
    for (let j = 0; j < usersArray[usrId].roles.length; j++) {
        let option = new Option(usersArray[usrId].roles[j].role, "");
        curRoles.append(option);
    }
}


function arrangeEdit(usrId) {
    document.getElementById("exampleModalLabel").innerText = "Edit User";
    let editButton = document.getElementById("doButton");
    editButton.value = "Edit";
    editButton.className = "btn btn-primary";
    transferUser = usersArray[usrId];
    let trueUserID = transferUser.id;
    editButton.setAttribute('onclick', 'doEdit(' + trueUserID + ')');

    for (let j = 1; j < usersKey.length; j++) {
        if (j < 7) {
            document.getElementById("user-" + usersKey[j]).removeAttribute("disabled");
        }
    }

    let curRoles = document.getElementById("user-roles")
    curRoles.innerHTML = "";
    for (let j = 0; j < rolesArray.length; j++) {
        let option = new Option(rolesArray[j].role, j);
        curRoles.append(option);
    }
}




async function doDelete(trueUserID) {
    try {
        let response = await fetch('http://localhost:8081/rest/' + trueUserID, {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json;charset=utf-8', 'Authorization':localStorage.getItem('jwt')},});
        let users = await response.json();
        usersArray = users;
        await fillAdminTable();
    } catch (error) {
        alert(error + " in doDELETE()");
    }
    closeModal();
}


async function doEdit(trueUserID) {
    for (let j = 1; j < 7; j++) {
        if (j < 6) {
            transferUser[usersKey[j]] = document.getElementById('user-' + usersKey[j]).value;
        } else if (j == 6) {
            let selectedRoles = document.getElementById('user-' + usersKey[j]).selectedOptions;
            transferUser.roles.splice(0)
            for (let k = 0; k < selectedRoles.length; k++) {
                transferUser.roles.push(rolesArray[selectedRoles[k].value]);
            }
        }
    }

    try {
        let response = await fetch('http://localhost:8081/rest/' + trueUserID, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json;charset=utf-8', 'Authorization':localStorage.getItem('jwt')},
            body: JSON.stringify(transferUser),
        });
        let users = await response.json();
        usersArray = users;
        await fillAdminTable();
    } catch (error) {
        alert(error + " in doEdit()");
    }
    closeModal();
}


async function doNew() {
    for (let j = 1; j < 7; j++) {
        if (j < 6) {
            newUser[usersKey[j]] = document.getElementById('new-' + usersKey[j]).value;
        } else if (j == 6) {
            let selectedRoles = document.getElementById('new-' + usersKey[j]).selectedOptions;
            newUser.roles.splice(0)
            for (let k = 0; k < selectedRoles.length; k++) {
                newUser.roles.push(rolesArray[selectedRoles[k].value]);
            }
        }
    }
    clearNew();
    try {
        let response = await fetch('http://localhost:8081/rest',
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json;charset=utf-8', 'Authorization':localStorage.getItem('jwt')},
                body: JSON.stringify(newUser),
            });
        let users = await response.json();
        usersArray = users;

        fillAdminTable();
    } catch (error) {
        alert(error + " in doNEW()");
    }
}


function clearNew() {
    for (let j = 1; j < 6; j++) {
        document.getElementById('new-' + usersKey[j]).value = null;
    }
}

function doLogout(){
    localStorage.setItem('jwt', '');
    document.location.href = 'http://localhost:8080/';
}