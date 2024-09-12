import User from "../models/user.model.js"

export const searchUsers = async (req, res) => {
    try {
        const { queryData } = req.query

        const { page = 1, limit = 10 } = req.query;

        const skip = (page - 1) * limit

        if (!queryData) {
            return res.status(400).json({ error: "Query Data is required"})
        }

        const totalMatchedusers = await User.countDocuments({
            $or: [
                { username: { $regex: queryData, $options: "i" } },
                { email: { $regex: queryData, $options: "i" } }
            ]
        })

        const users = await User.find({
            $or: [
                { username: { $regex: queryData, $options: "i" } },
                { email: { $regex: queryData, $options: "i" } }
            ]
        })
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: 1 })
        .select("-password")
   

        return res.status(200).json({
            users,
            currentpage: page,
            totalpages: Math.ceil(totalMatchedusers / limit)
        })
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log("Error in the searchUsers controller")
        
    }
}
