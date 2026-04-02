const mongoose=require('mongoose');
require('dotenv').config();
mongoose.connect('mongodb://127.0.0.1:27017/EduVers').then(async()=>{
  const H = mongoose.model('Holiday', new mongoose.Schema({}, {strict:false}), 'holidays');
  const d = new Date('2026-03-18T18:00:00Z'); // Teacher might create lecture with time
  const lectureDay = new Date(d);
  lectureDay.setHours(0,0,0,0);
  const lectureDayEnd = new Date(lectureDay);
  lectureDayEnd.setHours(23,59,59,999);
  const tenantId = '69b82f0890cd66999363ba6e';
  const h = await H.findOne({ 
    $and: [ 
        { $or: [{ tenantId: null }, { tenantId }] },
        { date: { $lte: lectureDayEnd } }, 
        { $or: [ 
            { endDate: { $gte: lectureDay } }, 
            { endDate: null, date: { $gte: lectureDay } } 
        ] } 
    ] 
  });
  console.log("Holiday:", h);
  process.exit();
});
