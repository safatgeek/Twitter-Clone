import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {

  const { page = 1, limit = 10 } = req.query 

  const skip = (page - 1) * limit

  const userId = req.user._id;


  try {
    const notifications = await Notification.find({ to: userId })
    .skip(skip)
    .limit(parseInt(limit))
    .sort({createdAt: -1})
    .populate({
      path: "from",
      select: "username profileImg",
    })

    const notificationsIds = notifications.map((notification) => notification._id)

    const totalNotifications = await Notification.countDocuments({ to: userId })
    
    await Notification.updateMany(
      { _id: { $in : notificationsIds } },
      { read: true}
    )

    return res.status(200).json({
      notifications,
      currentPage: page,
      totalPages: Math.ceil(totalNotifications / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in getNotifications controller: ", error);
  }
};


export const deleteNotifications = async (req, res) => {
  try {
    const userId = req.user._id

    await Notification.deleteMany({ to: userId })

    res.status(200).json({ message: "Notifications deleted successfully"})

  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in deleteNotifications controller: ", error);
  }
}

// export const deleteNotification = async (req, res) => {
//   try {
//     const notificationId = req.params.id
//     const userId = req.user._id
//     const notification = await Notification.findById(notificationId)

//     if(!notification) {
//       return res.status(404).json({ error: "Notification not found" })
//     }

//     if(notification.to.toString() !== userId.toString()) {
//       return res.status(403).json({ error: "Your are not allowed to delete this notification" })
//     }

//     await Notification.findByIdAndDelete(notificationId)

//     res.status(200).json({ message: "Notification deleted successfully" })
    

//   } catch (error) {
//     res.status(500).json({ error: error.message });
//     console.log("Error in deleteNotification controller: ", error);
//   }
// }