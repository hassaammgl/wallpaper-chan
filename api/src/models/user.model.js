import { Schema } from "mongoose";
import mongoose from "mongoose";

const userSchema = new Schema({
    displayName :{
        type:String,
       // required:true,
    },
    userName :{
        type:String,
        required:true,
    },
    email :{
        type:String,
        required:true,
    },
    img :{
        type:String,
        // required:true,
    },
    hashedPassword :{
        type:String,
        required:true,
        select: false,
    },
    refreshToken: {
        type: String,
        select: false,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
},
  {timestamps: true}


);
export default mongoose.model("User" , userSchema)