const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
Query: {
    me: async (parent, args, context) => {
        if (context.user) {
          const userData = await User.findOne({ _id: context.user._id })
            .select('-__v -password')
            .populate('savedBooks');
      
          return userData;
        }
      
        throw new AuthenticationError('Please login');
      },
},

Mutation: {
    addUser: async (parent, args) => {
        const user = await User.create(args);
        const token = signToken(user);

        return { token, user };
    },
    login: async (parent, { email, password }) => {
        const user = await User.findOne({ email });

        if (!user) {
            throw new AuthenticationError('Incorrect email');
        }
        
        const correctPassword = await user.isCorrectPassword(password);

        if (!correctPassword) {
            throw new AuthenticationError('Incorrect password');
        }

        const token = signToken(user);
        return { token, user };
    },
    saveBook: async (parent, args, context) => {
        if (context.user) {
            const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $addToSet: { savedBooks: args.input } },
                { new: true }
            ).populate('savedBooks');

            return updatedUser;
        }
        throw new AuthenticationError('Please login');
    },
    removeBook: async (parent, args, context) => {
        if (context.user) {
            const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $pull: { savedBooks:{ bookId: args.bookId } } },
                { new: true }
            ).populate('savedBooks');

            return updatedUser;
        }
        throw new AuthenticationError('Please login');
    }
}
};

module.exports = resolvers;