const UserTutorial = require('../Models/UserTutorialModel');

/*
Get tutorials viewed by a user
*/
module.exports.getUserTutorials = async (req, res) => {
  try {
    const userTutorials = await UserTutorial.findOne({ username: req.params.username }).populate('tutorialsViewed');
    res.json(userTutorials);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user tutorials' });
  }
};

/*
Mark a tutorial as viewed by a user
*/
module.exports.markTutorialAsViewed = async (req, res) => {
  try {
    const { tutorialId } = req.body;
    let userTutorials = await UserTutorial.findOne({ username: req.params.username });

    if (!userTutorials) {
      userTutorials = new UserTutorial({ username: req.params.username, tutorialsViewed: [tutorialId] });
    } else {
      if (!userTutorials.tutorialsViewed.includes(tutorialId)) {
        userTutorials.tutorialsViewed.push(tutorialId);
      }
    }

    await userTutorials.save();
    res.json(userTutorials);
  } catch (error) {
    res.status(500).json({ error: 'Error updating user tutorials' });
  }
};
