export interface ItemIcon {
  imageset: string;
  name: string;
  pngUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ManualSegment {
  lineNo: number;
  segmentNo: number;
  text: string;
}

export interface ManualEntry {
  id: number;
  text: string;
  rawSegments: ManualSegment[];
}

export interface EtcItem {
  id: number;
  section: string;
  name: string;
  shopName: string;
  type: number;
  group?: number;
  canSell: boolean;
  sellPeso: number;
  buyPeso?: number;
  cash?: number;
  active: boolean;
  value?: number;
  inventoryManual: number;
  inventorySubManual: number;
  decorationMaxCheck?: boolean;
  limitClassNum?: number;
  limitActiveFilter?: boolean;
  maxSoldier?: number;
  iconKey?: string;
  icon: ItemIcon | null;
}
