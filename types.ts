export interface LocationPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description: string;
}

export interface MapData {
  points: LocationPoint[];
  center: [number, number];
  zoom: number;
  isRoute: boolean;
}

export enum MapMode {
  Explore = 'EXPLORE',
  Route = 'ROUTE'
}
