import { RewardsDashboard } from "@/components/ui/rewards-dashboard";
import { ActivityFeed } from "@/components/ui/activity-feed";
import { useWallet } from "@/hooks/use-wallet";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function Rewards() {
  const { isConnected, address, connect } = useWallet();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏆</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Rewards & Achievements
              </h1>
              <p className="text-gray-600">
                Track your progress, earn achievements, and compete with other Xitique members
              </p>
            </div>
            <Button onClick={connect} className="w-full" data-testid="button-connect-wallet">
              Connect Wallet to View Rewards
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <span className="text-2xl">🏆</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Rewards & Achievements
                </h1>
                <p className="text-gray-600">
                  Track your journey and earn rewards for your participation
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Dashboard */}
            <div className="lg:col-span-2">
              <RewardsDashboard userId={address || ""} />
            </div>

            {/* Activity Sidebar */}
            <div className="lg:col-span-1">
              <ActivityFeed activities={[]} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}