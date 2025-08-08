import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area' // optional for overflow handling
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
            <ul className="space-y-2">
              {[
                { id: 'category1', label: 'To Do', color: 'text-primary' },
                { id: 'category2', label: 'In Progress', color: 'text-orange-500' },
                { id: 'category3', label: 'Review', color: 'text-yellow-500' },
                { id: 'category4', label: 'Completed', color: 'text-green-500' },
              ].map(({ id, label, color }) => (
                <li
                  key={id}
                  className="flex items-center space-x-2 rounded-md px-2 py-1 hover:bg-muted/40 transition-colors"
                >
                  <input
                    type="radio"
                    name="category"
                    id={id}
                    className={`h-4 w-4 ${color} border-border focus:ring-2 focus:ring-offset-1`}
                  />
                  <Label
                    htmlFor={id}
                    className="text-sm text-foreground cursor-pointer"
                  >
                    {label}
                  </Label>
                </li>
              ))}
            </ul>
          </div>

          {/* Time Window Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Time Window
            </h3>
            <div className="space-y-2">
              {[
                { id: 'all_tasks', label: 'All tasks' },
                { id: 'within_1_week', label: 'Within 1 week' },
                { id: 'within_2_weeks', label: 'Within 2 weeks' },
                { id: 'within_3_weeks', label: 'Within 3 weeks' },
              ].map(({ id, label }) => (
                <div
                  key={id}
                  className="flex items-center space-x-2 rounded-md px-2 py-1 hover:bg-muted/40 transition-colors"
                >
                  <input
                    type="radio"
                    name="timeWindow"
                    id={id}
                    className="h-4 w-4 text-primary border-border focus:ring-2 focus:ring-offset-1"
                  />
                  <Label
                    htmlFor={id}
                    className="text-sm text-foreground cursor-pointer"
                  >
                    {label}
                  </Label>
                </div>
              ))}
            </div>
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
