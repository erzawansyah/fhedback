import { NextResponse, type NextRequest } from "next/server";
import { pinata } from "@/lib/pinata/config";
import { verifyMessage } from "ethers";

interface NextResponseError {
  error: string;
  details?: string;
}

/**
 * Helper function untuk membuat response error yang konsisten
 */
function errorResponse(
  error: string,
  status: number,
  details?: string
): NextResponse<NextResponseError> {
  return NextResponse.json(details ? { error, details } : { error }, {
    status,
  });
}

/**
 * Helper function for signature verification
 * Memastikan signature valid dan cocok dengan address yang diberikan
 */
function verifySignature(
  address: string,
  message: string,
  signature: string
): boolean {
  try {
    const recovered = verifyMessage(message, signature);
    return recovered.toLowerCase() === address.toLowerCase();
  } catch {
    return false;
  }
}

/**
 * Validates the structure of metadata data
 * Memastikan struktur data metadata sesuai dengan yang diharapkan
 */
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

interface CreateMetadataReturnValue {
  cid: string;
}

export type CreateMetadataResponse = NextResponse<
  CreateMetadataReturnValue | NextResponseError
>;

/**
 * Endpoint POST
 * Membuat metadata survey baru di Pinata
 * Validasi signature dan input sebelum upload
 */
export async function POST(
  request: NextRequest
): Promise<CreateMetadataResponse> {
  try {
    const body: CreateMetadataRequestBody = await request.json();
    const { address, message, signature, data } = body;
    if (!address || !message || !signature) {
      return errorResponse("Signature required", 401);
    }
    if (!verifySignature(address, message, signature)) {
      return errorResponse("Invalid signature or does not match address", 401);
    }
    const { cid } = await pinata.upload.public
      .json({
        address,
        ...data,
      })
      .name(`metadata-${Date.now()}`);
    return NextResponse.json({ cid }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal Server Error", details: (err as Error).message },
      { status: 500 }
    );
  }
}

export interface GetMetadataReturnValue {
  title: string;
  description: string;
  categories: string;
  minLabel: string;
  maxLabel: string;
  tags: string[];
}

export type GetMetadataResponse = NextResponse<
  GetMetadataReturnValue | NextResponseError
>;

/**
 * Endpoint GET
 * Mengambil metadata survey dari Pinata berdasarkan CID
 */
export async function GET(request: NextRequest): Promise<GetMetadataResponse> {
  const { searchParams } = new URL(request.url);
  const cid = searchParams.get("cid");

  if (!cid) {
    return NextResponse.json({ error: "CID is required" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL}/ipfs/${cid}`,
      {
        method: "GET",
      }
    );

    const metadata = await res.json();
    if (!metadata || typeof metadata !== "object") {
      return NextResponse.json(
        { error: "Invalid metadata format" },
        { status: 400 }
      );
    }
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

interface UpdateMetadataReturnValue {
  cid: string;
}

export type UpdateMetadataResponse = NextResponse<
  UpdateMetadataReturnValue | NextResponseError
>;

/**
 * Endpoint PUT
 * Mengupdate metadata survey di Pinata (hapus yang lama, upload yang baru)
 * Validasi signature dan input sebelum proses
 */
export async function PUT(
  request: NextRequest
): Promise<UpdateMetadataResponse> {
  try {
    const body: UpdateMetadataRequestBody = await request.json();
    const { address, message, signature, existingCid, ...data } = body;
    if (!address || !message || !signature) {
      return errorResponse("Signature required", 401);
    }
    if (!verifySignature(address, message, signature)) {
      return errorResponse("Invalid signature or does not match address", 401);
    }
    // delete the existing metadata
    const existingMetadata = await pinata.files.public.list().cid(existingCid);
    if (!existingMetadata) {
      return NextResponse.json(
        { error: "Existing metadata not found" },
        { status: 404 }
      );
    }
    const existingIds = existingMetadata.files.map((file) => file.id);
    await pinata.files.public.delete(existingIds);
    const { cid } = await pinata.upload.public.json({
      address,
      ...data,
    });
    return NextResponse.json({ cid }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal Server Error", details: (err as Error).message },
      { status: 500 }
    );
  }
}
