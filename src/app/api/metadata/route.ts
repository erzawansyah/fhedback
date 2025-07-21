import { NextResponse, type NextRequest } from "next/server";
import { pinata } from "@/lib/pinata/config";
import { verifyMessage } from "ethers";

export interface CreateMetadataRequestBody {
  address: `0x${string}` | null;
  signature: string;
  message: string;
  data: {
    title: string;
    description: string;
    categories: string;
    minLabel: string;
    maxLabel: string;
    tags: string[];
  };
}

// Create a new survey metadata
// This endpoint is used to create a new survey metadata entry in Pinata
export async function POST(request: NextRequest) {
  try {
    const body: CreateMetadataRequestBody = await request.json();
    const { address, message, signature, data } = body;
    if (!address || !message || !signature) {
      return NextResponse.json(
        { error: "Signature required" },
        { status: 401 }
      );
    }
    let recovered;
    try {
      recovered = verifyMessage(message, signature);
    } catch {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
    if (recovered.toLowerCase() !== address.toLowerCase()) {
      return NextResponse.json(
        { error: "Signature does not match address" },
        { status: 401 }
      );
    }
    const { cid } = await pinata.upload.public.json({
      address,
      ...data,
    });
    return NextResponse.json(cid, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal Server Error", details: (err as Error).message },
      { status: 500 }
    );
  }
}

// Get survey metadata by CID
// This endpoint is used to retrieve survey metadata from Pinata
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cid = searchParams.get("cid");

  if (!cid) {
    return NextResponse.json({ error: "CID is required" }, { status: 400 });
  }

  try {
    const metadata = await pinata.files.public.get(cid);
    return NextResponse.json(metadata, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal Server Error", details: (err as Error).message },
      { status: 500 }
    );
  }
}

export interface UpdateMetadataRequestBody {
  address: `0x${string}` | null;
  signature: string;
  message: string;
  existingCid: string;
  data: {
    title: string;
    description: string;
    categories: string;
    minLabel: string;
    maxLabel: string;
    tags: string[];
  };
}

export async function UPDATE(request: NextRequest) {
  try {
    const body: UpdateMetadataRequestBody = await request.json();
    const { address, message, signature, existingCid, ...data } = body;
    if (!address || !message || !signature) {
      return NextResponse.json(
        { error: "Signature required" },
        { status: 401 }
      );
    }
    let recovered;
    try {
      recovered = verifyMessage(message, signature);
    } catch {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
    if (recovered.toLowerCase() !== address.toLowerCase()) {
      return NextResponse.json(
        { error: "Signature does not match address" },
        { status: 401 }
      );
    }
    // delete the existing metadata
    const existingMetadata = await pinata.files.public.list().cid(existingCid);
    if (!existingMetadata) {
      return NextResponse.json(
        { error: "Existing metadata not found" },
        { status: 404 }
      );
    }
    const existingId = existingMetadata.files.map((file) => file.id);
    await pinata.files.public.delete(existingId);
    const { cid } = await pinata.upload.public.json({
      address,
      ...data,
    });
    return NextResponse.json(cid, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal Server Error", details: (err as Error).message },
      { status: 500 }
    );
  }
}
