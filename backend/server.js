const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors')
require("dotenv").config()


const app = express();
const port = 3000;

app.use(cors())
app.use(express.json())

const uri = process.env.CONNECTION_STRING

const client = new MongoClient(uri);

const peopleDb = client.db('People');
const peopleInfo = peopleDb.collection('PeopleTypes');
const loginInfo = peopleDb.collection('Login_Info');

const classDb = client.db('Attendance');
const classes = classDb.collection('Classes');
const students = classDb.collection('Students');
const teachers = classDb.collection('Teachers');

const libraryDb = client.db('Library');
const books = libraryDb.collection('Books');
const borrowHistory = libraryDb.collection('Borrow_History');

const shopDb = client.db('Shop');
const items = shopDb.collection('Items');
const transactionHistory = shopDb.collection('Transaction_History');

app.get('/data', async (req, res) => {
    const db = client.db("People");
    const collection = db.collection("PeopleTypes");
    const data = await collection.find().toArray();
    res.json(data);
});

app.post('/loginInfo', async(req, res) => {
    const payload = req.body;

    let credentials = await loginInfo.findOne(payload);

    if (credentials){
        res.json(credentials);
    }
    else
        res.json(null)
})

app.post('/person', async(req, res) => {
    const payload = req.body;
    const person = await peopleInfo.findOne(payload);
    res.json(person);
})

app.post('/people', async(req, res) => {
    const payload = req.body;
    const people = await peopleInfo.find(payload).toArray();
    res.json(people);
})

app.post('/studentAttendanceInfo', async(req, res) => {
    const payload = req.body;
    const allClassRecords = await classes.find({teacher_id: payload['teacherId']}).toArray();
    const teacherInfo = await peopleInfo.findOne({_id: payload['teacherId']});
    const teacherName = teacherInfo['name'];
    result = [];

    let totalClasses = 0;
    let attendedClasses = 0;
    for (let i = 0; i < allClassRecords.length; i++){
        totalClasses++;
        let status = "Absent";
        if (allClassRecords[i]['attending_students'].includes(payload['studentId'])){
            attendedClasses++;
            status = "Present";
        }

        const record = {
            sl_num: totalClasses,
            teacher_name: teacherName,
            date: allClassRecords[i]['date'],
            start_time: allClassRecords[i]['class_start_time'],
            end_time: allClassRecords[i]['class_end_time'],
            status: status
        };
        result.push(record)
    }
    if (allClassRecords.length > 0){
        attendancePercentage = attendedClasses * 100 / totalClasses;
        result.push(attendancePercentage);
    }
    res.json(result);
})

app.post('/teacherClassInfo', async(req, res) => {
    let payload = req.body;
    result = [];
    const allClassRecords = await classes.find(payload).toArray();
    const allStudentsInfo = await peopleInfo.find({type: "student"}).toArray();
    const totalNumberOfStudents = allStudentsInfo.length;
    
    for (let i = 0; i < allClassRecords.length; i++) {
        let count;
        if (allClassRecords[i]['attending_students'].length == 1 && allClassRecords[i]['attending_students'].includes("None"))
            count = 0;
        else
            count = allClassRecords[i]['attending_students'].length

        attendees_count = count + '/' + totalNumberOfStudents;
        let record = {
            class_number: allClassRecords[i]['class_number'],
            date: allClassRecords[i]['date'],
            start_time: allClassRecords[i]['class_start_time'],
            end_time: allClassRecords[i]['class_end_time'],
            attendees_count: attendees_count
        }
        result.push(record);
    }

    res.json(result);
})

app.post('/classAttendanceInfo', async(req, res) => {
    const payload = req.body;
    result = [];
    const allStudentsInfo = await peopleInfo.find({type: "student"}).toArray();
    let allStudentIds = [];
    for (let i = 0; i < allStudentsInfo.length; i++){
        allStudentIds.push(allStudentsInfo[i]['_id']);
    }
    const classRecord = await classes.findOne(payload);
    let attendeesCount = 0;

    for (let i = 0; i < allStudentIds.length; i++) {
        let studentInfo = await peopleInfo.findOne({_id: allStudentIds[i]});
        let studentName = studentInfo['name'];
        let status;

        if (classRecord['attending_students'].includes(allStudentIds[i])){
            attendeesCount++;
            status = "Present";
        } else
            status = "Absent";
        
        record = {
            student_id: allStudentIds[i],
            name: studentName,
            status: status
        }

        result.push(record);
    }
    let metadata = {
        attendeesCount: attendeesCount + '/' + allStudentIds.length,
        date: classRecord['date'],
        start_time: classRecord['class_start_time'],
        end_time: classRecord['class_end_time']
    };
    result.push(metadata);

    res.json(result);
})

app.post('/classInfo', async(req, res) => {
    const payload = req.body;
    const result = await classes.findOne(payload);
    res.json(result);
})

app.post('/updateStudentAttendance', async(req, res) => {
    const payload = req.body;
    const filter = {
        teacher_id:payload['teacher_id'],
        class_number:payload['class_number']
    }
    const update = {
        $set: {
            attending_students: payload['attending_students']
        }
    }

    const result = await classes.updateOne(filter, update, {})

    res.json(result);
})

app.post('/transactionHistory', async(req, res) => {
    const payload = req.body;
    const allTransactions = await transactionHistory.find(payload).toArray();

    res.json(allTransactions);
})

app.post('/bookBorrowHistory', async(req, res) => {
    const payload = req.body;
    const allBorrowHistory = await borrowHistory.find(payload).toArray();

    res.json(allBorrowHistory);
})

app.post('/makeTransaction', async(req, res) => {
    const payload = req.body;
    let result;
    const slNumRecord = await transactionHistory.findOne({_id : 0});
    const newSlNum = slNumRecord['prev_transaction_sl_num'] + 1;
    const updateSlNumRecord = await transactionHistory.updateOne({_id: 0}, {$inc : {prev_transaction_sl_num: 1}});
    const updateBalanceAmount = (payload['type'] == 'loss') ? 0 - payload['item_price'] : 0 + payload['item_price'];
    const updateUserBalance = await peopleInfo.updateOne(
        {_id: payload['buyer_id']},
        {$inc : {
            balance: parseInt(updateBalanceAmount)
            }
        }, {upsert:true}
    )

    if (updateUserBalance){
        const addToTransactionHistory = await transactionHistory.updateOne(
            {_id: newSlNum},
            {$set : {
                _id:newSlNum,
                buy_date:payload['buy_date'],
                buy_time:payload['buy_time'],
                buyer_id:payload['buyer_id'],
                buyer_name:payload['buyer_name'],
                item_id:payload['item_id'],
                item_name:payload['item_name'],
                item_price:payload['item_price'],
                sl_num:newSlNum,
                type:payload['type']
            }},
            {upsert:true}
        )
        result = true;
    }
    else{
        res.json(null)
    }
    
    res.json(result);
})

app.post('/changeCredentials', async(req, res) => {
    const payload = req.body;
    const updateCred = await loginInfo.updateOne(
        {_id: payload['_id']},
        {$set : {
            access_key: payload['access_key'],
            access_id: payload['access_id']
        }}, {}
    )
    console.log(payload);
    console.log(updateCred);
    res.json(updateCred);
})

app.post('/setTransactionLimit', async(req, res) => {
    const payload = req.body;
    const updateCred = await peopleInfo.updateOne(
        {_id: payload['_id']},
        {$set : {
            transaction_limit: payload['transaction_limit']
        }}, {}
    )

    res.json(updateCred);
})

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
