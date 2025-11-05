'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { getTargetedGroups } from '@/app/actions'
import { Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Badge } from './ui/badge'
import { Checkbox } from './ui/checkbox'
import { Label } from './ui/label'

export function TargetedDeliveryForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ suggestedGroupings: string[]; reasoning: string } | null>(null)

  const handleSuggest = () => {
    const bulletinContent = (document.getElementById('content') as HTMLTextAreaElement)?.value
    if (!bulletinContent) {
      setError('Please enter some bulletin content first.')
      return
    }
    setError(null)
    setResult(null)

    startTransition(async () => {
      const { success, data, error: apiError } = await getTargetedGroups(bulletinContent)
      if (success && data) {
        setResult(data)
      } else {
        setError(apiError || 'An unknown error occurred.')
      }
    })
  }

  return (
    <div className="col-span-4">
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Grouping Suggestions</CardTitle>
          <CardDescription>
            Let AI analyze your bulletin content to suggest the best employee groups for delivery.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleSuggest} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Suggest Employee Groupings
          </Button>
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {result && (
            <div className="space-y-4 pt-4">
                <Card>
                    <CardHeader className='p-4'>
                        <CardTitle className="text-base">Reasoning</CardTitle>
                    </CardHeader>
                    <CardContent className='p-4 pt-0'>
                        <p className="text-sm text-muted-foreground">{result.reasoning}</p>
                    </CardContent>
                </Card>
                <div>
                    <h4 className="font-medium mb-2">Select Groups to Target:</h4>
                    <div className="space-y-2">
                        {result.suggestedGroupings.map((group, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <Checkbox id={`group-${index}`} defaultChecked />
                                <Label htmlFor={`group-${index}`} className="font-normal">
                                    <Badge variant="secondary">{group}</Badge>
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
