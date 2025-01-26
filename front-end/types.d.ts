
declare global {
type user = {
    id: string ; 
    email: string ;
    username: string ;
    phoneNumber: string ;
    photo: string  ;
}

type Auth = {
    user?: user | null;
    accessToken?: string;
    
  };
}



interface PropertyLocation {
  lat: number;
  lng: number;
  address: string;
}



interface PropertyFormData {
  type: 'rent' | 'sell';
  price: number;
  unit :'day' | 'month' | 'year'
  wilaya: string;
  commune: string;
  quartier: string;
  description: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  location:PropertyLocation;
  images:   FileList;
}
export {PropertyFormData ,PropertyLocation ,Auth ,user }