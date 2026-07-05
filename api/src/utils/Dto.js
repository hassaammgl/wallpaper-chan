export class DTO {
    static userDto(user) {
        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            userName: user.userName,
            displayName: user.displayName,
            img: user.img,
        }
    }
}
