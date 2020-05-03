import bcrypt from "bcryptjs";
import User from "../models/User";
import jwt from "jsonwebtoken";

const authResolvers = {
  Query: {
    users: (obj, args, context, info) => {
      User.all();
      return User.find();
    },
    user: (obj, { id }, context, info) => {
      db.user.find(user => user.id === id);
      return Users.find();
    }
  },
  Mutation: {
    createUser: async args => {
      try {
        const exsistingUser = await User.findOne({
          email: args.userInput.email
        });
        if (exsistingUser) {
          throw new Error("User exists already.");
        }
        const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
        const user = new User({
          email: args.userInput.email,
          password: hashedPassword
        });
        const result = await user.save();
        return { ...result._doc, password: null, _id: result.id };
      } catch (err) {
        throw err;
      }
    },
    login: async ({ email, password }) => {
      const user = await User.findOne({ email: email });
      if (!user) {
        throw new Error("user doesnot exsist!");
      }
      const isEqual = await bcrypt.compare(password, user.password);
      if (!isEqual) {
        throw new Error("password is incorrect!");
      }
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        "somesupersecretkey",
        { expiresIn: "1h" }
      );
      return { userId: user.id, token: token, tokenExpiration: 1 };
    }
  }
};

export default authResolvers;
