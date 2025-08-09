import { ComingSoon } from "@/components/ui/coming-soon"

const RewardsPage = () => {
    return (
        <ComingSoon
            title="Rewards Center"
            description="Track your earnings, redeem tokens, and discover new ways to earn rewards by participating in surveys and community activities."
            expectedDate="Q2 2025"
            features={[
                "Token balance tracking",
                "Earning history",
                "Redemption options",
                "Referral rewards",
                "Achievement badges",
                "Loyalty bonuses",
                "Withdrawal options",
                "Staking opportunities"
            ]}
        />
    )
}

export default RewardsPage
