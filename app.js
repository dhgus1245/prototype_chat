// 소캣 생성
const express = require("express")
const http = require("http")
const app = express();
const path = require("path")
const server = http.createServer(app);
const socketIO = require("socket.io");
const moment = require("moment");
const schedule = require('node-schedule');
const async = require("async");
const jquery = require("jquery");

// 리스트 생성
var chatList = new Array();
const io = socketIO(server);
const fs = require("fs");
const savePath = "C:/node_download/"
var folderDir = "";
var count = 1;

//mysql 연동
// =============================== MYSQL ==================================
const connetMysql = require('./mysql');

// =============================== URL ==================================
app.use(express.static(path.join(__dirname, "src")))

app.get('/main', (req, res) => {
    res.sendFile(__dirname + "/src/views/chat_list.html");
});

app.get('/main/chat', (req, res) => {
    res.sendFile(__dirname + "/src/views/chat_detail.html");
});

// =============================== SOCKET ==================================
io.on("connection", (socket) => {
    socket.on("chat_list", (data) => {
        
        var p1 = new Promise(function(resolve, reject) {
            connetMysql.dbTest()
            // my function here
          });
          
          p1.then(function(result){
            // my result(resolve)
            io.emit("chat_list", result);
          }).catch(function(err) {//reject
            console.error("chat_list error : "+ err); // Error 출력
          });;
    })

   
    
    socket.on("chatting", (data) => {
        const{ name, msg } = data;
        const time =  moment(new Date()).format("h:mm A");
       
        var chatData = new Object();
        chatData.name = name;
        chatData.msg = msg;
        chatData.time = time;
        chatList.push(chatData);
        console.log(chatList);
       
        io.emit("chatting", {
            name,
            msg,
            time: time
        });

        //json 저장
        if(chatList.length == 10){
            folderDir = savePath + moment(new Date()).format("YYYYMMDD_mm");
            console.log(folderDir);
            if(!fs.existsSync(folderDir)){
                fs.mkdirSync(folderDir);
            }
            fs.writeFile(folderDir+'/'+name+'_'+count+'.json', chatList.toString() ,'utf8', function(error, data){
                if (error) {throw error};
                console.log("ASync Write Complete");
            });
            chatList = new Array();
            count++;
        }
    })

    socket.on("chat_list", (data) => {
        
        var p1 = new Promise(function(resolve, reject) {
            resolve(connetMysql.dbTest());
            console.log("q");
            // my function here
          });
          
          p1.then(function(result){
            // my result(resolve)
            io.emit("chat_list", result);
          }).catch(function(err) {//reject
            console.error("chat_list error : "+ err); // Error 출력
          });;
    })

})

// =============================== PORT, SERVER ==================================
const PORT = process.env.PORT || 5000;
server.listen(PORT, ()=>console.log('server is running and port '+PORT))