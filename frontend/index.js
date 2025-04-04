
const header = { "Content-Type": "application/json"}

document.addEventListener("DOMContentLoaded", async () => {
    let viewPasskeyCheckBox = document.getElementById("seePassword");
    let passwordInputField = document.getElementById("passwordField");
    if (viewPasskeyCheckBox.checked)
        passwordInputField.type = "text";
    else
        passwordInputField.type = "password";

    document.getElementById("seePassword").addEventListener("change", async () => {
        if (viewPasskeyCheckBox.checked)
        {
            passwordInputField.type = "text";
        }
        else
        {
            passwordInputField.type = "password";
        }
    })

    
    document.getElementById('login-form').addEventListener('submit', async function (e) {
        e.preventDefault();
        
        let invalidIdLabel = document.getElementById("invalidId");
        const inputtedId = document.getElementById("username").value;
        const inputtedPasskey = document.getElementById("passwordField").value;
        
        let payload = {access_id: inputtedId, access_key: inputtedPasskey}
        const credentials = await fetch("http://localhost:3000/loginInfo", {
            method : "POST",
            headers: header,
            body: JSON.stringify(payload)
        }).then(response => response.json())
        if (credentials != null){
            let person = await fetch("http://localhost:3000/person", {
                method: "POST",
                headers: header,
                body: JSON.stringify({_id: credentials["_id"]})
            }).then(response => response.json())
            sessionStorage.setItem('user_id', person['_id']);
            sessionStorage.setItem('username', person['name']);
            sessionStorage.setItem('access_id', inputtedId);
            sessionStorage.setItem('access_key', inputtedPasskey);
            window.location.href = 'user/' + person["type"] + "/dashboard.html"
            invalidIdLabel.innerHTML = ""
        }
        else {
            invalidIdLabel.innerHTML = "Invalid ID or Key!";
        }
    });
})

