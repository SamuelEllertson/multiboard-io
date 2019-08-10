let constants = require("./constants.js");

Array.prototype.random = function () {
    return this[Math.floor((Math.random() * this.length))];
};

exports.debug = function (data) {
    if (constants.DEBUG) {
        console.log(data);
    }
};

exports.hit = function () {
    if (constants.DEBUG) {
        console.log("hit");
    }
};

module.exports = exports;