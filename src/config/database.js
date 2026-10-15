const mongoose = require("mongoose");

const connectDB = async () => {
    await mongoose.connect(
        "mongodb+srv://jitendras22672_db_user:O9fczTgbdFp44IiC@cluster-new.8s6dl5c.mongodb.net/devTinder"
    );
};

module.exports = connectDB;