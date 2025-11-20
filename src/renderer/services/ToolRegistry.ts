import { Tool } from "../types/dashboard";

/**
 * ToolRegistry manages the registration and retrieval of development tools
 */
export class ToolRegistry {
  private tools: Map<string, Tool> = new Map();

  /**
   * Register a new tool in the registry
   * @throws Error if tool with same ID already exists or if tool data is invalid
   */
  registerTool(tool: Tool): void {
    // Validate required fields
    if (!tool.id || typeof tool.id !== "string") {
      throw new Error("Tool must have a valid id");
    }
    if (!tool.name || typeof tool.name !== "string") {
      throw new Error("Tool must have a valid name");
    }
    if (!tool.description || typeof tool.description !== "string") {
      throw new Error("Tool must have a valid description");
    }
    if (!tool.icon || typeof tool.icon !== "string") {
      throw new Error("Tool must have a valid icon");
    }
    if (!Array.isArray(tool.category) || tool.category.length === 0) {
      throw new Error("Tool must have at least one category");
    }
    if (!tool.component) {
      throw new Error("Tool must have a component");
    }

    // Check for duplicate registration
    if (this.tools.has(tool.id)) {
      const error = `Tool with id "${tool.id}" is already registered`;
      if (process.env.NODE_ENV === "development") {
        throw new Error(error);
      } else {
        console.warn(error);
        return;
      }
    }

    this.tools.set(tool.id, tool);
  }

  /**
   * Unregister a tool from the registry
   */
  unregisterTool(toolId: string): void {
    this.tools.delete(toolId);
  }

  /**
   * Get a tool by its ID
   */
  getTool(toolId: string): Tool | undefined {
    return this.tools.get(toolId);
  }

  /**
   * Get all registered tools
   */
  getAllTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get tools by category
   */
  getToolsByCategory(category: string): Tool[] {
    return this.getAllTools().filter((tool) =>
      tool.category.includes(category)
    );
  }

  /**
   * Search tools by name or description (case-insensitive)
   */
  searchTools(query: string): Tool[] {
    if (!query || query.trim() === "") {
      return this.getAllTools();
    }

    const lowerQuery = query.toLowerCase();
    return this.getAllTools().filter(
      (tool) =>
        tool.name.toLowerCase().includes(lowerQuery) ||
        tool.description.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Clear all registered tools (useful for testing)
   */
  clear(): void {
    this.tools.clear();
  }

  /**
   * Get the count of registered tools
   */
  getToolCount(): number {
    return this.tools.size;
  }
}

// Export a singleton instance
export const toolRegistry = new ToolRegistry();
