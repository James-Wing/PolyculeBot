const { Schema, model } = require('mongoose');

const Relationships = Schema({
    User: String,
    Spouses: Array,
}, { strict: false });

module.exports = model('Relationships', Relationships);