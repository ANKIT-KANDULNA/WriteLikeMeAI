export type AIModel = "groq" | "gemini" | "deepseek"

export type TextBlockType =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "subheading"
  | "paragraph"

export interface GenerationRequest {
  prompt: string
  model: AIModel
  wordCount?: number
}

export interface GenerationResponse {
  text: string
  model: AIModel
  tokensUsed?: number
}

export interface StyleAnalysisRequest {
  imageBase64: string
  mimeType: "image/jpeg" | "image/png" | "image/webp"
}

export interface StyleAnalysisResponse {
  styleParams: import("../types/style").StyleParams
  confidence: number
  notes: string
}