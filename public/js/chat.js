const socket = io();
const $messageform = document.querySelector("#myform");
const $messageFormInput = $messageform.querySelector("input");
const $messageFormButton = $messageform.querySelector("button");
const $messageLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//đây là client lắng nghe sự kiện từ socket phát ra
// socket.on('counterUpdated',(count)=>{
//     console.log(count)
// })

const { username, room } = Object.fromEntries(
  new URLSearchParams(location.search)
);

const autoscroll =()=>{
  //new message element
  const $newMessage = $messages.lastElementChild

  //height of the new message
  const newMessageStyles = getComputedStyle($newMessage)

  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin



  //visible height
  const visibleHeight = $messages.offsetHeight

  //height of message container
  const containerHeight = $messages.scrollHeight

  //how far have i scrolled
  const scrollOffset = $messages.scrollTop + visibleHeight

  if(containerHeight - newMessageHeight <= scrollOffset){
    $messages.scrollTop = $messages.scrollHeight
  }
}

socket.on('roomData',({room,users})=>{
 const html = Mustache.render(sidebarTemplate,{
  room,
  users
 })

 document.querySelector('#sidebar').innerHTML = html
 
})

socket.on("location", (url) => {
  const html = Mustache.render(locationTemplate, {
    url: url.location,
    username: url.username,
    createdAt: moment(url.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll()
});

socket.on("welcome", (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    message: message.text,
    username: message.username,
    //moment làm hàm từ thẻ scrip bên index để format datetime
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll()
});

$messageform.addEventListener("submit", (e) => {
  e.preventDefault();

  $messageFormButton.setAttribute("disabled", "disabled");

  const message = e.target.elements.message.value;

  //callback ở chỗ error chỉ được gọi khi bên kia có gọi hàm callback
  socket.emit("sendMessage", message, (error) => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
    if (error) {
      return console.log(error);
    }
  });
});

// document.querySelector('#increment').addEventListener('submit',()=>{
//     socket.emit('increment')
// })

$messageLocationButton.addEventListener("click", () => {
  $messageLocationButton.setAttribute("disabled", "disabled");

  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your broswer");
  }
  navigator.geolocation.getCurrentPosition((position) => {
    $messageLocationButton.removeAttribute("disabled");
    const { latitude, longitude } = position.coords;
    socket.emit("sendLocation", { latitude, longitude }, () => {
      console.log("location shared");
    });
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
