import { useState, useRef, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { toolCategories, getToolById, allTools } from "@/lib/tools-config";
import { Search, Menu, Wrench, X, Trash2, ChevronsLeft, ChevronsRight, ArrowRight, Github, MessageCircle, Download, Coffee } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { clearAllToolStates, useHasToolStates } from "@/hooks/use-tool-state";
import { isTauri } from "@/lib/platform";
import { SEOHead } from "@/components/SEOHead";
import Tool from "./tool";

export default function MainLayout() {
  const [location, navigate] = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [clearTrigger, setClearTrigger] = useState(0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedToolIndex, setSelectedToolIndex] = useState(0);
  const hasToolStates = useHasToolStates();

  // Refs for search inputs
  const desktopSearchRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const toolHistoryRef = useRef<string[]>([]);
  const toolForwardRef = useRef<string[]>([]);

  // Extract tool ID directly from location instead of useParams
  const toolId = location.startsWith('/tool/') ? location.split('/tool/')[1] : null;

  // Get current tool from toolId
  const currentTool = toolId ? getToolById(toolId) : null;

  // Filter tools based on search
  const filteredCategories = toolCategories.map(category => ({
    ...category,
    tools: category.tools.filter(tool =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.tools.length > 0);

  // Create flattened list of all filtered tools for keyboard navigation
  const allFilteredTools = filteredCategories.flatMap(category => category.tools);

  const maxHistory = allTools.length;

  const handleToolClick = (newToolId: string) => {
    if (toolId) {
      toolHistoryRef.current.push(toolId);
      if (toolHistoryRef.current.length > maxHistory) toolHistoryRef.current.shift();
      toolForwardRef.current = [];
    }
    navigate(`/tool/${newToolId}`);
    setIsMobileMenuOpen(false);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setSelectedToolIndex(0); // Reset selection when search changes
  };

  const getToolIndexInFlattenedList = (toolId: string) => {
    return allFilteredTools.findIndex(tool => tool.id === toolId);
  };

  // Handle CMD+K shortcut to toggle sidebar and focus search
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for CMD+\ (Mac) or CTRL+\ (Windows/Linux) - toggle sidebar
      if ((event.metaKey || event.ctrlKey) && event.key === '\\') {
        event.preventDefault();
        setIsSidebarCollapsed(!isSidebarCollapsed);
      }

      // CMD+Shift+{ - go back to previous tool (Tauri only)
      if (isTauri && event.metaKey && event.shiftKey && (event.key === '{' || event.key === '[')) {
        event.preventDefault();
        const prevId = toolHistoryRef.current.pop();
        if (prevId) {
          if (toolId) toolForwardRef.current.push(toolId);
          navigate(`/tool/${prevId}`);
        }
      }

      // CMD+Shift+} - go forward to next tool (Tauri only)
      if (isTauri && event.metaKey && event.shiftKey && (event.key === '}' || event.key === ']')) {
        event.preventDefault();
        const nextId = toolForwardRef.current.pop();
        if (nextId) {
          if (toolId) toolHistoryRef.current.push(toolId);
          navigate(`/tool/${nextId}`);
        }
      }

      // Check for CMD+K (Mac) or CTRL+K (Windows/Linux) - focus search
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();

        // On desktop, expand sidebar if collapsed and focus search
        if (window.innerWidth >= 1024) {
          if (isSidebarCollapsed) {
            setIsSidebarCollapsed(false);
            // Small delay to ensure the sidebar is rendered
            setTimeout(() => {
              desktopSearchRef.current?.focus();
            }, 100);
          } else {
            desktopSearchRef.current?.focus();
          }
        } else {
          // Mobile: open mobile menu and focus mobile search
          if (!isMobileMenuOpen) {
            setIsMobileMenuOpen(true);
            // Small delay to ensure the mobile menu is rendered
            setTimeout(() => {
              mobileSearchRef.current?.focus();
            }, 100);
          } else {
            mobileSearchRef.current?.focus();
          }
        }
      }

      // Check for ESC key
      if (event.key === 'Escape') {
        // Clear search query
        setSearchQuery('');
        setSelectedToolIndex(0);

        // Remove focus from search inputs
        desktopSearchRef.current?.blur();
        mobileSearchRef.current?.blur();

        // Close mobile menu if open
        if (isMobileMenuOpen) {
          setIsMobileMenuOpen(false);
        }
      }

      // Handle keyboard navigation in search results
      if (searchQuery && allFilteredTools.length > 0) {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setSelectedToolIndex(prev =>
            prev < allFilteredTools.length - 1 ? prev + 1 : 0
          );
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          setSelectedToolIndex(prev =>
            prev > 0 ? prev - 1 : allFilteredTools.length - 1
          );
        } else if (event.key === 'Enter') {
          event.preventDefault();
          const selectedTool = allFilteredTools[selectedToolIndex];
          if (selectedTool) {
            handleToolClick(selectedTool.id);
            setSearchQuery('');
            setSelectedToolIndex(0);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen, isSidebarCollapsed, searchQuery, allFilteredTools, selectedToolIndex]);

  return (
    <TooltipProvider>
      <SEOHead toolId={toolId || undefined} />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="flex items-center hover:opacity-80 transition-opacity"
              >
                <h1 className="text-base font-semibold text-blue-600 dark:text-blue-400">
                  <Wrench className="inline mr-1.5 h-4 w-4 hidden sm:inline" />
                  HandyDevTools
                </h1>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              {/* Recycle Bin Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (hasToolStates) {
                          clearAllToolStates();
                          // Force re-render by incrementing trigger
                          setClearTrigger(prev => prev + 1);
                        }
                      }}
                      className={`h-8 w-8 ${!hasToolStates ? 'opacity-50' : ''}`}
                    >
                      <Trash2 className={`h-4 w-4 ${hasToolStates ? 'text-blue-600 dark:text-white' : 'text-gray-400'}`} />
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{hasToolStates ? 'Clear all tools' : 'No data to reset'}</p>
                </TooltipContent>
              </Tooltip>

              {/* Download Mac App Button - Web only */}
              {!isTauri && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://github.com/GeekyShacklebolt/handy-dev-tools/releases/tag/v1.0.0', '_blank')}
                  className="h-7 hidden lg:flex text-xs"
                >
                  Download Mac App v1 <Download className="h-3.5 w-3.5 ml-1" />
                </Button>
              )}
              {!isTauri && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open('https://github.com/GeekyShacklebolt/handy-dev-tools/releases/tag/v1.0.0', '_blank')}
                      className="h-8 w-8 lg:hidden"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download Mac App v1</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Buy Me a Coffee - Desktop */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://www.buymeacoffee.com/shivasaxena', '_blank')}
                className="h-7 hidden lg:flex text-xs"
              >
                Buy me a coffee <Coffee className="h-3.5 w-3.5 ml-1" />
              </Button>

              {/* Buy Me a Coffee - Mobile */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open('https://www.buymeacoffee.com/shivasaxena', '_blank')}
                    className="h-8 w-8 lg:hidden"
                  >
                    <Coffee className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Buy me a coffee</p>
                </TooltipContent>
              </Tooltip>

              {/* Feedback Button - Desktop */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://github.com/GeekyShacklebolt/handy-dev-tools/issues/new', '_blank')}
                className="h-7 hidden lg:flex text-xs"
              >
                Feedback <Github className="h-3.5 w-3.5 ml-1" />
              </Button>

              {/* Feedback Button - Mobile */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open('https://github.com/GeekyShacklebolt/handy-dev-tools/issues/new', '_blank')}
                    className="h-8 w-8 lg:hidden"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Give Feedback</p>
                </TooltipContent>
              </Tooltip>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="h-8 w-8 lg:hidden"
              >
                {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Left Sidebar - Desktop */}
        <div className={`hidden lg:flex lg:flex-col lg:border-r lg:border-gray-300 lg:dark:border-gray-600 lg:bg-white lg:dark:bg-gray-800 lg:sticky lg:top-12 lg:h-[calc(100vh-3rem)] transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'lg:w-14' : 'lg:w-56'
        }`}>
          <div className="flex-1 overflow-y-auto p-3">
            {/* Search and Collapse Button - Inline */}
            <div className="mb-3">
              {!isSidebarCollapsed ? (
                <div className="flex items-center space-x-1">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search... ⌘K"
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-7 w-full text-xs h-7"
                      ref={desktopSearchRef}
                    />
                    {searchQuery && allFilteredTools.length > 0 && (
                      <ArrowRight className="absolute right-2 top-2 h-3.5 w-3.5 text-gray-400" />
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSidebarCollapsed(true)}
                    className="h-7 w-7 pl-1 hover:bg-transparent"
                  >
                    {/* <ChevronsLeft className="h-4 w-4"/> */}
                    <span className="text-gray-400 hover:text-white transition-colors">⌘ \</span>
                  </Button>
                </div>
              ) : (
                <div className="flex justify-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSidebarCollapsed(false)}
                        className="h-10 w-10"
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Expand sidebar [⌘\]</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>

            {/* Tool Categories - Only show when expanded */}
            <div className={`space-y-3 transition-all duration-300 ease-in-out ${
              isSidebarCollapsed ? 'opacity-0 max-h-0 overflow-hidden' : 'opacity-100 max-h-[2000px]'
            }`}>
              {filteredCategories.map((category) => (
                <div key={category.id}>
                  <h3 className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    {category.name}
                  </h3>
                  <div className="space-y-0.5">
                    {category.tools.map((tool) => {
                      const toolIndex = getToolIndexInFlattenedList(tool.id);
                      const isSelected = searchQuery && toolIndex === selectedToolIndex;

                      return (
                        <button
                          key={tool.id}
                          onClick={() => handleToolClick(tool.id)}
                          className={`w-full text-left px-2 py-1 rounded-md text-xs transition-colors duration-150 ${
                            toolId === tool.id
                              ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium'
                              : isSelected
                              ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200'
                          }`}
                        >
                          {tool.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-300 dark:border-gray-600 overflow-y-auto">
              <div className="p-3">
                {/* Search */}
                <div className="mb-3">
                  <div className="relative">
                    <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search tools..."
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-7 w-full text-xs h-7"
                      ref={mobileSearchRef}
                    />
                    {searchQuery && allFilteredTools.length > 0 && (
                      <ArrowRight className="absolute right-2 top-2 h-3.5 w-3.5 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Tool Categories */}
                <div className="space-y-3">
                  {filteredCategories.map((category) => (
                    <div key={category.id}>
                      <h3 className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                        {category.name}
                      </h3>
                      <div className="space-y-0.5">
                        {category.tools.map((tool) => {
                          const toolIndex = getToolIndexInFlattenedList(tool.id);
                          const isSelected = searchQuery && toolIndex === selectedToolIndex;

                          return (
                            <button
                              key={tool.id}
                              onClick={() => handleToolClick(tool.id)}
                              className={`w-full text-left px-2 py-1 rounded-md text-xs transition-colors duration-150 ${
                                toolId === tool.id
                                  ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium'
                                  : isSelected
                                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                              }`}
                            >
                              {tool.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {currentTool ? (
            <Tool key={clearTrigger} toolId={toolId!} />
          ) : (
            <div className="h-full flex items-start justify-center bg-gray-50 dark:bg-gray-900 p-4 pt-10">
              <div className="text-center max-w-xl">
                <div className="mb-6">
                  <Wrench className="mx-auto h-10 w-10 text-blue-500 dark:text-blue-400 mb-3" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Your One-Stop Utility Kit
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Choose a tool from the sidebar to get started.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1">Text & Data</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Convert, format, and manipulate data</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1">Code Tools</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Format, beautify, and convert code</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1">Web Utilities</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">URL parsing, encoding, and more</p>
                  </div>
                </div>

                <div className="mt-2 max-w-[200px] mx-auto space-y-2">
                  <h3 className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider text-center mb-3">Shortcuts</h3>
                  {[
                    { label: "Search Tools", keys: ["⌘", "K"] },
                    { label: "Toggle Sidebar", keys: ["⌘", "\\"] },
                    ...(isTauri ? [
                      { label: "Previous Tool", keys: ["⌘", "⇧", "{"] },
                      { label: "Next Tool", keys: ["⌘", "⇧", "}"] },
                    ] : []),
                  ].map(({ label, keys }) => (
                    <div key={label} className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{label}</span>
                      <div className="flex gap-1">
                        {keys.map((key, i) => (
                          <kbd key={i} className="min-w-[24px] h-6 flex items-center justify-center px-1.5 bg-gray-200 dark:bg-gray-700 rounded text-[11px] font-mono text-gray-600 dark:text-gray-300">{key}</kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
}
