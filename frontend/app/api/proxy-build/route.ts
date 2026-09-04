import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Map our frontend's request format to the remote v1 API's expected format (FontGenerationRequest)
    const payload = {
      characters: (body.characters || []).map((c: any) => {
        const b64 = c.image_b64 ? c.image_b64.replace(/^data:image\/[a-z]+;base64,/, "") : "";
        return {
          id: c.id || crypto.randomUUID(),
          character: c.label || "", // frontend uses 'label', API expects 'character'
          image_base64: b64,
          original_image_base64: b64, // Required by the API schema
          confidence: 0.99,           // Required by the API schema
          bounding_box: {             // Required by the API schema
            x: 0,
            y: 0,
            width: 100,
            height: 100
          }
        };
      }),
      font_name: body.font_name || "MyHandwriting",
      thickness: body.thickness || 100,
    };

    const response = await fetch("https://handfonted.dotrepo.com/api/v1/generate-font", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      return NextResponse.json(
        { detail: `Failed to generate font on remote server (Status: ${response.status}). Details: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    if (!data.success) {
      return NextResponse.json({ detail: data.error || "Failed" }, { status: 400 });
    }

    // Clean up the base64 string in case the remote API returns a data URI prefix
    const rawB64 = data.font_base64 ? data.font_base64.replace(/^data:[^;]+;base64,/, "") : "";

    // Return in the format our frontend expects
    return NextResponse.json({
      font_name: data.font_name || body.font_name,
      safe_name: (data.font_name || body.font_name).replace(/\s+/g, "_"),
      ttf_b64: rawB64,
      font_id: crypto.randomUUID(),
    });

  } catch (error: any) {
    console.error("Proxy Build Error:", error);
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }
}
