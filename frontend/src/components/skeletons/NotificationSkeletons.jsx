import React from "react";

const NotificationSkeletons = () => {
  return (
    <div className="flex flex-col p-4 w-full gap-4">
      <div className="skeleton h-12 w-12 shrink-0 rounded-full"></div>

      <div className="skeleton h-4 w-[24] rounded"></div>
    </div>
  );
};

export default NotificationSkeletons;
