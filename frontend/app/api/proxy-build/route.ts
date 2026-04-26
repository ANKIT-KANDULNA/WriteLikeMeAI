import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Map our frontend's request format to handfonted.xyz's expected format
    const payload = {
      characters: (body.characters || []).map((c: any) => ({
        ...c,
        image_b64: c.image_b64 ? c.image_b64.replace(/^data:image\/[a-z]+;base64,/, "") : "",
      })),
      font_family_name: body.font_name || "MyHandwriting",
      stroke_thickness: body.thickness || 100,
    };

    const response = await fetch("https://handfonted.xyz/generate_font_from_verified", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // If it's not OK, it likely returned a JSON error message
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { detail: errorData.message || "Failed to generate font on remote server" },
        { status: response.status }
      );
    }

    // handfonted.xyz returns a raw binary .ttf file on success
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ttf_b64 = buffer.toString("base64");

    // Return in the format our frontend expects (ttf_b64, safe_name, font_name, etc.)
    return NextResponse.json({
      font_name: body.font_name,
      safe_name: body.font_name.replace(/\s+/g, "_"),
      ttf_b64: ttf_b64,
      font_id: crypto.randomUUID(), // Provide a font_id so the preview page routing works
      // We omit woff2_b64 since handfonted.xyz only returns ttf. 
      // The frontend is updated to gracefully fallback to using the ttf url.
    });

  } catch (error: any) {
    console.error("Proxy Build Error:", error);
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }
}
