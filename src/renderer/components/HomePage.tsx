import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { Tool, Category } from "../types/dashboard";
import { SearchBar } from "./SearchBar";
import { CategoryFilter } from "./CategoryFilter";
import { ToolCard } from "./ToolCard";
import { useToolStatuses } from "../hooks/useToolStatus";
import "./HomePage.css";

interface HomePageProps {
  tools: Tool[];
  pinnedToolIds: string[];
  recentlyUsedToolIds: string[];
  onToolSelect: (toolId: string) => void;
  onToolPin: (toolId: string) => void;
  onToolUnpin: (toolId: string) => void;
  onClearRecentlyUsed?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  tools,
  pinnedToolIds,
  recentlyUsedToolIds,
  onToolSelect,
  onToolPin,
  onToolUnpin,
  onClearRecentlyUsed,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [focusedToolIndex, setFocusedToolIndex] = useState<number>(0);
  const toolCardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Get tool statuses with reactive updates
  const toolStatuses = useToolStatuses();

  // Extract unique categories from tools
  const categories = useMemo(() => {
    const categoryMap = new Map<string, number>();

    tools.forEach((tool) => {
      tool.category.forEach((cat) => {
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
      });
    });

    const allCategory: Category & { toolCount: number } = {
      id: "all",
      name: "All",
      toolCount: tools.length,
    };

    const categoryList: (Category & { toolCount: number })[] = [allCategory];

    categoryMap.forEach((count, id) => {
      categoryList.push({
        id,
        name: id.charAt(0).toUpperCase() + id.slice(1),
        toolCount: count,
      });
    });

    return categoryList;
  }, [tools]);

  // Filter tools based on search and category
  const filteredTools = useMemo(() => {
    let result = tools;

    // Apply search filter
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (tool) =>
          tool.name.toLowerCase().includes(lowerQuery) ||
          tool.description.toLowerCase().includes(lowerQuery)
      );
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      result = result.filter((tool) =>
        tool.category.includes(selectedCategory)
      );
    }

