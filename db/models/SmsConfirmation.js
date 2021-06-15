const mongoose = require('mongoose');


const SmSchema = new mongoose.Schema({
    _userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    token: { type: Number, required: true },
    createdAt: { type: Date, required: true, default: Date.now, expires: 43200 }
});

const SmS = mongoose.model("SmS", SmSchema);
module.exports = SmS;