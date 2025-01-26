"use client";
import { MapPin } from "lucide-react";
import {
  LayerGroup,
  LayersControl,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
import "leaflet-defaulticon-compatibility";
import React, { useState } from "react";

interface AddLocationInputProps {
  dataToSubmit: any;
  setDataToSubmit: any;
  inputLabel: string;
}
const AddLocationInput = ({
  dataToSubmit,
  setDataToSubmit,
}: AddLocationInputProps) => {
  const [isMapOpen, setIsMapOpen] = useState(false);

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        setDataToSubmit({
          ...dataToSubmit,
          latitude: e.latlng.lat,
          longitude: e.latlng.lng,
        });
      },
    });
    return null;
  };

  return (
    <>
      <div className="space-y-6 rounded-lg bg-gray-50 p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <MapPin className="h-5 w-5 text-blue-600" />
          Langitude && Longitude
        </h2>

        <div className="grid grid-cols-1 gap-6">
          {/* Property Type */}
          <div className="space-y-2">
            <div
              onClick={() => setIsMapOpen(true)}
              className={`w-full rounded-lg border border-gray-300 bg-white p-3 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500`}
            >
              <p className="w-full cursor-pointer rounded-md px-3 py-2.5 text-center text-xs focus:outline-none">
                {isMapOpen
                  ? `latitude: ${dataToSubmit.latitude.toFixed(2)} longitude : ${dataToSubmit.longitude.toFixed(2)}`
                  : "Add The Location Of Your House"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {isMapOpen && (
        <MapContainer
          className="z-[500] mx-auto"
          style={{ width: "500px", height: "300px" }}
          zoom={10}
          maxBounds={[
            [-90, -18000],
            [90, 18000],
          ]}
          minZoom={2}
          center={[dataToSubmit.latitude, dataToSubmit.longitude]}
          scrollWheelZoom={false}
        >
          <MapClickHandler />

          {/* add google map tile url  */}
          <LayersControl>
            <LayersControl.BaseLayer checked name="Google Map">
              <TileLayer
                attribution="Google Maps"
                url="https://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}"
              />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Google Map Satellite">
              <LayerGroup>
                <TileLayer
                  attribution="Google Maps Satellite"
                  url="https://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}"
                />
                <TileLayer url="https://www.google.cn/maps/vt?lyrs=y@189&gl=cn&x={x}&y={y}&z={z}" />
              </LayerGroup>
            </LayersControl.BaseLayer>
          </LayersControl>

          <Marker position={[dataToSubmit.latitude, dataToSubmit.longitude]}>
            <Popup>This is the location of your house.</Popup>
          </Marker>
        </MapContainer>
      )}
    </>
  );
};

export default AddLocationInput;
