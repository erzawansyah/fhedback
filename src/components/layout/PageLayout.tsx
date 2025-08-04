const PageLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <main className="container max-w-7xl mx-auto p-8 space-y-8">
            {children}
        </main>
    );
}

export default PageLayout;
