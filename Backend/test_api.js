const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const url = process.env.MONGO_URI;

mongoose.connect(url).then(async () => {
    const student = await mongoose.connection.db.collection('users').findOne({ email: 'jems007@gmail.com' });
    
    const token = jwt.sign(
      { 
        id: student._id.toString(), 
        userType: 'student',
        tenantId: student.currentOrganization ? student.currentOrganization.toString() : student.tenant_id.toString()
      },
      process.env.JWT_SECRET,
      { expiresIn: "10h" }
    );

    try {
        const res = await fetch("http://127.0.0.1:5000/Material/course/69bad04bd7f170c6c42769e9", {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        console.log("API STATUS:", res.status);
        console.log("RESPONSE DATA:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("ERROR:", e);
    }
    
    process.exit(0);
}).catch(console.error);
