"use strict"
const socket = io();
const chatList = document.querySelector("#chatList");
//url parameter
const url_string = document.URL;
const url = new URL(url_string);
const nickname = url.searchParams.get("nickname");
document.querySelector("#nickname").value = nickname;

//socket 보냄
const param = {
    name: nickname
}
socket.emit("chat_list", param);

// ============================================

socket.on("chat_list", (data) => {
    const chatRList = data;
    const item = new tbodyModel(chatRList);
    item.makeLi();
    // displayContainer.scrollTo(0, displayContainer.scrollHeight)
})

function tbodyModel(chatRList){
    this.makeLi = ()=>{
        const tr = document.createElement("tr");
        var list = "";
        for (let index = 0; index < chatRList.length; index++) {
            list +=   
            `
            <th scope="row">${index+1}</th>
            <td>${chatRList[index].last_comm}</td>
            <td><button onclick="goChat(${index+1})">입장</button></td>
            `
        }
        tr.innerHTML = list;
        chatList.appendChild(tr);    
    }
}
