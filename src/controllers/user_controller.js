/* eslint-disable consistent-return */
import User from '../models/user_model';

export async function createUser(userInfo) {
  try {
    const user = new User({
      name: userInfo.name,
      username: userInfo.username,
      email: userInfo.email,
      password: userInfo.password,
    });

    await user.save();
    return user;
  } catch (error) {
    throw new Error(`Error creating user: ${error}`);
  }
}

export async function deleteUser(userId) {
  try {
    const result = await User.findByIdAndDelete(userId);
    return result;
  } catch (error) {
    throw new Error(`Error deleting user: ${error}`);
  }
}

export async function loginUser(userInfo) {
  try {
    const user = await User.findOne({ email: userInfo.email });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await user.comparePassword(userInfo.password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    return { user };
  } catch (error) {
    throw new Error(`Login user error: ${error.message}`);
  }
}

export async function getUserById(req, res) {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    return res.status(200).json(user);
  } catch (error) {
    return res
      .status(500)
      .json({ error: `Error retrieving user: ${error.message}` });
  }
}

export async function getUserById2(userId) {
  try {
    const result = await User.findById(userId);
    return result;
  } catch (error) {
    throw new Error(`Error getting user: ${error}`);
  }
}

export async function getUsers(req, res) {
  try {
    const users = await User.find();
    return users;
  } catch (error) {
    throw new Error(`Error retrieving users. ${error}`);
  }
}

export const getAllUsersWithBooks = async () => {
  try {
    const users = await User.find().populate('uploadedBooks');
    return users.map((user) => { return user.uploadedBooks; }).flat(); // Return the data
  } catch (error) {
    console.error('Failed to retrieve all users with books:', error);
    throw new Error('Failed to retrieve all users with books.'); // Throw an error to be caught by the route
  }
};

// Trade controllers:

// Send a new trade request
export async function sendTradeRequest(req, res) {
  try {
    const userId = req.params.id; // ID of the sender
    const { receiverId, senderWants, senderGives } = req.body;

    const sender = await User.findById(userId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({ error: 'Sender or receiver not found.' });
    }

    // Create the trade request
    const tradeRequest = {
      status: 'pending',
      senderID: sender._id,
      senderWants,
      senderGives,
      receiverID: receiver._id,
    };

    // Add to sender's and receiver's trade requests
    sender.sentTradeRequests.push(tradeRequest);
    receiver.receivedTradeRequests.push(tradeRequest);

    // Save changes to the database
    await sender.save();
    await receiver.save();

    return tradeRequest;
  } catch (error) {
    throw new Error('Failed to send trade request.');
  }
}

// Get all trade requests for a user
export async function getTradeRequests(req, res) {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate('sentTradeRequests.receiverID sentTradeRequests.senderWants sentTradeRequests.senderGives receivedTradeRequests.senderID receivedTradeRequests.senderWants receivedTradeRequests.senderGives');

    if (!user) {
      throw new Error('User not found.');
    }

    // Organize trade requests to send back
    const tradeRequests = {
      sentRequests: user.sentTradeRequests,
      receivedRequests: user.receivedTradeRequests,
    };

    return tradeRequests;
  } catch (error) {
    throw new Error('Failed to get trade request.');
  }
}

// Update a trade request's status
export async function updateTradeRequest(req, res) {
  try {
    const { userId, tradeId } = req.params;
    const { newStatus } = req.body; // New status: 'accepted' or 'rejected'

    if (!['accepted', 'rejected'].includes(newStatus)) {
      throw new Error(
        'Invalid status. Only \'accepted\' or \'rejected\' allowed.',
      );
    }

    // Fetch the receiver and their trade requests
    const receiver = await User.findById(userId).populate({
      path: 'receivedTradeRequests',
      match: { _id: tradeId },
    });

    if (!receiver || !receiver.receivedTradeRequests.length) {
      throw new Error('Trade request not found or receiver not found.');
    }

    const tradeRequest = receiver.receivedTradeRequests.find(
      (request) => request._id.toString() === tradeId
    );
    if (!tradeRequest) {
      throw new Error("Trade request not found for receiver.");
    }

    // Find the corresponding trade request on the sender's side using details from the receiver's trade request
    const sender = await User.findById(tradeRequest.senderID).populate({
      path: 'sentTradeRequests',
      match: {
        receiverID: userId,
        senderWants: tradeRequest.senderWants,
        senderGives: tradeRequest.senderGives,
      },
    });
    if (!sender || !sender.sentTradeRequests.length) {
      throw new Error(
        'Matching trade request not found on sender\'s side.',
      );
    }

    const senderTradeRequest = sender.sentTradeRequests.find(
      (request) =>
        request.receiverID.toString() === userId &&
        request.senderWants.toString() ===
          tradeRequest.senderWants.toString() &&
        request.senderGives.toString() === tradeRequest.senderGives.toString()
    );
    if (!senderTradeRequest) {
      throw new Error("Matching trade request not found on sender's side.");
    }

    // Update both trade requests
    tradeRequest.status = newStatus;
    senderTradeRequest.status = newStatus;

    // Save changes
    await receiver.save();
    await sender.save();

    return tradeRequest;
  } catch (error) {
    throw new Error('Failed to get update trade.');
  }
}
