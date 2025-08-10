import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { Search, Filter, X, Clock } from 'lucide-react'
import { useTasks } from '@/lib/useTasks'
import type { Task } from '@/lib/useTasks'

const Sidebar = () => {
  const { filters, updateFilters, resetFilters, getFilteredTasks } = useTasks();
  const filteredTasks = getFilteredTasks();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFilters({ searchQuery: e.target.value });
  };

  const handleCategoryToggle = (category: 'todo' | 'progress' | 'review' | 'completed', checked: boolean) => {
    const newCategories = checked 
      ? [...filters.categories, category]
      : filters.categories.filter((c: Task['category']) => c !== category);
    updateFilters({ categories: newCategories });
  };

  const handleTimeWindowChange = (timeWindow: 'all' | '1week' | '2weeks' | '3weeks') => {
    updateFilters({ timeWindow });
  };

  const clearSearch = () => {
    updateFilters({ searchQuery: '' });
  };

  const getCategoryCount = (category: 'todo' | 'progress' | 'review' | 'completed') => {
    return filteredTasks.filter((task: Task) => task.category === category).length;
  };

  const hasActiveFilters = () => {
    return filters.searchQuery !== '' || 
           filters.categories.length < 4 || 
           filters.timeWindow !== 'all';
  };

  return (
    <div className="w-72 h-screen bg-background border-r border-border shadow-sm flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-border bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="w-4 h-4 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Task Filters</h2>
        </div>
        <p className="text-xs text-gray-600">
          {filteredTasks.length} tasks showing
        </p>
      </div>

      <ScrollArea className="flex-1 p-5">
        <div className="space-y-6">
          
          {/* Search Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                Search Tasks
              </h3>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by task name..."
                value={filters.searchQuery}
                onChange={handleSearchChange}
                className="pl-9 pr-8 focus:ring-2 focus:ring-blue-500/20 border-gray-300"
              />
              {filters.searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2 top-2.5 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              )}
            </div>
            {filters.searchQuery && (
              <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                Searching for: "{filters.searchQuery}"
              </p>
            )}
          </div>

          {/* Categories Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
              </div>
              <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                Categories
              </h3>
            </div>
            <div className="space-y-3 pl-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Checkbox 
                    id="todo" 
                    checked={filters.categories.includes('todo')}
                    onCheckedChange={(checked) => handleCategoryToggle('todo', checked as boolean)}
                  />
                  <Label htmlFor="todo" className="text-sm text-gray-700 cursor-pointer flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
                    To Do
                  </Label>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {getCategoryCount('todo')}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Checkbox 
                    id="progress" 
                    checked={filters.categories.includes('progress')}
                    onCheckedChange={(checked) => handleCategoryToggle('progress', checked as boolean)}
                  />
                  <Label htmlFor="progress" className="text-sm text-gray-700 cursor-pointer flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm"></div>
                    In Progress
                  </Label>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {getCategoryCount('progress')}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Checkbox 
                    id="review" 
                    checked={filters.categories.includes('review')}
                    onCheckedChange={(checked) => handleCategoryToggle('review', checked as boolean)}
                  />
                  <Label htmlFor="review" className="text-sm text-gray-700 cursor-pointer flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></div>
                    Review
                  </Label>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {getCategoryCount('review')}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Checkbox 
                    id="completed" 
                    checked={filters.categories.includes('completed')}
                    onCheckedChange={(checked) => handleCategoryToggle('completed', checked as boolean)}
                  />
                  <Label htmlFor="completed" className="text-sm text-gray-700 cursor-pointer flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
                    Completed
                  </Label>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {getCategoryCount('completed')}
                </span>
              </div>
            </div>
          </div>

          {/* Time Window Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                Time Window
              </h3>
            </div>
            <RadioGroup 
              value={filters.timeWindow} 
              onValueChange={(value) => handleTimeWindowChange(value as any)}
              className="space-y-2 pl-1"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="all" id="all_tasks" />
                <Label htmlFor="all_tasks" className="text-sm text-gray-700 cursor-pointer">
                  All tasks
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="1week" id="within_1_week" />
                <Label htmlFor="within_1_week" className="text-sm text-gray-700 cursor-pointer">
                  Within 1 week
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="2weeks" id="within_2_weeks" />
                <Label htmlFor="within_2_weeks" className="text-sm text-gray-700 cursor-pointer">
                  Within 2 weeks
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="3weeks" id="within_3_weeks" />
                <Label htmlFor="within_3_weeks" className="text-sm text-gray-700 cursor-pointer">
                  Within 3 weeks
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters() && (
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Active Filters
              </h3>
              <div className="space-y-2 text-sm">
                {filters.searchQuery && (
                  <div className="flex items-center justify-between text-blue-700 bg-white px-2 py-1 rounded border">
                    <span>Search: "{filters.searchQuery}"</span>
                    <button
                      onClick={clearSearch}
                      className="text-blue-500 hover:text-blue-700 ml-2"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {filters.categories.length < 4 && (
                  <div className="text-blue-700 bg-white px-2 py-1 rounded border">
                    Categories: {filters.categories.map((c: Task['category']) => 
                      c === 'todo' ? 'To Do' : 
                      c === 'progress' ? 'In Progress' : 
                      c === 'review' ? 'Review' : 'Completed'
                    ).join(', ')}
                  </div>
                )}
                {filters.timeWindow !== 'all' && (
                  <div className="text-blue-700 bg-white px-2 py-1 rounded border">
                    Time: {filters.timeWindow === '1week' ? 'Within 1 week' : 
                           filters.timeWindow === '2weeks' ? 'Within 2 weeks' : 
                           'Within 3 weeks'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer with Reset Button */}
      <div className="p-5 border-t border-border bg-gray-50">
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={resetFilters}
          disabled={!hasActiveFilters()}
        >
          <Filter className="w-4 h-4 mr-2" />
          Reset All Filters
        </Button>
        {hasActiveFilters() && (
          <p className="text-xs text-gray-500 text-center mt-2">
            Click to clear all filters and show all tasks
          </p>
        )}
      </div>
    </div>
  )
}

export default Sidebar
