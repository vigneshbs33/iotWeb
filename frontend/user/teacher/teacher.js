const header = { "Content-Type": "application/json"}

const main = async () => {
    const classDetailsTable = document.getElementById("classDetailsTable");
    const teacherTable = document.getElementById('attendanceDetailsTable');
    let selectedClassNum = 1;
    const selectClass = document.getElementById("class-select");

    document.getElementById("greeting").innerHTML = "Hello, " + sessionStorage.getItem('username') + "!";

    async function populateClassDetailsTable(){
        let delRowNum = classDetailsTable.rows.length - 1;
        for (let i = 0; i < delRowNum; i++) {
            classDetailsTable.deleteRow(1);
        }
        let payload = {teacher_id: sessionStorage.getItem('user_id')}
        const classData = await fetch("http://localhost:3000/teacherClassInfo", {
            method : "POST",
            headers: header,
            body: JSON.stringify(payload)
        }).then(response => response.json())

        for (let i = 0; i < classData.length; i++) {
            let row = classDetailsTable.insertRow();
            let classNumberCell = row.insertCell(0);
            let dateCell = row.insertCell(1);
            let startTimeCell = row.insertCell(2);
            let endTimeCell = row.insertCell(3);
            let attendeesCell = row.insertCell(4)
            
            classNumberCell.innerHTML = "Class " + classData[i]["class_number"];
            dateCell.innerHTML = classData[i]["date"];
            startTimeCell.innerHTML = classData[i]["start_time"];
            endTimeCell.innerHTML = classData[i]["end_time"];
            attendeesCell.innerHTML = classData[i]['attendees_count'];

            let option = document.createElement("option");
            option.text = "Class " + classData[i]["class_number"];
            option.value = i + 1;
            selectClass.add(option);
        }
    }
    await populateClassDetailsTable();

    selectClass.addEventListener("change", async function(){
        selectedClassNum = selectClass.value;
        populateAttendanceTable();
    })
    
    async function populateAttendanceTable(){
        let delRowNum = teacherTable.rows.length;
        for (let i = 0; i < delRowNum - 1; i++) {
            teacherTable.deleteRow(1);
        }

        let payload = {'teacher_id': sessionStorage.getItem('user_id'), class_number: parseInt(selectedClassNum)};
        let classData = await fetch("http://localhost:3000/classAttendanceInfo", {
            method : "POST",
            headers: header,
            body: JSON.stringify(payload)
        }).then(response => response.json());

        for (let i = 0; i < classData.length - 1; i++)
        {
            
            let row = teacherTable.insertRow();
            let nameCell = row.insertCell(0);
            let buttonCell = row.insertCell(1)

            nameCell.innerHTML = classData[i]["name"];

            if (classData[i]["status"] == "Present")
            {
                buttonCell.innerHTML = "<button class=\"absent\" id=student" + i + ">Mark Absent</button>";
                let currStudentButton = document.getElementById("student"+i);

                currStudentButton.addEventListener("click", async () => {
                    payload = {'teacher_id': sessionStorage.getItem('user_id'), class_number: parseInt(selectedClassNum)};
                    let classInfo = await fetch("http://localhost:3000/classInfo", {
                        method : "POST",
                        headers: header,
                        body: JSON.stringify(payload)
                    }).then(response => response.json());

                    let attendingStudentsSet = classInfo["attending_students"];
                    let popVal = classData[i]['student_id'];
                    attendingStudentsSet = attendingStudentsSet.filter(item => item != popVal);

                    payload = {
                        'teacher_id': sessionStorage.getItem('user_id'), 
                        class_number: parseInt(selectedClassNum),
                        attending_students: attendingStudentsSet
                    };
                    await fetch("http://localhost:3000/updateStudentAttendance", {
                        method : "POST",
                        headers: header,
                        body: JSON.stringify(payload)
                    });

                    await populateClassDetailsTable();
                    await populateAttendanceTable();
                })
            }
            else
            {
                buttonCell.innerHTML = "<button class=\"present\" id=student" + i + ">Mark Present</button>";
                let currStudentButton = document.getElementById("student"+i);
                
                currStudentButton.addEventListener("click", async () => {
                    payload = {'teacher_id': sessionStorage.getItem('user_id'), class_number: parseInt(selectedClassNum)};
                    let classInfo = await fetch("http://localhost:3000/classInfo", {
                        method : "POST",
                        headers: header,
                        body: JSON.stringify(payload)
                    }).then(response => response.json());

                    let attendingStudentsSet = classInfo["attending_students"];
                    attendingStudentsSet.push(classData[i]['student_id']);

                    payload = {
                        'teacher_id': sessionStorage.getItem('user_id'), 
                        class_number: parseInt(selectedClassNum),
                        attending_students: attendingStudentsSet
                    };
                    await fetch("http://localhost:3000/updateStudentAttendance", {
                        method : "POST",
                        headers: header,
                        body: JSON.stringify(payload)
                    });

                    await populateClassDetailsTable();
                    await populateAttendanceTable();
                })
            }
        }
        let li = classData.length - 1;
        document.getElementById("classDetails").innerHTML = "Date: " + classData[li]["date"] + 
                                                            ". Start Time: " + classData[li]["start_time"] +
                                                            ". End Time: " + classData[li]["end_time"];
        document.getElementById("attendanceDetails").innerHTML = classData[li]["attendeesCount"]+
                                                                " Attendance";
    }
    await populateAttendanceTable();
}

await main();