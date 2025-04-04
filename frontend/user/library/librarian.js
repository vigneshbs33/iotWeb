const header = { "Content-Type": "application/json"}

document.addEventListener('DOMContentLoaded', async () => {
    const borrwedTable = document.getElementById('borrowedTable');
    const returnedTable = document.getElementById('returnedTable');
    let borrowedCount = 0;
    let returnedCount = 0;

    payload = {}
    const allBorrowHistory = await fetch("http://localhost:3000/bookBorrowHistory", {
        method : "POST",
        headers: header,
        body: JSON.stringify(payload)
    }).then(response => response.json())
    
    for (let i = 1; i < allBorrowHistory.length; i++) {
        if (allBorrowHistory[i]['status'] == 'borrowed') {
            borrowedCount++;
            let newRow = borrwedTable.insertRow();
            let slNumCell = newRow.insertCell(0);
            let titleCell = newRow.insertCell(1);
            let borrowerCell = newRow.insertCell(2);
            let borrowDateCell = newRow.insertCell(3);
            let dueDateCell = newRow.insertCell(4);

            slNumCell.innerHTML = i + '.';
            titleCell.innerHTML = allBorrowHistory[i]['title'];
            borrowerCell.innerHTML = allBorrowHistory[i]['borrower_name'];
            borrowDateCell.innerHTML = allBorrowHistory[i]['borrow_date'];
            dueDateCell.innerHTML = allBorrowHistory[i]['return_due_date'];
        }
        else {
            returnedCount++;
            let newRow = returnedTable.insertRow();
            let slNumCell = newRow.insertCell(0);
            let titleCell = newRow.insertCell(1);
            let borrowerCell = newRow.insertCell(2);
            let borrowDateCell = newRow.insertCell(3);
            let returnDateCell = newRow.insertCell(4);
            let finePaidCell = newRow.insertCell(5);

            slNumCell.innerHTML = i + '.';
            titleCell.innerHTML = allBorrowHistory[i]['title'];
            borrowerCell.innerHTML = allBorrowHistory[i]['borrower_name'];
            borrowDateCell.innerHTML = allBorrowHistory[i]['borrow_date'];
            returnDateCell.innerHTML = allBorrowHistory[i]['returned_date'];
            finePaidCell.innerHTML = allBorrowHistory[i]['late_fee_payed'] + ' Rs'
            
            if (allBorrowHistory[i]['late_fee_payed'] == 0)
                finePaidCell.style.color = 'green';
            else
                finePaidCell.style.color = 'red';
        }
    }

    if (returnedCount == 0){
        document.getElementById('returnedHeading').innerHTML = "";
        returnedTable.innerHTML = "";
    }
    if (borrowedCount == 0){
        document.getElementById('borrowedHeading').innerHTML = "";
        borrwedTable.innerHTML = "";
    }
})