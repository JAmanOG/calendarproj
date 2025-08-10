import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search } from 'lucide-react'

const Sidebar = () => {
  return (
    <div className="w-72 h-screen bg-background border-r border-border p-5 shadow-sm">
      <ScrollArea className="h-full pr-1">
        <div className="space-y-8">
          
          {/* Search Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Search
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search tasks..."
                className="pl-9 focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          {/* Categories Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Categories
            </h3>
            <RadioGroup defaultValue="category1" className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="category1" id="category1" />
                <Label htmlFor="category1" className="text-sm text-muted-foreground cursor-pointer">
                  To Do
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="category2" id="category2" />
                <Label htmlFor="category2" className="text-sm text-muted-foreground cursor-pointer">
                  In Progress
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="category3" id="category3" />
                <Label htmlFor="category3" className="text-sm text-muted-foreground cursor-pointer">
                  Review
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="category4" id="category4" />
                <Label htmlFor="category4" className="text-sm text-muted-foreground cursor-pointer">
                  Completed
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Time Window Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Time Window
            </h3>
            <RadioGroup defaultValue="all_tasks" className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all_tasks" id="all_tasks" />
                <Label htmlFor="all_tasks" className="text-sm text-muted-foreground cursor-pointer">
                  All tasks
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="within_1_week" id="within_1_week" />
                <Label htmlFor="within_1_week" className="text-sm text-muted-foreground cursor-pointer">
                  Within 1 week
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="within_2_weeks" id="within_2_weeks" />
                <Label htmlFor="within_2_weeks" className="text-sm text-muted-foreground cursor-pointer">
                  Within 2 weeks
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="within_3_weeks" id="within_3_weeks" />
                <Label htmlFor="within_3_weeks" className="text-sm text-muted-foreground cursor-pointer">
                  Within 3 weeks
                </Label>
              </div>
            </RadioGroup>
            <Button variant="outline" className="w-full mt-3">
              Reset Filters
            </Button>
          </div>

          {/* Filters Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Filters
            </h3>
            <p className="text-sm text-muted-foreground">
              Coming soon...
            </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

export default Sidebar
