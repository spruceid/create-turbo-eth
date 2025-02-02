'use client'

import { useEffect, useState } from 'react'

import { useForm } from 'react-hook-form'
import { BiInfoCircle } from 'react-icons/bi'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useToast } from '@/lib/hooks/use-toast'

import { FailedToFetchError, NotFoundError, PermissionError, useCheckLivepeerApiKey } from '../hooks/use-check-livepeer-api-key'
import { useIsLivepeerApiKeySet, useLivepeerApiKey } from '../hooks/use-livepeer-api-key'

interface livepeerForm {
  apiKey: string
}

export function FormLivepeerApiKey() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { register, handleSubmit, watch } = useForm<livepeerForm>()
  const { checkLivepeerApiKey } = useCheckLivepeerApiKey()
  const { toast, dismiss } = useToast()
  const [, setLivepeerApiKey] = useLivepeerApiKey()

  const watchApiKey = watch('apiKey')
  const ApiKeyTooltip = 'Livepeer API Key has to have CORS access to the current domain'

  const isLivepeerApiKeySet = useIsLivepeerApiKeySet()
  useEffect(() => {
    if (!isLivepeerApiKeySet) {
      toast({
        title: 'Livepeer API Key not set',
        description: 'Please set a Livepeer API Key to use this integration',
        duration: 100000,
      })
    }
    return () => {
      dismiss()
    }
  }, [isLivepeerApiKeySet])

  const handleToast = ({ title, description }: { title: string; description: string }) => {
    toast({
      title,
      description,
    })

    setTimeout(() => {
      dismiss()
    }, 4200)
  }

  async function onSubmit(FieldValues: livepeerForm) {
    setIsLoading(true)
    if (!FieldValues.apiKey) return
    try {
      await checkLivepeerApiKey(FieldValues.apiKey)
    } catch (e) {
      if (e instanceof NotFoundError || e instanceof PermissionError) {
        setLivepeerApiKey(FieldValues.apiKey)
        setIsLoading(false)
      } else if (e instanceof FailedToFetchError) {
        handleToast({
          title: 'Failed to fetch',
          description: 'Please check if you API Key has CORS access',
        })
        setIsLoading(false)
      } else {
        handleToast({
          title: 'Invalid API Key',
          description: 'Please enter a valid Livepeer API Key',
        })
        setIsLoading(false)
      }
    }
  }
  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-center gap-x-2">
          <label>Livepeer API Key</label>
          <Tooltip>
            <TooltipTrigger>
              <BiInfoCircle />
            </TooltipTrigger>
            <TooltipContent>{ApiKeyTooltip}</TooltipContent>
          </Tooltip>
        </div>
        <input required className="input mt-4" {...register('apiKey')} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
        <button className="btn btn-emerald mt-4 w-full" disabled={!watchApiKey || isLoading} type="submit">
          {isLoading ? 'Loading...' : 'Submit'}
        </button>
      </form>
    </div>
  )
}
