import Categories from "../categories/Categories";
import PropertiesFilter from "../propertiesFilter/PropertiesFilter";
import { Suspense } from "react";
const CategoriesAndFilterContainer = () => {
  return (
    <div className="container my-12 flex items-center border-y-2 py-2">
      <Suspense fallback={<div>Loading...</div>}>
        <Categories />
      </Suspense>
      <PropertiesFilter />
    </div>
  );
};
export default CategoriesAndFilterContainer;
