const header = { "Content-Type": "application/json"}


document.addEventListener('DOMContentLoaded', async () => {
    console.log('test');
    document.getElementById('changeCredForm').addEventListener('submit', async () => {
        console.log("test")
        const newId = document.getElementById('name').value;
        const newKey = document.getElementById('password').value;

        let payload = {_id: sessionStorage.getItem('user_id'), access_id: newId, access_key: newKey};

        const changeCredentials = await fetch('http://localhost:3000/changeCredentials', {
            method : "POST",
            headers: header,
            body: JSON.stringify(payload)
        }).then(response => response.json());

        if (!changeCredentials)
            console.log("Something went wrong...");
        console.log(changeCredentials);
        res.json(changeCredentials);
    })

    document.getElementById('transactionLimitForm').addEventListener('submit', async () => {
        const limitVal = document.getElementById('limit').value;

        let payload = {_id: sessionStorage.getItem('user_id'), transaction_limit: limitVal};

        const setTransactionLimit = await fetch('http://localhost:3000/setTransactionLimit', {
            method : "POST",
            headers: header,
            body: JSON.stringify(payload)
        }).then(response => response.json());

        if (!setTransactionLimit)
            console.log("Something went wrong...");

        res.json(setTransactionLimit);
    })
})