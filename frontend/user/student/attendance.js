import 'url';
const header = { "Content-Type": "application/json"}
let payload = {type: 'teacher'}
const allTeachers = await fetch("http://localhost:3000/people", {
	method : "POST",
	headers: header,
	body: JSON.stringify(payload)
}).then(response => response.json())
let allTeacherIds = []
for (let i = 0; i < allTeachers.length; i++){
	allTeacherIds.push(allTeachers[i]['_id']);
}

const main = async () => {
	var table = document.getElementById("studentTable");
	var percentageTable = document.getElementById("attendancePercentage");

	// document.getElementById("greeting").innerHTML = "Hello, " + sessionStorage.getItem('username') + "!";
	
 	for (let i = 0; i < allTeacherIds.length; i++){
		payload = {studentId: sessionStorage.getItem('user_id'), teacherId: allTeacherIds[i]}
    	const classInfo = await fetch("http://localhost:3000/studentAttendanceInfo", {
        	method : "POST",
        	headers: header,
        	body: JSON.stringify(payload)
    	}).then(response => response.json())

		if (classInfo.length == 0)
			continue;

		let row = percentageTable.insertRow();
		let teacherName = row.insertCell(0);
		let percent = row.insertCell(1);
		row.style.textAlign = "center"
		teacherName.style.textAlign = "center";
		percent.style.textAlign = "center";
		if (classInfo[0]['teacher_name'] == 'Priya N V')
			teacherName.innerHTML = 'Math';
		else if (classInfo[0]['teacher_name'] == 'Shilpa T')
			teacherName.innerHTML = 'IPP';
		else
			teacherName.innerHTML = classInfo[0]['teacher_name'];
		percent.innerHTML = classInfo[classInfo.length-1].toFixed(2) + "%";

		for (let j = 0; j < classInfo.length - 1; j++) {

			let newRow = table.insertRow();
			let slNumCell = newRow.insertCell(0);
			let teacherNameCell = newRow.insertCell(1);
			let subjectCell = newRow.insertCell(2);
			let dateCell = newRow.insertCell(3);
			let classStartTimeCell = newRow.insertCell(4);
			let classEndTimeCell = newRow.insertCell(5);
			let status = newRow.insertCell(6);

			slNumCell.innerHTML = classInfo[j]['sl_num'];
			teacherNameCell.innerHTML = classInfo[j]['teacher_name'];
			if (classInfo[0]['teacher_name'] == 'Priya N V')
				subjectCell.innerHTML = 'Math';
			else if (classInfo[0]['teacher_name'] == 'Shilpa T')
				subjectCell.innerHTML = 'IPP';
			else
				subjectCell.innerHTML = classInfo[0]['teacher_name'];
			dateCell.innerHTML = classInfo[j]['date'];
			classStartTimeCell.innerHTML = classInfo[j]['start_time'];
			classEndTimeCell.innerHTML = classInfo[j]['end_time'];
			status.innerHTML = (classInfo[j]['status']);
			
			if (classInfo[j]['status'] === "Absent"){
				status.style.color = "red";
			} else {
				status.style.color = "green";							
			}
		}
	}
}

document.addEventListener("DOMContentLoaded", await main())
