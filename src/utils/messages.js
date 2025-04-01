export const generateMessage = (text,username = 'Admin') =>{
    return {
        text,
        username,
        createdAt : new Date().getTime()
    }
}


export const generateLocationMessage = (location,username = 'Admin') =>{
    return {
        location,
        username,
        createdAt: new Date().getTime()
    }
}

