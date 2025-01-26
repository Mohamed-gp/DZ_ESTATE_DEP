import Map from "../map/Map";
import Properties from "../properties/Properties";

const PropertiesAndMapContainer = () => {
  return (
    <section className="container mb-24 flex   justify-between sm:flex-row flex-col-reverse items-center sm:items-start gap-12 lg:flex-wrap xl:flex-nowrap">
      <Properties />
      <Map />
    </section>
  );
};
export default PropertiesAndMapContainer;
