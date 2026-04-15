
import Link from "next/link";
import React from "react";

interface ServiceProps{
  title: string;
  desc: string;
  link: string;
}

const ServiceCard = ({title, desc, link}: ServiceProps) => {
  return (
    <div className="bg-yellow-200 border-4 border-black p-6 rounded-md shadow-[8px_8px_0px_0px_black] w-xs transform hover:shadow-[12px_12px_0px_0px_black] transition-shadow duration-200 ease-in-out">
      <h3 className="text-3xl font-mono font-bold mb-4 text-black">
        {title}
      </h3>
      <p className="text-black mb-6">
        {desc}
      </p>
      <button className="px-4 py-2 bg-black text-yellow-200 border-2 border-black font-bold shadow-[4px_4px_0px_0px_black] hover:shadow-[8px_8px_0px_0px_black] transform hover:-translate-y-1 transition-all">
        <Link href={link}>Learn More</Link>
      </button>
    </div>
  );
};

export default ServiceCard;
  