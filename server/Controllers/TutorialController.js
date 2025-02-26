const Tutorials = require("../Models/TutorialModel");
  
module.exports.GetTutorials = async (req, res) => {
    const _id = req.query.id;
    if (_id) {
        try {
            console.log(_id);
            const tutorials = await Tutorials.findOne({ _id });
            console.log(tutorials);
    
            if (!tutorials) return res.status(404).json({ success: false, message: "Tutorial not found" });
    
            res.status(200).json({ success: true, tutorials });
        } catch (error) {
            res.status(500).json({ success: false, message: "Server error", error: error.message });
        }
    }
    else {
        try {
            const tutorials = await Tutorials.find();
            res.status(200).json({ success: true, tutorials });
        } catch (error) {
            res.status(500).json({ success: false, message: "Server error", error: error.message });
        }
    }
};

