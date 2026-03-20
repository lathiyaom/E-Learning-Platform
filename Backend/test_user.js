const mongoose = require('mongoose');
require('dotenv').config();
const url = process.env.MONGO_URI;

mongoose.connect(url).then(async () => {
    const students = await mongoose.connection.db.collection('users').find({ userType: 'student' }).limit(3).toArray();
    console.log("STUDENT:", JSON.stringify(students.map(s => ({ email: s.email, tenant_id: s.tenant_id, currentOrganization: s.currentOrganization })), null, 2));
    
    // Check course tenant
    const course = await mongoose.connection.db.collection('courses').findOne({ _id: new mongoose.Types.ObjectId("69bad04bd7f170c6c42769e9") });
    console.log("COURSE TENANT:", course ? course.tenantId : "Not found");
    
    // Check if req.tenantId logic matches inside tenantScope middleware
    process.exit(0);
}).catch(console.error);
