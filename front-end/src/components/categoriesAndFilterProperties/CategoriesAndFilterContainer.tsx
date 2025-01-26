import Categories from "../categories/Categories";
import PropertiesFilter from "../propertiesFilter/PropertiesFilter";

const CategoriesAndFilterContainer = () => {
  return (
    <div className="container flex my-12 items-center border-y-2 py-2">
      <Categories/>
      <PropertiesFilter />
    </div>
  );
};
export default CategoriesAndFilterContainer;
