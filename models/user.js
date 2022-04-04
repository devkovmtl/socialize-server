const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');
const { SALT_FACTOR } = process.env;

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      minlength: 1,
    },
    email: {
      type: String,
      required: true,
      minlength: 1,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    firstName: {
      type: String,
      minlength: 1,
    },
    lastName: {
      type: String,
      minlength: 1,
    },
    birthdate: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'superadmin', 'owner'],
      default: 'user',
    },
    registrationDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Hash the password before saving
UserSchema.pre('save', async function (next) {
  const user = this;
  // proceed only if the password is modified or the user is new
  if (!user.isModified('password')) {
    return next();
  }
  try {
    // generate a salt
    const salt = await bcrypt.genSalt(+SALT_FACTOR);
    // generate a password hash (salt + hash)
    const hash = await bcrypt.hash(user.password, salt);
    // overwrite plain text password with encrypted password
    user.password = hash;
    next();
  } catch (error) {
    next(error);
  }
});

// Compare the plain text password with the encrypted password
UserSchema.methods.matchesPassword = async function (plainTextPassword) {
  const user = this;
  const isPasswordMatch = await bcrypt.compare(
    plainTextPassword,
    user.password
  );
  return isPasswordMatch;
};

// get full name
UserSchema.virtual('fullName').get(function () {
  let fullName = '';
  if (this.firstName && this.lastName) {
    fullName = `${this.firstName} ${this.lastName}`;
  }
  return fullName;
});

module.exports = model('User', UserSchema);
