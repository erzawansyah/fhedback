import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertOctagon } from "lucide-react";

export default function Home() {
  return (
    <Alert>
      <AlertOctagon className="h-6 w-6" />
      <AlertTitle>
        Welcome to Fhedback!
      </AlertTitle>
      <AlertDescription>
        This is a demo application showcasing the Fhedback platform. You can connect your wallet and interact with the features available. Please ensure you are on the correct network.
      </AlertDescription>
    </Alert>
  );
}
