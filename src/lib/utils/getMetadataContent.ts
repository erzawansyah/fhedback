export const getMetadataContent = async (cid: string) => {
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
    return await response.json();
  } catch (error) {
    console.error("Error fetching metadata:", error);
    throw new Error(`Error fetching metadata: ${error}`);
  }
};
