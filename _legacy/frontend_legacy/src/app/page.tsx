import { HomeBanner } from "@/components/sections/HomeBanner";
import { FeaturedSurveysSection } from "@/components/sections/HomeFeaturedSurveys";

export default function Home() {
  return (
    <main>
      {/* Banner Section */}
      <HomeBanner />

      {/* Featured Survey Section */}
      <FeaturedSurveysSection id="featured-survey" />
    </main>
  );
}
