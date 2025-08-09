const metadataCache = new Map<string, Record<string, unknown>>();

export const getMetadataContent = async (cid: string) => {
  if (metadataCache.has(cid)) {
    return metadataCache.get(cid);
  }

  try {
    const response = await fetch(`/api/metadata?cid=${cid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`);
    }

    const data = await response.json();
    metadataCache.set(cid, data);
    return data;
  } catch (error) {
    console.error("Error fetching metadata:", error);
    throw new Error(`Error fetching metadata: ${error}`);
  }
};
