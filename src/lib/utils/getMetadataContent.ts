// Cache for metadata content to prevent duplicate requests
const metadataCache = new Map<string, { data: unknown; timestamp: number }>();
const requestInProgress = new Map<string, Promise<unknown>>();
const CACHE_DURATION = 60000; // 1 minute cache
const MIN_REQUEST_INTERVAL = 2000; // Minimum 2 seconds between requests for same CID
const lastRequestTime = new Map<string, number>();

export const getMetadataContent = async (cid: string) => {
  try {
    // Check cache first
    const cached = metadataCache.get(cid);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`Returning cached metadata for CID: ${cid}`);
      return cached.data;
    }

    // Check if request is already in progress
    const inProgress = requestInProgress.get(cid);
    if (inProgress) {
      console.log(`Waiting for existing request for CID: ${cid}`);
      return await inProgress;
    }

    // Rate limiting - check last request time
    const lastTime = lastRequestTime.get(cid) || 0;
    const timeSinceLastRequest = Date.now() - lastTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.log(
        `Rate limiting: waiting ${waitTime}ms before requesting CID: ${cid}`
      );
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    console.log(`Fetching metadata from API for CID: ${cid}`);
    lastRequestTime.set(cid, Date.now());

    // Create and store the request promise
    const requestPromise = fetch(`/api/metadata?cid=${cid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch metadata: ${response.statusText}`);
        }

        const data = await response.json();

        // Cache the result
        metadataCache.set(cid, { data, timestamp: Date.now() });
        console.log(`Cached metadata for CID: ${cid}`);

        return data;
      })
      .finally(() => {
        // Remove from in-progress requests
        requestInProgress.delete(cid);
      });

    requestInProgress.set(cid, requestPromise);

    return await requestPromise;
  } catch (error) {
    console.error("Error fetching metadata:", error);
    // Remove failed request from cache
    requestInProgress.delete(cid);
    throw new Error(`Error fetching metadata: ${error}`);
  }
};
