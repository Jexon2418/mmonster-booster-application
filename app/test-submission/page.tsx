"use client"

import { useState, useEffect } from "react"
import { TestSubmissionButton } from "@/components/test-submission-button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getDiscordUser } from "@/lib/auth-service"
import { testSupabaseConnection, testWebhookConnection, type ConnectionStatus } from "@/lib/connection-diagnostics"
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

export default function TestSubmissionPage() {
  const [discordId, setDiscordId] = useState("")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [supabaseStatus, setSupabaseStatus] = useState<ConnectionStatus | null>(null)
  const [webhookStatus, setWebhookStatus] = useState<ConnectionStatus | null>(null)
  const [isCheckingConnections, setIsCheckingConnections] = useState(false)
  const [customSupabaseUrl, setCustomSupabaseUrl] = useState("")
  const [customSupabaseKey, setCustomSupabaseKey] = useState("")
  const [customWebhookUrl, setCustomWebhookUrl] = useState("")
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Try to get the current user on component mount
  useEffect(() => {
    const user = getDiscordUser()
    if (user) {
      setCurrentUser(user)
      setDiscordId(user.id)
    }
  }, [])

  // Function to check connections
  const checkConnections = async () => {
    setIsCheckingConnections(true)
    try {
      // Check Supabase connection
      const supabaseResult = await testSupabaseConnection(
        customSupabaseUrl || undefined,
        customSupabaseKey || undefined,
      )
      setSupabaseStatus(supabaseResult)

      // Check webhook connection
      const webhookResult = await testWebhookConnection(customWebhookUrl || undefined)
      setWebhookStatus(webhookResult)
    } catch (error) {
      console.error("Error checking connections:", error)
    } finally {
      setIsCheckingConnections(false)
    }
  }

  // Check connections on initial load
  useEffect(() => {
    checkConnections()
  }, [])

  return (
    <main className="min-h-screen bg-[#171923] flex flex-col items-center pt-16 pb-8">
      <div className="w-full max-w-3xl px-4">
        <Card className="p-6 bg-[#1A202C] border border-[#E53E3E]/30 rounded-xl">
          <h1 className="text-2xl font-bold text-white mb-6">Test Submission Process</h1>

          {/* Connection Status */}
          <div className="mb-6 p-4 bg-[#1E2533] rounded-md">
            <h2 className="text-white font-medium mb-3">Connection Status</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Supabase Database:</span>
                {isCheckingConnections ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-gray-400">Checking...</span>
                  </div>
                ) : supabaseStatus ? (
                  supabaseStatus.isConnected ? (
                    supabaseStatus.error ? (
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                        <span className="text-yellow-500">Connected with warning: {supabaseStatus.error}</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-green-500">Connected</span>
                      </div>
                    )
                  ) : (
                    <div className="flex items-center">
                      <XCircle className="h-4 w-4 text-[#E53E3E] mr-2" />
                      <span className="text-[#E53E3E]">{supabaseStatus.error || "Not connected"}</span>
                    </div>
                  )
                ) : (
                  <span className="text-gray-400">Not checked</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Webhook Service:</span>
                {isCheckingConnections ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-gray-400">Checking...</span>
                  </div>
                ) : webhookStatus ? (
                  webhookStatus.isConnected ? (
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-green-500">URL Valid</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <XCircle className="h-4 w-4 text-[#E53E3E] mr-2" />
                      <span className="text-[#E53E3E]">{webhookStatus.error || "Invalid URL"}</span>
                    </div>
                  )
                ) : (
                  <span className="text-gray-400">Not checked</span>
                )}
              </div>
            </div>

            <div className="mt-4">
              <Button
                onClick={checkConnections}
                disabled={isCheckingConnections}
                variant="outline"
                size="sm"
                className="text-white border-gray-600"
              >
                {isCheckingConnections ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin mr-2" />
                    Checking...
                  </>
                ) : (
                  "Check Connections"
                )}
              </Button>

              <Button
                onClick={() => setShowAdvanced(!showAdvanced)}
                variant="outline"
                size="sm"
                className="ml-2 text-gray-400 border-gray-600"
              >
                {showAdvanced ? "Hide Advanced" : "Advanced Options"}
              </Button>
            </div>

            {showAdvanced && (
              <div className="mt-4 space-y-3 border-t border-gray-700 pt-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Custom Supabase URL</label>
                  <Input
                    value={customSupabaseUrl}
                    onChange={(e) => setCustomSupabaseUrl(e.target.value)}
                    placeholder="https://your-project.supabase.co"
                    className="bg-[#2D3748] border-[#4A5568] text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Custom Supabase Anon Key</label>
                  <Input
                    value={customSupabaseKey}
                    onChange={(e) => setCustomSupabaseKey(e.target.value)}
                    placeholder="your-anon-key"
                    className="bg-[#2D3748] border-[#4A5568] text-white text-sm"
                    type="password"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Custom Webhook URL</label>
                  <Input
                    value={customWebhookUrl}
                    onChange={(e) => setCustomWebhookUrl(e.target.value)}
                    placeholder="https://your-webhook-url.com"
                    className="bg-[#2D3748] border-[#4A5568] text-white text-sm"
                  />
                </div>
                <Button
                  onClick={checkConnections}
                  disabled={isCheckingConnections}
                  variant="outline"
                  size="sm"
                  className="text-white border-gray-600"
                >
                  Test Custom Connection
                </Button>
              </div>
            )}
          </div>

          {/* User Info */}
          {currentUser ? (
            <div className="mb-6 p-4 bg-[#1E2533] rounded-md">
              <p className="text-white">
                Logged in as: <span className="font-medium">{currentUser.username}</span>
              </p>
              <p className="text-gray-400 text-sm">Discord ID: {currentUser.id}</p>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-[#1E2533] rounded-md">
              <p className="text-[#E53E3E]">Not logged in with Discord</p>
              <p className="text-gray-400 text-sm">Please enter a Discord ID manually below</p>
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div>
              <label htmlFor="discordId" className="block text-white mb-2">
                Discord ID to test
              </label>
              <div className="flex space-x-2">
                <Input
                  id="discordId"
                  value={discordId}
                  onChange={(e) => setDiscordId(e.target.value)}
                  placeholder="Enter Discord ID"
                  className="bg-[#2D3748] border-[#4A5568] text-white"
                />
              </div>
            </div>
          </div>

          {discordId ? (
            <TestSubmissionButton
              discordId={discordId}
              customSupabaseUrl={customSupabaseUrl}
              customSupabaseKey={customSupabaseKey}
              customWebhookUrl={customWebhookUrl}
            />
          ) : (
            <p className="text-[#E53E3E]">Please enter a Discord ID to test</p>
          )}

          <div className="mt-8 p-4 bg-[#1E2533] rounded-md">
            <h3 className="text-white font-medium mb-2">How this works</h3>
            <p className="text-gray-400 text-sm">This tool helps test the submission process by:</p>
            <ol className="list-decimal list-inside text-gray-400 text-sm mt-2 space-y-1">
              <li>Finding your draft application in the database</li>
              <li>Updating its status to "submitted"</li>
              <li>Sending a webhook notification directly from the client</li>
              <li>Showing the result of the operation</li>
            </ol>
            <p className="text-gray-400 text-sm mt-2">
              <strong>Note:</strong> We're now bypassing the database webhook function and sending the webhook directly
              from the client.
            </p>
          </div>
        </Card>
      </div>
    </main>
  )
}
