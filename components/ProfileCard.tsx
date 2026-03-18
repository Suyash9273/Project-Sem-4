
import React from "react";
interface ProfileProps {
    name: string;
    desc: string;
    imgName: string;
}

const ProfileCard = ({name, desc, imgName}: ProfileProps) => {
  return (
    <div className="w-sm p-4 bg-cyan-100 border-4 border-black rounded-md shadow-[8px_8px_0px_0px_black] hover:shadow-[12px_12px_0px_0px_black] transition-shadow duration-150 ease-in-out">
      <img
        src={`./${imgName}.png`}
        alt="Profile Avatar"
        className="w-24 h-24 rounded-full mx-auto border-4 border-black mb-4"
      />
      <div className="p-4 text-center">
        <h3 className="text-2xl font-mono font-bold mb-2 text-black">
          {name}
        </h3>
        <p className="text-black mb-4">
          {desc}
        </p>
        <button className="px-4 py-2 font-mono text-white bg-green-500 border-2 border-black shadow-[4px_4px_0px_0px_black] hover:shadow-[6px_6px_0px_0px_black] transition-all duration-150 ease-in-out">
          Follow
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;
  