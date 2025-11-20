import React from "react";
import { Category } from "../types/dashboard";
import "./CategoryFilter.css";

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
}) => {
  return (
    <div className="category-filter">
      {categories.map((category) => (
        <button
          key={category.id}
          className={`category-button ${
            selectedCategory === category.id ? "active" : ""
          }`}
          onClick={() => onCategorySelect(category.id)}
          aria-label={`Filter by ${category.name}`}
          aria-pressed={selectedCategory === category.id}
        >
          {category.name}
          <span className="category-count">
            {(category as Category & { toolCount?: number }).toolCount || 0}
          </span>
        </button>
      ))}
    </div>
  );
};
