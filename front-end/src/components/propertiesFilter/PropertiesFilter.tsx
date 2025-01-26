import { IoMdOptions } from "react-icons/io";

const PropertiesFilter = () => {
  return (
    <div className="flex gap-2 items-center border-2 p-2 cursor-pointer">
      <IoMdOptions className="text-blueColor text-4xl" />
      <p className="font-bold">Filters</p>
    </div>
  );
};
export default PropertiesFilter;
