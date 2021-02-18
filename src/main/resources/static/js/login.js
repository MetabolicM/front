let fullResponse;
let loginRequest = {username: null, password: null};

async function doLogin() {
    loginRequest.username = document.getElementById('username').value;
    loginRequest.password = document.getElementById('password').value;

    try {
        let response = await fetch('http://localhost:8081/auth',
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(loginRequest),
            });

        if (response.ok){
            let answ = await response.json();
            fullResponse = answ;
            localStorage.setItem('jwt', fullResponse.token);
            document.location.href +=fullResponse.accessType
        }else {
            alert("Ошибка HTTP: " + response.status);
        }

    } catch (error) {
        alert(error + " in doLogin()");
    }

}