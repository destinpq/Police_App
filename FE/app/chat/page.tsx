import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TeamChat } from "@/components/team-chat"

export default function ChatPage() {
  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Team Chat</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Team Chat</CardTitle>
            <CardDescription>Chat with your team members</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <TeamChat />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Online Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="relative">
                      <div className="h-9 w-9 rounded-full bg-muted"></div>
                      <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-1 ring-background"></div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">Team Member {i}</p>
                      <p className="text-xs text-muted-foreground">Online</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>External Chat</CardTitle>
              <CardDescription>Connect to Slack</CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="https://slack.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full p-2 rounded-md bg-[#4A154B] text-white hover:bg-opacity-90 transition-colors"
              >
                Open Slack Workspace
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

