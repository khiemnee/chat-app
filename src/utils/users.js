const users = []

export const addUser = ({id,username,room})=>{

    //clean the data 
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate the data
    if(!username || !room){
        return {
            error : 'username and room are required'
        }
    }

    //check for existing user
    const existingUser = users.find((user) => user.username === username && user.room === room)

    if(existingUser){
        return {
            error :'Username is in use'
        }
    }

    //store user
    const user = {id,username,room}
    users.push(user)
    return {user}

}

export const removeUser = (id) =>{
    const index = users.findIndex((user)=>user.id === id)

    if(index !== -1){
        //hàm này để xóa phần tử ra khỏi mảng
        return users.splice(index,1)[0]
    }
}

export const getUser = (id) =>{
   return users.find((user) => user.id === id)
}


export const getUserInRoom = (room) =>{
    return users.filter((user) =>user.room === room)
}