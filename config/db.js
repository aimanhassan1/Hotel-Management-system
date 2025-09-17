const mongoose = require("mongoose")
try {
connectDb = async()=>{
await mongoose.connect("mongodb+srv://aiman:1234@aimancluster.mpfs2nm.mongodb.net/hotel_management?retryWrites=true&w=majority&appName=AimanCluster")
console.log("Database Connected");
}
} catch (error) {
console.log("Database Connection Failed")
}
module.exports = connectDb;