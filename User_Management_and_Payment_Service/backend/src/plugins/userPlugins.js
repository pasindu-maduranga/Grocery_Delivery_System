function hideSensitiveFields(schema){
    schema.methods.toJSON = function() {
        const user = this.toObject();
        delete user.password;
        delete user.resetPasswordToken;
        delete user.resetPasswordExpires;
        delete user.verificationToken;
        return user;
    }
}

module.exports = hideSensitiveFields;