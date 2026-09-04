import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ detail: "No file uploaded" }, { status: 400 });
    }

    // Read the file and convert to base64 for the v1 API
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");

    const payload = {
      image_base64: base64Image,
    };

    const response = await fetch("https://handfonted.dotrepo.com/api/v1/segment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      return NextResponse.json(
        { detail: `Failed to process image on remote server (Status: ${response.status}). Details: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    if (!data.success) {
      return NextResponse.json({ detail: data.error || "Failed" }, { status: 400 });
    }

    // Map the response to match what the frontend's Zustand store expects
    // The v1 API returns { session_id, characters: [ { id, character, image_base64, ... } ] }
    // The frontend expects: { session_id, characters: [ { id, label, image_b64 } ] }
    const mappedCharacters = (data.characters || []).map((c: any) => {
      const b64 = c.image_base64 || "";
      return {
        id: c.id,
        label: c.character, // Map 'character' to 'label'
        image_b64: b64.startsWith("data:") ? b64 : `data:image/png;base64,${b64}`,
      };
    });

    return NextResponse.json({
      session_id: data.session_id || "handfonted_proxy",
      total: mappedCharacters.length,
      characters: mappedCharacters,
    });

  } catch (error: any) {
    console.error("Proxy Segment Error:", error);
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }
}
