require('dotenv').config({path: './.env'});
const mongoose = require('mongoose');
const { createAssignment } = require('./src/controllers/assignmentController');

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/EduVers');
  
  const req = {
    user: {
      id: "69b8338a047c5001dc7adbcf",
      tenantId: "69b82f0890cd66999363ba6e",
      organization_id: "69b82f0890cd66999363ba6e"
    },
    body: {
      title: "Test Assignment!!!",
      description: "Test",
      courseId: "69bac606691760c8190e9f02",
      assignmentType: "homework",
      maxPoints: 100,
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      submissionType: "text"
    }
  };
  
  const res = {
    status: (code) => {
        console.log('Status', code);
        return { json: (data) => console.log('Response:', code, data) }
    }
  };
  
  await createAssignment(req, res);
  process.exit(0);
}
run().catch(console.error);
