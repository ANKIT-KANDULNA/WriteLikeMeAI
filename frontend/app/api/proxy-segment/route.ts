import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ detail: "No file uploaded" }, { status: 400 });
    }

    // Map "file" to "handwriting_image" which handfonted.xyz expects
    const forwardFormData = new FormData();
    forwardFormData.append("handwriting_image", file);

    const response = await fetch("https://handfonted.xyz/process_image_for_verification", {
      method: "POST",
      body: forwardFormData,
    });

    if (!response.ok) {
      return NextResponse.json(
        { detail: "Failed to process image on remote server" },
        { status: response.status }
      );
    }

    const data = await response.json();
    if (!data.success) {
      return NextResponse.json({ detail: data.message || "Failed" }, { status: 400 });
    }

    // Map the response to match what the frontend's Zustand store expects
    // The frontend expects: { session_id, characters: [ { id, label, image_b64 } ] }
    // Our old backend returned image_b64 with the data URI prefix. handfonted.xyz might not.
    const mappedCharacters = (data.characters || []).map((c: any) => ({
      ...c,
      image_b64: c.image_b64.startsWith("data:") 
        ? c.image_b64 
        : `data:image/png;base64,${c.image_b64}`,
    }));

    return NextResponse.json({
      session_id: "handfonted_proxy",
      total: mappedCharacters.length,
      characters: mappedCharacters,
    });

  } catch (error: any) {
    console.error("Proxy Segment Error:", error);
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }
}
