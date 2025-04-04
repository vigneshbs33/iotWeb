const header = { "Content-Type": "application/json"}

document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('addMoneyForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const currDate = new Date()
        const addToId = document.getElementById('Id');
        const amountToAdd = document.getElementById('amountInput');

        if (addToId.value == null || amountToAdd.value == null)
            return;

        const personInfo = await fetch('http://localhost:3000/person', {
            method: "POST",
            headers: header,
            body: JSON.stringify({_id: addToId.value})
        }).then(response => response.json());

        const buyDate = currDate.getDate().toString().padStart(2, '0')
                        + '/' + (currDate.getMonth() + 1).toString().padStart(2, '0')
                        + '/' + currDate.getFullYear().toString().substr(-2);
        const buyTime = currDate.getHours().toString().padStart(2, '0') + ':' + currDate.getMinutes().toString().padStart(2, '0');
        const personName = personInfo['name'];
        console.log(personInfo);

        let payload = {
            buyer_id: addToId.value,
            buy_date: buyDate,
            buy_time: buyTime,
            buyer_name: personName,
            item_id: "ADDMONEY",
            item_name: "Top Up",
            item_price: parseInt(amountToAdd.value),
            type: 'gain'
        }
        const transact = await fetch("http://localhost:3000/makeTransaction", {
            method : "POST",
            headers: header,
            body: JSON.stringify(payload)
        }).then(response => response.json())

        if (transact){
            alert('Succesfully added amount')
            // document.getElementById('statusLabel').innerHTML = 'Succesfully added amount';
            location.reload();
        }
        else{
            alert('Something went wrong...');
            // document.getElementById('statusLabel').innerHTML = 'Something went wrong...';
            location.reload();
        }
    })

    let payload = {};
    const transactionHistory = await fetch("http://localhost:3000/transactionHistory", {
        method : "POST",
        headers: header,
        body: JSON.stringify(payload)
    }).then(response => response.json())

    const transactionHistoryTable = document.getElementById('transactionHistoryTable');

    for (let i = 1; i < transactionHistory.length; i++) {
        let newRow = transactionHistoryTable.insertRow();
        let slNumCell = newRow.insertCell(0);
        let itemCell = newRow.insertCell(1);
        let buyerCell = newRow.insertCell(2);
        let dateCell = newRow.insertCell(3);
        let timeCell = newRow.insertCell(4);
        let amountCell = newRow.insertCell(5);

        slNumCell.innerHTML = i + '.';
        itemCell.innerHTML = transactionHistory[i]['item_name'];
        buyerCell.innerHTML = transactionHistory[i]['buyer_name'];
        dateCell.innerHTML = transactionHistory[i]['buy_date'];
        timeCell.innerHTML = transactionHistory[i]['buy_time'];
        if (transactionHistory[i]['type'] == 'loss'){
            amountCell.innerHTML = '-' + transactionHistory[i]['item_price']
            amountCell.style.color = "red"
        } else {
            amountCell.innerHTML = '+' + transactionHistory[i]['item_price']
            amountCell.style.color = "green"
        }
        
    }
})