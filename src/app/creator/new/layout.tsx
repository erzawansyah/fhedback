import { SurveyCreationProvider } from "@/context/SurveyCreationContext";

const SurveyCreationLayout = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <SurveyCreationProvider>
            {children}
        </SurveyCreationProvider>
    );
}

export default SurveyCreationLayout;
