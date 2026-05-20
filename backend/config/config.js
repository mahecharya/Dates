import mongoose from "mongoose";

const connectDb = async()=>{
    try { 
        const connect = await mongoose.connect(process.env.MONGOURL)
        console.log("database connect succcessfully")
        
    } catch (error) {
        console.log(error)
    }
}
export default connectDb