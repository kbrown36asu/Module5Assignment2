const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
//const config = require('config');
//const { check, validationResult } = require('express-validator');
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, //ensures name is requires
        unique: true //ensures name is unique
    },
    email: {
        type: String,
        required: true,
        unique: true //ensure email is unique
    },
    password: {
        type: String,
        required: true
    },
    confirmPassword: {
        type: String,
        required: true,
        validate: {
            validator: function(el) {
                return el === this.password;
            },
            message: 'Password are not the same!'
        }

    },
    date: {
        type: Date,
        default: Date.now
    },
});

UserSchema.pre('save', async function(next) {
    if(this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
        this.confirmPassword = await bcrypt.hash(this.confirmPassword, 10);
        this.confirmPassword = undefined //so that it does not store in the database
    }
    next();
});

UserSchema.methods.generateAuthToken = async function() {
    try {
        let token = jwt.sign({_id: this._id}, process.env.TOKEN_SECRET_KEY);//config.get('jstSecret'));
        //this.tokens = this.tokens.concat({token: token});
        //await this.save();
        return token;
    } catch (error) {
        console.log(error);
    }
};
//compares password
UserSchema.methods.verifyPassword = async function(password) {
    const user = this;
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Unable to login');
    }
};

UserSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email }); //was UserSchema
    if (!user) {
        throw new Error('Unable to login');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Unable to login');
    }
    return user;
}

module.exports = mongoose.model('User', UserSchema)


// tokens: [{
//     token: {
//         type: String,
//         required: true 
//     }
// }]