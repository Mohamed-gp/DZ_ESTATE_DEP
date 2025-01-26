import PropertySaleType from "@/components/propertySaleType/PropertySaleType";
import CategoriesAndFilterContainer from "@/components/categoriesAndFilterProperties/CategoriesAndFilterContainer";
import PropertiesAndMapContainer from "@/components/propertiesAndMapContainer/PropertiesAndMapContainer";

const Page = () => {
  return (
    <>
      <PropertySaleType />
      <CategoriesAndFilterContainer />
      <PropertiesAndMapContainer />
    </>
  );
};

export default Page;
