const { Schema, model } = require('mongoose');

const Titles = Schema({
    User: String,
    Titles: String,
}, { strict: false });

module.exports = model('Titles', Titles);