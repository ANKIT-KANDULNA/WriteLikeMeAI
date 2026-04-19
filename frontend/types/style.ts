export interface StyleParams {
  fontSize?: number;
  inkColor?: string;
  pageType?: "plain" | "lined" | "grid" | "dotted";
  pageSize?: "a4" | "a5" | "letter" | "legal";
  slant?: number;
  thickness?: number;
  lineSpacing?: number;
  margins?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}
