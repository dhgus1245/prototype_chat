"uset strict"

const socket = io();

const url_string = document.URL;
const url = new URL(url_string);
const nickname = url.searchParams.get("nickname");
document.querySelector("#nickname").value = nickname;

const chatList = document.querySelector(".chatting-list")
const chatInput = document.querySelector(".chatting-input");
const sendButton = document.querySelector(".send-button");
const historyButton = document.querySelector("#getHistory");
const displayContainer = document.querySelector(".display-container");

sendButton.addEventListener("click", () => {
    const param = {
        name: 'asfha_1',
        root: "20211102_56"
    }
    socket.emit("history", param);
})

historyButton.addEventListener("click", () => {
    const param = {
        name: nickname,
        msg: chatInput.value
    }
    socket.emit("history", param);
    chatInput.value="";
})


socket.on("chatting", (data) => {
    const {name, msg, time} = data;
    const item = new liModel(name, msg, time);
    item.makeLi();
    displayContainer.scrollTo(0, displayContainer.scrollHeight)
})

function liModel(name, msg, time){
    this.name = name;
    this.msg = msg;
    this.time = time;

    this.makeLi = ()=>{
        const li = document.createElement("li");
        li.classList.add(nickname === this.name ? "sent" : "receive");
        const img = (nickname === this.name ? "https://mblogthumb-phinf.pstatic.net/MjAyMDAyMDdfMTYw/MDAxNTgxMDg1NzUxMTUy.eV1iEw2gk2wt_YqPWe5F7SroOCkXJy2KFwmTDNzM0GQg.Z3Kd5MrDh07j86Vlb2OhAtcw0oVmGCMXtTDjoHyem9og.JPEG.7wayjeju/%EB%B0%B0%EC%9A%B0%ED%94%84%EB%A1%9C%ED%95%84%EC%82%AC%EC%A7%84_IMG7117.jpg?type=w800" : "https://img.sbs.co.kr/newsnet/etv/upload/2021/07/08/30000699784.jpg");
        const dom = `<span class="profile">
                        <span class="user">${this.name}</span>
                        <img src="`+img+`" 
                            class="image" alt="any">
                    </span>
                    <span class="message">${this.msg}</span>
                    <span class="time">${this.time}</span>`;

        li.innerHTML = dom;
        chatList.appendChild(li);
    }
}