    return result;
  }, [tools, searchQuery, selectedCategory]);

  // Get pinned tools
  const pinnedTools = useMemo(() => {
    return pinnedToolIds
      .map((id) => tools.find((tool) => tool.id === id))
      .filter((tool): tool is Tool => tool !== undefined);
  }, [pinnedToolIds, tools]);

  // Get recently used tools
  const recentlyUsedTools = useMemo(() => {
    return recentlyUsedToolIds
      .map((id) => tools.find((tool) => tool.id === id))
      .filter((tool): tool is Tool => tool !== undefined);
  }, [recentlyUsedToolIds, tools]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  // Get all visible tools in order (pinned, recently used, filtered)
  const allVisibleTools = useMemo(() => {
    const tools: Tool[] = [];

    // Add pinned tools
    pinnedTools.forEach((tool) => {
      if (!tools.find((t) => t.id === tool.id)) {
        tools.push(tool);
      }
    });

    // Add recently used tools
    recentlyUsedTools.forEach((tool) => {
      if (!tools.find((t) => t.id === tool.id)) {
        tools.push(tool);
      }
    });

    // Add filtered tools
    filteredTools.forEach((tool) => {
      if (!tools.find((t) => t.id === tool.id)) {
        tools.push(tool);
      }
    });

    return tools;
  }, [pinnedTools, recentlyUsedTools, filteredTools]);

  // Handle arrow key navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Cmd/Ctrl+H is handled globally, but we can also handle it here
      if ((e.metaKey || e.ctrlKey) && e.key === "h") {
        e.preventDefault();
        // Already on home, so this is a no-op
        return;
      }

      if (allVisibleTools.length === 0) return;

      const gridColumns = Math.floor(window.innerWidth / 270); // Approximate column count
      const totalTools = allVisibleTools.length;

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          setFocusedToolIndex((prev) => Math.min(prev + 1, totalTools - 1));
          break;
        case "ArrowLeft":
          e.preventDefault();
          setFocusedToolIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "ArrowDown":
          e.preventDefault();
          setFocusedToolIndex((prev) =>
            Math.min(prev + gridColumns, totalTools - 1)
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedToolIndex((prev) => Math.max(prev - gridColumns, 0));
          break;
        // Enter key is handled by ToolCard component directly
      }
    },
    [allVisibleTools, focusedToolIndex, onToolSelect]
  );

  // Focus the tool card when focusedToolIndex changes
  useEffect(() => {
    if (allVisibleTools[focusedToolIndex]) {
      const toolId = allVisibleTools[focusedToolIndex].id;
      const element = toolCardRefs.current.get(toolId);
      if (element) {
        element.focus();
      }
    }
  }, [focusedToolIndex, allVisibleTools]);

  // Register tool card ref
  const registerToolCardRef = useCallback(
    (toolId: string, element: HTMLDivElement | null) => {
      if (element) {
        toolCardRefs.current.set(toolId, element);
      } else {
        toolCardRefs.current.delete(toolId);
      }
    },
    []
  );

  // Get current date
  const currentDate = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  return (
    <div className="home-page" onKeyDown={handleKeyDown}>
      <header className="home-header">
        <div className="header-title">
          <time className="current-date" dateTime={new Date().toISOString()}>
            {currentDate}
          </time>
          <h1>Bemind Dev Tools</h1>
        </div>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={handleClearSearch}
        />
      </header>

      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />

      {pinnedTools.length > 0 && (
        <section className="tools-section">
          <h2>Pinned Tools</h2>
          <div className="tools-grid">
            {pinnedTools.map((tool) => (
              <ToolCard
                key={tool.id}
                ref={(el) => registerToolCardRef(tool.id, el)}
                tool={tool}
                isPinned={true}
                isRecentlyUsed={recentlyUsedToolIds.includes(tool.id)}
                status={toolStatuses.get(tool.id)}
                notificationCount={toolStatuses.get(tool.id)?.notificationCount}
                onSelect={() => onToolSelect(tool.id)}
                onPin={() => onToolPin(tool.id)}
                onUnpin={() => onToolUnpin(tool.id)}
              />
            ))}
          </div>
        </section>
      )}

      {recentlyUsedTools.length > 0 && (
        <section className="tools-section">
          <div className="section-header">
            <h2>Recently Used</h2>
            {onClearRecentlyUsed && (
              <button
                className="clear-history-button"
                onClick={onClearRecentlyUsed}
                aria-label="Clear recently used history"
              >
                Clear History
              </button>
            )}
          </div>
          <div className="tools-grid">
            {recentlyUsedTools.map((tool) => (
              <ToolCard
                key={tool.id}
                ref={(el) => registerToolCardRef(tool.id, el)}
                tool={tool}
                isPinned={pinnedToolIds.includes(tool.id)}
                isRecentlyUsed={true}
                status={toolStatuses.get(tool.id)}
                notificationCount={toolStatuses.get(tool.id)?.notificationCount}
                onSelect={() => onToolSelect(tool.id)}
                onPin={() => onToolPin(tool.id)}
                onUnpin={() => onToolUnpin(tool.id)}
              />
            ))}
          </div>
        </section>
      )}

      <section className="tools-section">
        <h2>All Tools</h2>
        {/* Screen reader announcement for search results */}
        <div
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {searchQuery &&
            `${filteredTools.length} tool${
              filteredTools.length !== 1 ? "s" : ""
            } found`}
        </div>
        {filteredTools.length === 0 ? (
          <div className="empty-state" role="status">
            <p>No tools found</p>
          </div>
        ) : (
          <div className="tools-grid">
            {filteredTools.map((tool) => (
              <ToolCard
                key={tool.id}
                ref={(el) => registerToolCardRef(tool.id, el)}
                tool={tool}
                isPinned={pinnedToolIds.includes(tool.id)}
                isRecentlyUsed={recentlyUsedToolIds.includes(tool.id)}
                status={toolStatuses.get(tool.id)}
                notificationCount={toolStatuses.get(tool.id)?.notificationCount}
                onSelect={() => onToolSelect(tool.id)}
                onPin={() => onToolPin(tool.id)}
                onUnpin={() => onToolUnpin(tool.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
