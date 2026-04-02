const mongoose=require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/EduVers').then(async()=>{
  const H = mongoose.model('Holiday', new mongoose.Schema({}, {strict:false}), 'holidays');
  const d = new Date('2026-03-18');
  d.setHours(0,0,0,0);
  const dend = new Date(d);
  dend.setHours(23,59,59,999);
  const h = await H.findOne({ 
    $and: [ 
        { date: { $lte: dend } }, 
        { $or: [ 
            { endDate: { $gte: d } }, 
            { endDate: null, date: { $gte: d } } 
        ] } 
    ] 
  });
  console.log(h ? h.title : 'None');
  process.exit();
});
