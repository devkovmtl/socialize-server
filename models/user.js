const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');
const { SALT_FACTOR } = process.env;

const UserSchema = new Schema(
  {
    avatar: {
      type: String,
    },
    username: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
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
    provider: {
      type: String,
      enum: ['local', 'google', 'facebook', 'twitter'],
      default: 'local',
    },
    facebookId: {
      type: String,
    },
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
