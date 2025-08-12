import { HelpCircle } from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent } from "../../ui/tooltip"

export default function HelperText({
    text
}: {
    text: string
}) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <HelpCircle className="text-muted-foreground w-3 h-3 ml-2" />
            </TooltipTrigger>
            <TooltipContent side="right" aria-label={text}>
                <p className="text-xs">{text}</p>
            </TooltipContent>
        </Tooltip>
    )
}
