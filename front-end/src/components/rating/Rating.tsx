import { FaStar, FaStarHalfStroke } from "react-icons/fa6";

interface RatingProps {
  rating: number;
}

const Rating = ({ rating }: RatingProps) => {
  return (
    <div className="flex">
      {rating >= 1 ? (
        <FaStar className="text-yellow-400" />
      ) : rating >= 0.5 ? (
        <FaStarHalfStroke className="text-yellow-400" />
      ) : (
        <FaStar />
      )}
      {rating >= 2 ? (
        <FaStar className="text-yellow-400" />
      ) : rating >= 1.5 ? (
        <FaStarHalfStroke className="text-yellow-400" />
      ) : (
        <FaStar />
      )}
      {rating >= 3 ? (
        <FaStar className="text-yellow-400" />
      ) : rating >= 2.5 ? (
        <FaStarHalfStroke className="text-yellow-400" />
      ) : (
        <FaStar />
      )}
      {rating >= 4 ? (
        <FaStar className="text-yellow-400" />
      ) : rating >= 3.5 ? (
        <FaStarHalfStroke className="text-yellow-400" />
      ) : (
        <FaStar />
      )}
      {rating >= 5 ? (
        <FaStar className="text-yellow-400" />
      ) : rating >= 4.5 ? (
        <FaStarHalfStroke className="text-yellow-400" />
      ) : (
        <FaStar />
      )}
    </div>
  );
};

export default Rating;
