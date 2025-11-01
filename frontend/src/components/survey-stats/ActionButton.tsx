import React from 'react'
import { Button } from '../ui/button'
import { Loader2 } from 'lucide-react'
import PlainBox from '../PlainBox'

interface DecryptButtonProps {
    onClick: () => Promise<void>
    isProcessing: boolean
}

/**
 * Button to trigger decryption of encrypted statistics
 */
export const DecryptButton: React.FC<DecryptButtonProps> = ({
    onClick,
    isProcessing
}) => {
    return (
        <PlainBox className='h-32 flex items-center justify-center'>
            <Button
                onClick={onClick}
                disabled={isProcessing}
            >
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isProcessing ? 'Decrypting…' : 'Decrypt Responses'}
            </Button>
        </PlainBox>
    )
}
