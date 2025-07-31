export const getMetadataContent = async (cid: string) => {
  console.log(`Fetching metadata from API for CID: ${cid}`);
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
    return data;
  } catch (error) {
    console.error("Error fetching metadata:", error);
    throw new Error(`Error fetching metadata: ${error}`);
  }
};
